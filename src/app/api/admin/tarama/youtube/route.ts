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

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  const videoId = videoIdCikar(url?.trim() || "");
  if (!videoId) {
    return NextResponse.json({ hata: "Geçerli bir YouTube URL'si değil." }, { status: 400 });
  }

  // Transkript çek
  let transkript = "";
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "tr" })
      .catch(() => YoutubeTranscript.fetchTranscript(videoId, { lang: "en" }))
      .catch(() => YoutubeTranscript.fetchTranscript(videoId));

    transkript = segments
      .map((s) => s.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .slice(0, 6000);
  } catch {
    return NextResponse.json(
      { hata: "Bu video için altyazı/transkript bulunamadı. Kapalı altyazı içeren videolar deneyin." },
      { status: 400 }
    );
  }

  if (transkript.length < 100) {
    return NextResponse.json({ hata: "Transkript çok kısa." }, { status: 400 });
  }

  // Video başlığını çek (oembed ile)
  let videoBaslik = "";
  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`
    );
    if (oembed.ok) {
      const d = await oembed.json();
      videoBaslik = d.title || "";
    }
  } catch { /* başlık opsiyonel */ }

  // Claude ile özgün MDX içerik üret
  const prompt = `Sen Türkiye'nin yerli elektrikli aracı Togg için içerik editörüsün.
Aşağıdaki YouTube video transkriptini analiz et ve toggrehberim.com için ÖZGÜN Türkçe içerik üret.

VİDEO BAŞLIĞI: ${videoBaslik}
VİDEO ID: ${videoId}
KAYNAK: https://youtube.com/watch?v=${videoId}

TRANSKRİPT:
${transkript}

Kurallar:
- Transkripti birebir çevirmek YASAK — özgün, okunaklı makale yaz
- Togg T10X/T10F sahipleri için pratik çıkarımları öne çıkar
- Türkçe teknik terimleri doğru kullan
- Video kaynağına atıfta bulun (kaynak kısmında)
- İçerik bilgilendirici ve faydalı olsun

Çıktıyı JSON:
{
  "baslik": "SEO başlığı (60 kar altı)",
  "ozet": "Meta description (150 kar altı)",
  "kategori": "sarj | yazilim | bakim | suruculuk | sss | haber",
  "model": "t10x | t10f | hepsi",
  "etiketler": ["etiket1", "etiket2"],
  "mdx": "---\\nbaslik: \\"BAŞLIK\\"\\nozet: \\"ÖZET\\"\\nkategori: KATEGORİ\\nmodel: MODEL\\netiketler: [...]\\ntarih: ${new Date().toISOString().slice(0, 10)}\\nsure: DAKIKA\\nkaynak: \\"https://youtube.com/watch?v=${videoId}\\"\\n---\\n\\n## Giriş\\n\\n...\\n\\n## Detaylar\\n\\n...\\n\\n> Kaynak: [${videoBaslik || "YouTube"}](https://youtube.com/watch?v=${videoId})"
}

Sadece JSON yaz.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON yok");
    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      ...parsed,
      video_id: videoId,
      video_url: `https://youtube.com/watch?v=${videoId}`,
      video_baslik: videoBaslik,
      kaynak_tur: "youtube",
      kaynak_adi: "YouTube",
    });
  } catch {
    return NextResponse.json({ hata: "AI içerik oluşturamadı." }, { status: 500 });
  }
}
