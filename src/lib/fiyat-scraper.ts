/**
 * Şarj fiyatı scraper — ortak logic (cron + admin)
 *
 * Selector formatları:
 *  - `span.price`          → CSS selector (cheerio)
 *  - `$.prices[0].amount`  → JSONPath (JSON API)
 *  - `nth:0`               → sayfadaki 0. fiyat rakamı (₺ içeren sayılar)
 *  - `nth:1`               → sayfadaki 1. fiyat rakamı
 *  - `regex:AC\s+(\d+[,.]` → ilk capture group regex eşleşmesi
 */

import * as cheerio from "cheerio";

// ─── Ortak fetch ──────────────────────────────────────────────────────────────
export async function sayfaCek(url: string, mod: "html" | "json"): Promise<Response | null> {
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

// ─── Sayı normalize et: "9,99₺" → "9.99" ─────────────────────────────────
export function sayiyaNormalize(ham: string): string | null {
  const esles = ham.replace(",", ".").match(/\d+\.?\d*/);
  return esles ? esles[0] : null;
}

// ─── CSS selector modu ────────────────────────────────────────────────────────
async function cssModuFiyat(
  url: string,
  selector: string,
  cache: Map<string, string>
): Promise<string | null> {
  if (!cache.has(url)) {
    const res = await sayfaCek(url, "html");
    cache.set(url, res ? await res.text() : "");
  }
  const html = cache.get(url)!;
  if (!html) return null;
  const $ = cheerio.load(html);
  const el = $(selector).first();
  if (!el.length) return null;
  return sayiyaNormalize(el.text().trim());
}

// ─── JSON (JSONPath) modu ─────────────────────────────────────────────────────
async function jsonModuFiyat(
  url: string,
  path: string,
  cache: Map<string, unknown>
): Promise<string | null> {
  if (!cache.has(url)) {
    const res = await sayfaCek(url, "json");
    if (!res) { cache.set(url, null); }
    else { try { cache.set(url, await res.json()); } catch { cache.set(url, null); } }
  }
  const json = cache.get(url);
  if (!json) return null;
  const parcalar = path.replace(/^\$\.?/, "").split(/[\.\[\]]+/).filter(Boolean);
  let deger: unknown = json;
  for (const parca of parcalar) {
    if (deger == null) return null;
    deger = (deger as Record<string, unknown>)[parca];
  }
  if (deger == null) return null;
  return sayiyaNormalize(String(deger));
}

// ─── nth:N modu — sayfadaki N. fiyat rakamı ──────────────────────────────────
async function nthModuFiyat(
  url: string,
  n: number,
  cache: Map<string, string>
): Promise<string | null> {
  if (!cache.has(url)) {
    const res = await sayfaCek(url, "html");
    cache.set(url, res ? await res.text() : "");
  }
  const html = cache.get(url)!;
  if (!html) return null;
  const $ = cheerio.load(html);
  const metin = $("body").text();

  // X,XX veya X.XX formatındaki sayıları bul (2+ haneli, en az 1 ondalık)
  // ₺ veya TL sonrasında veya öncesinde geçen sayılar
  const eslesler = [...metin.matchAll(/(\d{1,3}[,\.]\d{2})(?:\s*[₺€TL]|\s*\/)/g)];
  if (n >= eslesler.length) return null;
  return sayiyaNormalize(eslesler[n][1]);
}

// ─── regex:PATTERN modu ────────────────────────────────────────────────────────
async function regexModuFiyat(
  url: string,
  pattern: string,
  cache: Map<string, string>
): Promise<string | null> {
  if (!cache.has(url)) {
    const res = await sayfaCek(url, "html");
    cache.set(url, res ? await res.text() : "");
  }
  const html = cache.get(url)!;
  if (!html) return null;
  const $ = cheerio.load(html);
  const metin = $("body").text();

  try {
    const rx = new RegExp(pattern, "s");
    const esles = metin.match(rx);
    if (!esles) return null;
    // Capture group varsa onu al, yoksa tam eşleşmeyi
    const deger = esles[1] ?? esles[0];
    return sayiyaNormalize(deger);
  } catch {
    return null;
  }
}

// ─── Ana fonksiyon ────────────────────────────────────────────────────────────
export async function fiyatCek(
  url: string,
  selector: string,
  htmlCache: Map<string, string>,
  jsonCache: Map<string, unknown>
): Promise<string | null> {
  if (selector.startsWith("$")) {
    return jsonModuFiyat(url, selector, jsonCache);
  }
  if (selector.startsWith("nth:")) {
    const n = parseInt(selector.slice(4), 10);
    return isNaN(n) ? null : nthModuFiyat(url, n, htmlCache);
  }
  if (selector.startsWith("regex:")) {
    return regexModuFiyat(url, selector.slice(6), htmlCache);
  }
  return cssModuFiyat(url, selector, htmlCache);
}
