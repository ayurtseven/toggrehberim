import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Sitanin perspektifi: Togg T10X/T10F sahipleri için rehber portalı
const ARAMA_SORGULARI = {
  togg: [
    "Togg T10X T10F yeni özellik güncelleme 2025",
    "Togg elektrikli araç şarj batarya",
  ],
  ev_dunya: [
    "electric vehicle battery technology 2025",
    "EV fast charging solid state battery",
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
    return NextResponse.json({ hata: "Tavily sonuç döndürmedi. API key Vercel'e eklendi mi?" }, { status: 500 });
  }

  // Claude ile alaka puanı ver — başarısız olursa tüm sonuçları göster
  try {
    const skorlamaPrompt = `Aşağıdaki makaleleri toggrehberim.com için değerlendir.
Site: Togg T10X/T10F sahipleri için Türkçe rehber portalı.

Her makale için 1-10 puan ver (1=alakasız, 10=çok alakalı).
Togg haberleri ve EV teknolojisi 5+ puan almalı.

${teksilSonuclar.map((s, i) => `[${i}] ${s.baslik}`).join("\n")}

Sadece JSON: [{"index":0,"puan":7,"konu":"sarj"}, ...]`;

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: skorlamaPrompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const skorlar: { index: number; puan: number; konu: string }[] = JSON.parse(jsonMatch[0]);
      skorlar.forEach(({ index, puan, konu }) => {
        if (teksilSonuclar[index]) {
          teksilSonuclar[index].puan = puan;
          if (konu) teksilSonuclar[index].konu = konu;
        }
      });
    }
  } catch {
    // Skorlama başarısız — tüm sonuçları 5 puanla göster
    teksilSonuclar.forEach((s) => { s.puan = 5; });
  }

  // Puana göre sırala, hepsini döndür
  teksilSonuclar.sort((a, b) => b.puan - a.puan);
  return NextResponse.json(teksilSonuclar);
}
