import { NextRequest, NextResponse } from "next/server";

export interface RssHaber {
  baslik: string;
  url: string;
  ozet: string;
  tarih: string;
  kaynak_adi: string;
  kaynak_tur: string;
}

const KAYNAKLAR = [
  {
    ad: "Togg Resmi",
    tur: "web",
    rss: "https://www.togg.com.tr/feed",
  },
  {
    ad: "ShiftDelete",
    tur: "web",
    rss: "https://shiftdelete.net/feed?tag=togg",
  },
  {
    ad: "Webtekno",
    tur: "web",
    rss: "https://www.webtekno.com/tag/togg/feed",
  },
  {
    ad: "Chip Online",
    tur: "web",
    rss: "https://www.chip.com.tr/tag/togg/feed",
  },
  {
    ad: "DonanımHaber",
    tur: "web",
    rss: "https://forum.donanimhaber.com/togg--129892?v=rss",
  },
  {
    ad: "Oto Testler",
    tur: "web",
    rss: "https://ototestler.com/tag/togg/feed",
  },
];

function rssItemleriCikar(xml: string, kaynak_adi: string, kaynak_tur: string): RssHaber[] {
  const itemler: RssHaber[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const baslik = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/i);
    const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>|<link[^>]*\/>/i);
    const desc = item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/i);
    const pubDate = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

    const baslikMetin = (baslik?.[1] || baslik?.[2] || "").trim();
    const linkMetin = (link?.[1] || "").trim();
    const descMetin = (desc?.[1] || desc?.[2] || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 200);
    const tarih = pubDate?.[1]?.trim() || "";

    if (baslikMetin && linkMetin) {
      itemler.push({
        baslik: baslikMetin,
        url: linkMetin,
        ozet: descMetin,
        tarih,
        kaynak_adi,
        kaynak_tur,
      });
    }
    if (itemler.length >= 5) break; // her kaynaktan max 5
  }

  return itemler;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";

  const sonuclar = await Promise.allSettled(
    KAYNAKLAR.map(async (k) => {
      const res = await fetch(k.rss, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ToggRehberim/1.0)" },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 1800 }, // 30 dk cache
      });
      if (!res.ok) throw new Error(`${k.ad}: ${res.status}`);
      const xml = await res.text();
      return rssItemleriCikar(xml, k.ad, k.tur);
    })
  );

  const haberler: RssHaber[] = [];
  for (const r of sonuclar) {
    if (r.status === "fulfilled") haberler.push(...r.value);
  }

  // Anahtar kelime filtresi
  const filtrelenmis = q
    ? haberler.filter(
        (h) =>
          h.baslik.toLowerCase().includes(q) ||
          h.ozet.toLowerCase().includes(q)
      )
    : haberler;

  // Tarihe göre sırala
  filtrelenmis.sort((a, b) => {
    const ta = a.tarih ? new Date(a.tarih).getTime() : 0;
    const tb = b.tarih ? new Date(b.tarih).getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json(filtrelenmis);
}
