import Parser from "rss-parser";
import type { RssKaynak } from "./kaynaklar.js";

export interface HamHaber {
  tip: "rss";
  baslik: string;
  ozet: string;
  url: string;
  kaynak: string;
  yayinTarihi: string;
  resim?: string;
}

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "ToggRehberim-ContentBot/1.0 (+https://www.toggrehberim.com)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

export async function rssTara(
  kaynak: RssKaynak,
  kelimeler: string[],
  sonDakika = 10080 // varsayılan: 1 hafta
): Promise<HamHaber[]> {
  try {
    console.log(`  → ${kaynak.ad} taranıyor...`);
    const feed = await parser.parseURL(kaynak.url);

    const sinirTarihi = new Date(Date.now() - sonDakika * 60 * 1000);

    return feed.items
      .filter((item) => {
        // Tarih filtresi
        if (item.pubDate) {
          const tarih = new Date(item.pubDate);
          if (tarih < sinirTarihi) return false;
        }
        // Togg alaka filtresi
        const metin = (
          (item.title || "") +
          " " +
          (item.contentSnippet || "") +
          " " +
          (item.content || "")
        ).toLowerCase();
        return kelimeler.some((k) => metin.includes(k.toLowerCase()));
      })
      .map((item) => ({
        tip: "rss" as const,
        baslik: temizle(item.title || ""),
        ozet: temizle(item.contentSnippet || item.summary || "").slice(0, 500),
        url: item.link || "",
        kaynak: kaynak.ad,
        yayinTarihi: item.pubDate
          ? new Date(item.pubDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        resim: resimiCikar(item),
      }));
  } catch (err) {
    console.warn(`  ✗ ${kaynak.ad} RSS hatası:`, (err as Error).message);
    return [];
  }
}

function temizle(metin: string): string {
  return metin
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resimiCikar(item: any): string | undefined {
  return (
    item["media:content"]?.["$"]?.url ||
    item["media:thumbnail"]?.["$"]?.url ||
    item.enclosure?.url ||
    undefined
  );
}
