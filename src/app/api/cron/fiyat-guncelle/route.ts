import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Tipler ──────────────────────────────────────────────────────────────────
interface TarifeSatiri {
  id: string;
  fiyat: string | null;
  tarife_url: string | null;
  css_selector: string | null;
}

type SonucTipi = "guncellendi" | "degismedi" | "hata" | "selector_bulunamadi" | "url_yok";

interface ScrapesonucItem {
  id: string;
  sonuc: SonucTipi;
  eski?: string;
  yeni?: string;
  hata?: string;
}

// ─── Yardımcılar ─────────────────────────────────────────────────────────────

/** HTML sayfasını indir, cheerio ile parse et */
async function sayfaCek(url: string): Promise<cheerio.CheerioAPI | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ToggRehberimBot/1.0; +https://toggrehberim.com)",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return cheerio.load(html);
  } catch {
    return null;
  }
}

/**
 * CSS selector ile sayfadan fiyat metnini ayıkla.
 * Sayıyı normalize et: "8,50 TL/kWh" → "8.50"
 */
function fiyatAyikla($: cheerio.CheerioAPI, selector: string): string | null {
  const el = $(selector).first();
  if (!el.length) return null;

  const ham = el.text().trim();
  // Sayısal değeri çıkar: virgülü nokta yap, TL/kWh gibi birimleri at
  const esles = ham.replace(",", ".").match(/\d+\.?\d*/);
  return esles ? esles[0] : null;
}

// ─── Ana işleyici ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Güvenlik: Vercel cron veya CRON_SECRET header kontrolü
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Tüm aktif tarife satırlarını çek
  const { data: satirlar, error: fetchHata } = await supabase
    .from("sarj_fiyatlari")
    .select("id, fiyat, tarife_url, css_selector")
    .not("tarife_url", "is", null)
    .eq("gizli", false);

  if (fetchHata || !satirlar) {
    return NextResponse.json(
      { error: "Veritabanı hatası", detay: fetchHata?.message },
      { status: 500 }
    );
  }

  const aktifSatirlar = satirlar as TarifeSatiri[];
  const sonuclar: ScrapesonucItem[] = [];

  // Her URL'yi bir kez çek (aynı URL'yi birden fazla row paylaşıyor olabilir)
  const urlCache = new Map<string, cheerio.CheerioAPI | null>();

  for (const satir of aktifSatirlar) {
    if (!satir.tarife_url) {
      sonuclar.push({ id: satir.id, sonuc: "url_yok" });
      continue;
    }
    if (!satir.css_selector) {
      sonuclar.push({ id: satir.id, sonuc: "hata", hata: "css_selector tanımlı değil" });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: new Date().toISOString(),
        otomatik_kontrol_sonucu: "hata",
      }).eq("id", satir.id);
      continue;
    }

    // Sayfa önbelleği
    if (!urlCache.has(satir.tarife_url)) {
      urlCache.set(satir.tarife_url, await sayfaCek(satir.tarife_url));
    }
    const $ = urlCache.get(satir.tarife_url)!;

    if (!$) {
      sonuclar.push({ id: satir.id, sonuc: "hata", hata: "Sayfa indirilemedi" });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: new Date().toISOString(),
        otomatik_kontrol_sonucu: "hata",
      }).eq("id", satir.id);
      continue;
    }

    const bulunanFiyat = fiyatAyikla($, satir.css_selector);

    if (!bulunanFiyat) {
      sonuclar.push({ id: satir.id, sonuc: "selector_bulunamadi" });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: new Date().toISOString(),
        otomatik_kontrol_sonucu: "selector_bulunamadi",
      }).eq("id", satir.id);
      continue;
    }

    const mevcutFiyat = satir.fiyat ?? "—";

    if (bulunanFiyat === mevcutFiyat) {
      sonuclar.push({ id: satir.id, sonuc: "degismedi", yeni: bulunanFiyat });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: new Date().toISOString(),
        otomatik_kontrol_sonucu: "degismedi",
      }).eq("id", satir.id);
      continue;
    }

    // Fiyat değişmiş — güncelle
    const now = new Date();
    const trTarih = now.toLocaleDateString("tr-TR");

    await supabase.from("sarj_fiyatlari").update({
      fiyat: bulunanFiyat,
      son_guncelleme: trTarih,
      son_otomatik_kontrol: now.toISOString(),
      otomatik_kontrol_sonucu: "guncellendi",
    }).eq("id", satir.id);

    // Geçmişe kaydet
    await supabase.from("fiyat_gecmisi").insert({
      tarife_id: satir.id,
      eski_fiyat: mevcutFiyat,
      yeni_fiyat: bulunanFiyat,
      degisim_tarihi: now.toISOString(),
      kaynak: "otomatik",
    });

    sonuclar.push({
      id: satir.id,
      sonuc: "guncellendi",
      eski: mevcutFiyat,
      yeni: bulunanFiyat,
    });
  }

  // Özet
  const ozet = {
    toplam: sonuclar.length,
    guncellendi: sonuclar.filter((s) => s.sonuc === "guncellendi").length,
    degismedi:   sonuclar.filter((s) => s.sonuc === "degismedi").length,
    hata:        sonuclar.filter((s) => s.sonuc === "hata" || s.sonuc === "selector_bulunamadi").length,
    url_yok:     sonuclar.filter((s) => s.sonuc === "url_yok").length,
    detay: sonuclar,
  };

  return NextResponse.json(ozet);
}
