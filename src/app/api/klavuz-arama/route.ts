import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export interface KlavuzAramaSonucu {
  id: number;
  kaynak: string;
  bolum: string | null;
  baslik: string | null;
  icerik: string;
  sayfa: number | null;
  ilgili_sembol_id: string | null;
  anahtar_kelimeler: string[];
  rank: number;
  snippet: string; // Arama terimi etrafındaki metin parçası
}

export interface KlavuzAramaYaniti {
  sonuclar: KlavuzAramaSonucu[];
  toplam: number;
  sorgu: string;
}

// GET /api/klavuz-arama?q=...&limit=10&kaynak=...
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ sonuclar: [], toplam: 0, sorgu: "" } satisfies KlavuzAramaYaniti);
  }

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "15"), 50);
  const kaynak = searchParams.get("kaynak") ?? null;

  if (!q || q.length < 2) {
    return NextResponse.json({ sonuclar: [], toplam: 0, sorgu: q } satisfies KlavuzAramaYaniti);
  }

  const supabase = createServiceClient(url, key);

  // PostgreSQL full-text search ile sorgula
  // simple config: dil bağımsız (Türkçe için en iyi seçenek)
  const tsQuery = q
    .split(/\s+/)
    .filter(Boolean)
    .map((kelime) => `${kelime}:*`)
    .join(" & ");

  let query = supabase
    .from("klavuz_chunks")
    .select("id, kaynak, bolum, baslik, icerik, sayfa, ilgili_sembol_id, anahtar_kelimeler")
    .textSearch("search_vector", tsQuery, { config: "simple", type: "websearch" })
    .limit(limit);

  if (kaynak) query = query.eq("kaynak", kaynak);

  const { data, error } = await query;

  if (error) {
    console.error("Klavuz arama hatası:", error);
    return NextResponse.json({ sonuclar: [], toplam: 0, sorgu: q } satisfies KlavuzAramaYaniti);
  }

  // Snippet oluştur: arama terimi etrafında 150 karakter
  const sonuclar: KlavuzAramaSonucu[] = (data ?? []).map((row, i) => {
    const snippet = olusturSnippet(row.icerik, q, 160);
    return {
      ...row,
      anahtar_kelimeler: row.anahtar_kelimeler ?? [],
      rank: i + 1,
      snippet,
    };
  });

  return NextResponse.json({
    sonuclar,
    toplam: sonuclar.length,
    sorgu: q,
  } satisfies KlavuzAramaYaniti);
}

function olusturSnippet(icerik: string, sorgu: string, uzunluk: number): string {
  const normalIcerik = icerik.replace(/\s+/g, " ").trim();
  const ilkKelime = sorgu.split(/\s+/)[0].toLowerCase();
  const idx = normalIcerik.toLowerCase().indexOf(ilkKelime);
  if (idx === -1) return normalIcerik.slice(0, uzunluk) + (normalIcerik.length > uzunluk ? "…" : "");

  const baslangic = Math.max(0, idx - 60);
  const bitis = Math.min(normalIcerik.length, idx + uzunluk - 60);
  const parca = normalIcerik.slice(baslangic, bitis);
  return (baslangic > 0 ? "…" : "") + parca + (bitis < normalIcerik.length ? "…" : "");
}
