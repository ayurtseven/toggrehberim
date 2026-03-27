import { NextResponse } from "next/server";
import type { Baglanti, Istasyon } from "@/lib/sarj-types";

// ─── Overpass API ham tip ─────────────────────────────────────────────────────
interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

// ─── Yardımcılar ─────────────────────────────────────────────────────────────
function operatorKey(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("trugo")) return "trugo";
  if (n.includes("zes") || n.includes("zorlu")) return "zes";
  if (n.includes("eşarj") || n.includes("esarj") || n.includes("e-şarj")) return "esarj";
  if (n.includes("beefull")) return "beefull";
  if (n.includes("voltrun")) return "voltrun";
  if (n.includes("sharz")) return "sharz";
  if (n.includes("tesla")) return "tesla";
  return "diger";
}

// OSM soket etiketleri → Baglanti listesi
const SOKET_TANIMLAR: Array<{
  tag: string;
  tip: string;
  sinif: "dc" | "ac";
  powerTag?: string;
}> = [
  { tag: "socket:type2_combo",     tip: "CCS Type 2",      sinif: "dc", powerTag: "socket:type2_combo:power" },
  { tag: "socket:chademo",         tip: "CHAdeMO",          sinif: "dc", powerTag: "socket:chademo:power" },
  { tag: "socket:tesla_supercharger", tip: "Tesla Supercharger", sinif: "dc", powerTag: "socket:tesla_supercharger:power" },
  { tag: "socket:type1_combo",     tip: "CCS Type 1",      sinif: "dc", powerTag: "socket:type1_combo:power" },
  { tag: "socket:type2",           tip: "Type 2 (AC)",     sinif: "ac", powerTag: "socket:type2:power" },
  { tag: "socket:type1",           tip: "Type 1 (J1772)",  sinif: "ac", powerTag: "socket:type1:power" },
  { tag: "socket:schuko",          tip: "Schuko (AC)",     sinif: "ac", powerTag: "socket:schuko:power" },
];

function parseSoketSayisi(val?: string): number {
  if (!val) return 1;
  const n = parseInt(val, 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

function parseGuc(powerStr?: string, maxpower?: string): number | undefined {
  const raw = powerStr || maxpower;
  if (!raw) return undefined;
  const n = parseFloat(raw);
  return isNaN(n) ? undefined : n;
}

function transform(el: OverpassElement): Istasyon | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!lat || !lng) return null;

  const tags = el.tags || {};
  const op = tags.operator || tags.brand || tags.name || "Bilinmiyor";

  // Bağlantıları OSM etiketlerinden çıkar
  const baglantilar: Baglanti[] = [];
  for (const def of SOKET_TANIMLAR) {
    const val = tags[def.tag];
    if (!val || val === "no") continue;
    const adet = parseSoketSayisi(val === "yes" ? undefined : val);
    const gucKW = parseGuc(tags[def.powerTag || ""], tags["maxpower"]);
    baglantilar.push({
      tip: def.tip,
      tipSinifi: def.sinif,
      gucKW,
      adet,
      durum: "bilinmiyor", // OSM gerçek zamanlı durum içermiyor
    });
  }

  // Hiç soket etiketi yoksa genel kapasite etiketine bak
  if (baglantilar.length === 0) {
    const kapasite = tags.capacity || tags["charging_station:capacity"];
    const adet = parseSoketSayisi(kapasite);
    const gucKW = parseGuc(tags.maxpower);
    baglantilar.push({
      tip: tags["socket"] || "Bilinmiyor",
      tipSinifi: gucKW && gucKW >= 22 ? "dc" : "ac",
      gucKW,
      adet,
      durum: "bilinmiyor",
    });
  }

  const maxKW = baglantilar.reduce((m, b) => Math.max(m, b.gucKW || 0), 0);
  const hasDC = baglantilar.some((b) => b.tipSinifi === "dc");

  // Genel durum — OSM "opening_hours" etiketinden tahmin
  const hours = tags.opening_hours;
  const acikMi: "acik" | "bilinmiyor" =
    hours === "24/7" || hours === "Mo-Su 00:00-24:00" ? "acik" : "bilinmiyor";

  return {
    id: el.id,
    ad:
      tags.name ||
      tags["name:tr"] ||
      tags.operator ||
      "Şarj İstasyonu",
    adres:
      [tags["addr:street"], tags["addr:housenumber"]]
        .filter(Boolean)
        .join(" ") || tags["addr:full"] || "",
    sehir:
      tags["addr:city"] ||
      tags["addr:district"] ||
      tags["addr:province"] ||
      "",
    lat,
    lng,
    operator: op,
    operatorUrl: tags.website || tags.url,
    operatorKey: operatorKey(op),
    baglantilar,
    durum: acikMi,
    sonGuncelleme: "",
    maxKW,
    hasDC,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────
const OVERPASS_QUERY = `
[out:json][timeout:90];
(
  node["amenity"="charging_station"](35.5,25.5,42.5,44.9);
  way["amenity"="charging_station"](35.5,25.5,42.5,44.9);
);
out center body;
`.trim();

export async function GET() {
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ToggRehberim/1.0 (toggrehberim.com)",
      },
      next: { revalidate: 7200 }, // 2 saat cache
    });

    if (!res.ok) {
      console.error("Overpass API error:", res.status, await res.text());
      return NextResponse.json([], { status: 200 });
    }

    const json = await res.json();
    const elements: OverpassElement[] = json.elements || [];
    const istasyonlar = elements
      .map(transform)
      .filter((s): s is Istasyon => s !== null);

    return NextResponse.json(istasyonlar, {
      headers: { "Cache-Control": "public, s-maxage=7200" },
    });
  } catch (err) {
    console.error("sarj-istasyonlari error:", err);
    return NextResponse.json([]);
  }
}
