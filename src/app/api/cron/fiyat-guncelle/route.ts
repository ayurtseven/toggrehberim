import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Tipler ──────────────────────────────────────────────────────────────────
interface TarifeSatiri {
  id: string;
  fiyat: string | null;
  tarife_url: string | null;
  css_selector: string | null;  // CSS selector VEYA "$." ile başlayan JSONPath
}

type SonucTipi = "guncellendi" | "degismedi" | "hata" | "selector_bulunamadi" | "url_yok";

interface SonucItem {
  id: string;
  sonuc: SonucTipi;
  eski?: string;
  yeni?: string;
  hata?: string;
}

// ─── Ortak fetch ─────────────────────────────────────────────────────────────
async function sayfaCek(url: string, mod: "html" | "json"): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": mod === "json"
          ? "application/json, text/plain, */*"
          : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
        "Referer": new URL(url).origin + "/",
        "Origin": new URL(url).origin,
      },
      signal: AbortSignal.timeout(15_000),
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

// ─── HTML modu — cheerio CSS selector ─────────────────────────────────────────
async function htmldenFiyatCek(url: string, selector: string, cache: Map<string, string>): Promise<string | null> {
  if (!cache.has(url)) {
    const res = await sayfaCek(url, "html");
    cache.set(url, res ? await res.text() : "");
  }
  const html = cache.get(url)!;
  if (!html) return null;

  const $ = cheerio.load(html);
  const el = $(selector).first();
  if (!el.length) return null;

  const ham = el.text().trim();
  const esles = ham.replace(",", ".").match(/\d+\.?\d*/);
  return esles ? esles[0] : null;
}

// ─── JSON modu — JSONPath benzeri ($.key.key[0].key) ─────────────────────────
async function jsondenFiyatCek(url: string, path: string, cache: Map<string, unknown>): Promise<string | null> {
  if (!cache.has(url)) {
    const res = await sayfaCek(url, "json");
    if (!res) { cache.set(url, null); }
    else {
      try { cache.set(url, await res.json()); }
      catch { cache.set(url, null); }
    }
  }
  const json = cache.get(url);
  if (!json) return null;

  // $.prices[0].acPerKwh → ["prices", "0", "acPerKwh"]
  const parcalar = path.replace(/^\$\.?/, "").split(/[\.\[\]]+/).filter(Boolean);
  let deger: unknown = json;
  for (const parca of parcalar) {
    if (deger === null || deger === undefined) return null;
    deger = (deger as Record<string, unknown>)[parca];
  }

  if (deger === null || deger === undefined) return null;
  const str = String(deger).replace(",", ".");
  const esles = str.match(/\d+\.?\d*/);
  return esles ? esles[0] : null;
}

// ─── Ana işleyici ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Güvenlik: Vercel cron header veya CRON_SECRET
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: satirlar, error: fetchHata } = await supabase
    .from("sarj_fiyatlari")
    .select("id, fiyat, tarife_url, css_selector")
    .not("tarife_url", "is", null)
    .eq("gizli", false);

  if (fetchHata || !satirlar) {
    return NextResponse.json({ error: "DB hatası", detay: fetchHata?.message }, { status: 500 });
  }

  const sonuclar: SonucItem[] = [];
  const htmlCache = new Map<string, string>();       // url → ham HTML
  const jsonCache = new Map<string, unknown>();      // url → parsed JSON

  for (const satir of satirlar as TarifeSatiri[]) {
    const now = new Date();

    if (!satir.tarife_url) {
      sonuclar.push({ id: satir.id, sonuc: "url_yok" });
      continue;
    }
    if (!satir.css_selector) {
      sonuclar.push({ id: satir.id, sonuc: "hata", hata: "selector tanımlı değil" });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: now.toISOString(),
        otomatik_kontrol_sonucu: "hata",
      }).eq("id", satir.id);
      continue;
    }

    // Mod tespiti: "$." ile başlıyorsa JSON, değilse HTML
    const jsonMod = satir.css_selector.startsWith("$");

    const bulunanFiyat = jsonMod
      ? await jsondenFiyatCek(satir.tarife_url, satir.css_selector, jsonCache)
      : await htmldenFiyatCek(satir.tarife_url, satir.css_selector, htmlCache);

    if (!bulunanFiyat) {
      sonuclar.push({ id: satir.id, sonuc: "selector_bulunamadi" });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: now.toISOString(),
        otomatik_kontrol_sonucu: "selector_bulunamadi",
      }).eq("id", satir.id);
      continue;
    }

    const mevcutFiyat = satir.fiyat ?? "—";

    if (bulunanFiyat === mevcutFiyat) {
      sonuclar.push({ id: satir.id, sonuc: "degismedi", yeni: bulunanFiyat });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: now.toISOString(),
        otomatik_kontrol_sonucu: "degismedi",
      }).eq("id", satir.id);
      continue;
    }

    // Fiyat değişti — güncelle
    await supabase.from("sarj_fiyatlari").update({
      fiyat: bulunanFiyat,
      son_guncelleme: now.toLocaleDateString("tr-TR"),
      son_otomatik_kontrol: now.toISOString(),
      otomatik_kontrol_sonucu: "guncellendi",
    }).eq("id", satir.id);

    await supabase.from("fiyat_gecmisi").insert({
      tarife_id: satir.id,
      eski_fiyat: mevcutFiyat,
      yeni_fiyat: bulunanFiyat,
      degisim_tarihi: now.toISOString(),
      kaynak: "otomatik",
    });

    sonuclar.push({ id: satir.id, sonuc: "guncellendi", eski: mevcutFiyat, yeni: bulunanFiyat });
  }

  return NextResponse.json({
    toplam:      sonuclar.length,
    guncellendi: sonuclar.filter((s) => s.sonuc === "guncellendi").length,
    degismedi:   sonuclar.filter((s) => s.sonuc === "degismedi").length,
    hata:        sonuclar.filter((s) => ["hata","selector_bulunamadi"].includes(s.sonuc)).length,
    url_yok:     sonuclar.filter((s) => s.sonuc === "url_yok").length,
    detay: sonuclar,
  });
}
