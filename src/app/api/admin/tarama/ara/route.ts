import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const YIL = new Date().getFullYear();
const ARAMA_SORGULARI = {
  togg_resmi: [
    `Togg T10X T10F güncelleme duyuru ${YIL}`,
    `Togg OTA yazılım güncelleme ${YIL}`,
  ],
  togg_forum: [
    "site:donanimhaber.com Togg T10X T10F sorun",
    "site:donanimhaber.com Togg şarj batarya",
    "Togg forum kullanıcı sorunu çözüm",
  ],
  togg_sorun: [
    "Togg T10X T10F arıza hata kullanıcı şikayet",
    "Togg şarj istasyonu sorun arıza",
  ],
  ev_dunya: [
    `electric vehicle battery technology ${YIL}`,
    "EV fast charging news update",
  ],
  tr_genel: [
    "elektrikli araç bakım ipuçları menzil",
  ],
};

export interface AramaSonucu {
  baslik: string;
  url: string;
  ozet: string;
  icerik: string;
  kaynak: string;
  dil: "tr" | "en";
  puan: number;
  konu: string;
  tur: "haber_yap" | "rehber_yap" | "gozlemle" | "alakasiz";
}

export interface AramaYaniti {
  sonuclar: AramaSonucu[];
  sentiment: { skor: number; ozet: string } | null;
}

async function tavilyAra(sorgu: string): Promise<AramaSonucu[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query: sorgu,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
      include_raw_content: false,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];
  const data = await res.json();

  return (data.results ?? []).map((r: { title: string; url: string; content: string }) => ({
    baslik: r.title,
    url: r.url,
    ozet: r.content?.slice(0, 200) || "",
    icerik: r.content?.slice(0, 1500) || "",
    kaynak: new URL(r.url).hostname.replace("www.", ""),
    dil: /[çğışöüÇĞİŞÖÜ]/.test(r.title + r.content) ? "tr" : "en",
    puan: 0,
    konu: sorgu,
    tur: "gozlemle" as const,
  }));
}

export async function POST(req: NextRequest) {
  const { konu } = await req.json();

  const secilenSorgular = konu
    ? [konu]
    : [
        ...ARAMA_SORGULARI.togg_resmi,
        ...ARAMA_SORGULARI.togg_forum,
        ...ARAMA_SORGULARI.togg_sorun,
        ...ARAMA_SORGULARI.ev_dunya,
        ...ARAMA_SORGULARI.tr_genel,
      ];

  const tumSonuclar = (
    await Promise.allSettled(secilenSorgular.map(tavilyAra))
  )
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<AramaSonucu[]>).value);

  const teksilSonuclar = Array.from(
    new Map(tumSonuclar.map((s) => [s.url, s])).values()
  );

  if (teksilSonuclar.length === 0) {
    return NextResponse.json({ hata: "Tavily sonuç döndürmedi. API key Vercel'e eklendi mi?" }, { status: 500 });
  }

  // Claude: puan + kategori + sentiment — tek seferde
  let sentiment: { skor: number; ozet: string } | null = null;
  try {
    const prompt = `Aşağıdaki içerikleri toggrehberim.com (Togg T10X/T10F kullanıcı rehber portalı) için değerlendir.

Her içerik için şunu belirle:
- puan: 1-10 (alaka skoru)
- tur: "haber_yap" (önemli duyuru/gelişme) | "rehber_yap" (kullanıcıya faydalı pratik bilgi/sorun çözümü) | "gozlemle" (genel ilgi) | "alakasiz"
- konu: kısa etiket (sarj/yazilim/bakim/suruculuk/haber)

Son olarak genel Togg sentiment ver:
- sentiment_skor: -10 ile +10 arası (negatif=sorun haberleri hakim, pozitif=iyi haberler)
- sentiment_ozet: tek cümle Türkçe

İçerikler:
${teksilSonuclar.map((s, i) => `[${i}] ${s.baslik}\n${s.ozet.slice(0, 100)}`).join("\n\n")}

Sadece JSON:
{
  "sonuclar": [{"index":0,"puan":7,"tur":"haber_yap","konu":"yazilim"},...],
  "sentiment": {"skor": 3, "ozet": "OTA güncellemesi olumlu karşılandı, şarj sorunları gündemde"}
}`;

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      (parsed.sonuclar ?? []).forEach((s: { index: number; puan: number; tur: AramaSonucu["tur"]; konu: string }) => {
        if (teksilSonuclar[s.index]) {
          teksilSonuclar[s.index].puan = s.puan ?? 5;
          teksilSonuclar[s.index].tur = s.tur ?? "gozlemle";
          if (s.konu) teksilSonuclar[s.index].konu = s.konu;
        }
      });
      if (parsed.sentiment) {
        sentiment = { skor: parsed.sentiment.skor, ozet: parsed.sentiment.ozet };
      }
    }
  } catch {
    teksilSonuclar.forEach((s) => { s.puan = 5; });
  }

  // Alakasız olanları filtrele, kalanı sırala
  const filtreli = teksilSonuclar
    .filter((s) => s.tur !== "alakasiz" && s.puan >= 3)
    .sort((a, b) => b.puan - a.puan);

  return NextResponse.json({ sonuclar: filtreli, sentiment } satisfies AramaYaniti);
}
