import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Sitanin perspektifi: Togg T10X/T10F sahipleri için rehber portalı
const ARAMA_SORGULARI = {
  togg: [
    "Togg T10X T10F yeni özellik güncelleme 2024 2025",
    "Togg elektrikli araç şarj batarya sorun çözüm",
    "Togg yazılım OTA güncelleme T-UI",
  ],
  ev_dunya: [
    "electric vehicle battery technology breakthrough 2025",
    "EV charging infrastructure fast charging innovation",
    "solid state battery electric car range improvement",
    "electric vehicle software update over-the-air features",
  ],
  tr_genel: [
    "elektrikli araç batarya ömrü bakım ipuçları",
    "elektrikli araç kış performansı menzil",
  ],
};

export interface AramaSonucu {
  baslik: string;
  url: string;
  ozet: string;
  icerik: string;
  kaynak: string;
  dil: "tr" | "en";
  puan: number; // 0-10 alaka skoru
  konu: string;
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
  }));
}

export async function POST(req: NextRequest) {
  const { konu } = await req.json(); // opsiyonel özel sorgu

  // Arama sorgularını belirle
  const secilenSorgular = konu
    ? [konu]
    : [
        ...ARAMA_SORGULARI.togg,
        ...ARAMA_SORGULARI.ev_dunya,
        ...ARAMA_SORGULARI.tr_genel,
      ];

  // Paralel ara
  const tumSonuclar = (
    await Promise.allSettled(secilenSorgular.map(tavilyAra))
  )
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<AramaSonucu[]>).value);

  // URL tekrarlarını kaldır
  const teksilSonuclar = Array.from(
    new Map(tumSonuclar.map((s) => [s.url, s])).values()
  );

  if (teksilSonuclar.length === 0) {
    return NextResponse.json({ hata: "Sonuç bulunamadı. TAVILY_API_KEY ayarlandı mı?" }, { status: 500 });
  }

  // Claude ile alaka/haber değeri skorla
  const skorlamaPrompt = `Aşağıdaki makaleleri toggrehberim.com sitesi için değerlendir.

Site perspektifi: Togg T10X ve T10F sahibi Türk kullanıcılar için rehber portalı.
Kullanıcı profili: Aracını aktif kullanan, teknik merak eden, şarj/yazılım/bakım konularında bilgi arayan Togg sahipleri.

Her makale için 0-10 arası alaka puanı ver:
- 8-10: Togg sahipleri için doğrudan faydalı (şarj, yazılım, bakım, yeni özellik)
- 5-7: EV dünyasından ilgili bilgi (batarya teknolojisi, şarj altyapısı)
- 2-4: Genel EV haberi, dolaylı ilgi
- 0-1: Alakasız

Makaleler:
${teksilSonuclar.map((s, i) => `[${i}] ${s.baslik}\n${s.ozet}`).join("\n\n")}

JSON dizisi döndür: [{"index": 0, "puan": 8, "konu_etiketi": "şarj"}, ...]
Sadece JSON yaz.`;

  let skorlar: { index: number; puan: number; konu_etiketi: string }[] = [];
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: skorlamaPrompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) skorlar = JSON.parse(jsonMatch[0]);
  } catch {
    // Skorlama başarısız olsa bile devam et
  }

  // Puanları uygula
  skorlar.forEach(({ index, puan, konu_etiketi }) => {
    if (teksilSonuclar[index]) {
      teksilSonuclar[index].puan = puan;
      teksilSonuclar[index].konu = konu_etiketi || teksilSonuclar[index].konu;
    }
  });

  // Puana göre sırala, 3 altını filtrele
  const filtrelenmis = teksilSonuclar
    .filter((s) => s.puan >= 3)
    .sort((a, b) => b.puan - a.puan);

  return NextResponse.json(filtrelenmis);
}
