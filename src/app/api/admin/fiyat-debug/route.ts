import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as cheerio from "cheerio";

/** GET /api/admin/fiyat-debug?url=...&selector=...
 *  Gerçek HTML'i çeker, selector sonucunu + sayfa metnini döner. Admin only. */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const selector = searchParams.get("selector") ?? "";

  if (!url) return NextResponse.json({ error: "url parametresi gerekli" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
        "Referer": new URL(url).origin + "/",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `HTTP ${res.status}` }, { status: 200 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Selector sonucu
    let selectorSonuc = null;
    let selectorAdet = 0;
    if (selector) {
      const els = $(selector);
      selectorAdet = els.length;
      selectorSonuc = els.first().text().trim().slice(0, 200);
    }

    // Tüm class isimlerini topla
    const classler = new Set<string>();
    $("[class]").each((_, el) => {
      const cls = $(el).attr("class") ?? "";
      cls.split(/\s+/).forEach((c) => c && classler.add(c));
    });

    // Sayfa düz metni (fiyat rakamları için)
    const sayfaMetni = $("body").text().replace(/\s+/g, " ").trim().slice(0, 3000);

    // Ham HTML ilk 5000 karakter
    const hamHtml = html.slice(0, 5000);

    return NextResponse.json({
      httpDurum: res.status,
      htmlUzunluk: html.length,
      selector: selector || null,
      selectorSonuc,
      selectorAdet,
      classler: Array.from(classler).slice(0, 100),
      sayfaMetni,
      hamHtmlBaslangic: hamHtml,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 200 });
  }
}
