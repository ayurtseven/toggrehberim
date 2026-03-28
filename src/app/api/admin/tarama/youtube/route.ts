import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { YoutubeTranscript } from "youtube-transcript";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function videoIdCikar(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Sırayla dil kodlarını dene
async function transkriptGetir(videoId: string): Promise<string> {
  const dilKodlari = ["tr", "en", "a.tr", "a.en", ""];

  for (const lang of dilKodlari) {
    try {
      const opts = lang ? { lang } : undefined;
      const segments = await YoutubeTranscript.fetchTranscript(videoId, opts);
      if (segments && segments.length > 0) {
        return segments
          .map((s) => s.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .slice(0, 6000)
          .trim();
      }
    } catch {
      continue;
    }
  }
  return "";
}

// YouTube sayfasından açıklama çek (fallback)
async function videoAciklamaGetir(videoId: string): Promise<string> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ToggRehberim/1.0)",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    // og:description meta tag
    const ogDesc = html.match(/<meta\s+(?:name|property)="og:description"\s+content="([^"]+)"/i)?.[1];
    if (ogDesc && ogDesc.length > 50) return decodeHTMLEntities(ogDesc);

    // description meta
    const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
    if (metaDesc && metaDesc.length > 50) return decodeHTMLEntities(metaDesc);
  } catch { /* ignore */ }
  return "";
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  const videoId = videoIdCikar(url?.trim() || "");
  if (!videoId) {
    return NextResponse.json({ hata: "Geçerli bir YouTube URL'si değil." }, { status: 400 });
  }

  // Video meta (başlık + kanal)
  let videoBaslik = "";
  let videoAciklama = "";
  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`
    );
    if (oembed.ok) {
      const d = await oembed.json();
      videoBaslik = d.title || "";
    }
  } catch { /* opsiyonel */ }

  // Önce transkript dene
  let icerik = await transkriptGetir(videoId);
  let icerikKaynagi = "transkript";

  // Transkript yoksa açıklama çek
  if (!icerik || icerik.length < 80) {
    videoAciklama = await videoAciklamaGetir(videoId);
    if (videoAciklama.length > 50) {
      icerik = videoAciklama;
      icerikKaynagi = "açıklama";
    }
  }

  // İkisi de yoksa sadece başlıkla devam et
  if (!icerik || icerik.length < 30) {
    if (!videoBaslik) {
      return NextResponse.json(
        { hata: "Bu video için içerik çekilemedi (transkript yok, açıklama yok)." },
        { status: 400 }
      );
    }
    icerik = `Video başlığı: ${videoBaslik}`;
    icerikKaynagi = "başlık";
  }

  // Claude ile özgün MDX içerik üret
  const icerikBilgisi = icerikKaynagi === "transkript"
    ? `TRANSKRİPT:\n${icerik}`
    : icerikKaynagi === "açıklama"
    ? `VİDEO AÇIKLAMASI:\n${icerik}\n\n(Not: Bu video için transkript bulunamadı, açıklamadan içerik üretiliyor.)`
    : `(Transkript ve açıklama bulunamadı — sadece başlıktan içerik üret)`;

  const prompt = `Sen Türkiye'nin yerli elektrikli aracı Togg için içerik editörüsün.
Aşağıdaki YouTube video içeriğini analiz et ve toggrehberim.com için ÖZGÜN Türkçe içerik üret.

VİDEO BAŞLIĞI: ${videoBaslik}
KAYNAK: https://youtube.com/watch?v=${videoId}

${icerikBilgisi}

Kurallar:
- İçeriği birebir çevirmek YASAK — özgün, okunaklı makale yaz
- Togg T10X/T10F sahipleri için pratik çıkarımları öne çıkar
- Türkçe teknik terimleri doğru kullan

Şu JSON formatında yanıt ver (MDX alanı YOK, sadece metin):
{"baslik":"SEO başlığı max 60 karakter","ozet":"meta description max 150 karakter","kategori":"sarj veya yazilim veya bakim veya suruculuk veya sss veya haber","model":"t10x veya t10f veya hepsi","etiketler":["etiket1","etiket2"],"giris":"Giriş paragrafı","bolumler":[{"baslik":"Bölüm Başlığı","icerik":"Bölüm içeriği"}]}

Sadece tek satır JSON yaz, içinde satır sonu karakteri kullanma.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";

    // JSON bloğunu çıkar
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON bulunamadı: " + text.slice(0, 200));

    let ai: { baslik: string; ozet: string; kategori: string; model: string; etiketler?: string[]; giris?: string; bolumler?: { baslik: string; icerik: string }[] };
    try {
      ai = JSON.parse(jsonMatch[0]);
    } catch {
      ai = {
        baslik: text.match(/"baslik"\s*:\s*"([^"]+)"/)?.[1] ?? videoBaslik ?? "Video İçeriği",
        ozet: text.match(/"ozet"\s*:\s*"([^"]+)"/)?.[1] ?? "",
        kategori: text.match(/"kategori"\s*:\s*"([^"]+)"/)?.[1] ?? "haber",
        model: text.match(/"model"\s*:\s*"([^"]+)"/)?.[1] ?? "hepsi",
        giris: icerik.slice(0, 500),
      };
    }

    // MDX'i burada oluştur
    const tarih = new Date().toISOString().slice(0, 10);
    const etiketStr = ai.etiketler?.length ? `[${ai.etiketler.map((e) => `"${e}"`).join(", ")}]` : '[]';
    const bolumlerMdx = (ai.bolumler ?? [])
      .map((b) => `## ${b.baslik}\n\n${b.icerik}`)
      .join("\n\n");
    const mdx = [
      `---`,
      `baslik: "${ai.baslik}"`,
      `ozet: "${ai.ozet}"`,
      `kategori: ${ai.kategori}`,
      `model: ${ai.model}`,
      `etiketler: ${etiketStr}`,
      `tarih: ${tarih}`,
      `sure: 5`,
      `kaynak: "https://youtube.com/watch?v=${videoId}"`,
      `---`,
      ``,
      ai.giris ?? "",
      ``,
      bolumlerMdx,
      ``,
      `> Kaynak: [${videoBaslik || "YouTube"}](https://youtube.com/watch?v=${videoId})`,
    ].join("\n");

    return NextResponse.json({
      baslik: ai.baslik,
      ozet: ai.ozet,
      kategori: ai.kategori,
      model: ai.model,
      mdx,
      video_id: videoId,
      video_url: `https://youtube.com/watch?v=${videoId}`,
      video_baslik: videoBaslik,
      icerik_kaynagi: icerikKaynagi,
      kaynak_tur: "youtube",
      kaynak_adi: "YouTube",
    });
  } catch (err) {
    const mesaj = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ hata: `AI içerik oluşturamadı: ${mesaj}` }, { status: 500 });
  }
}
