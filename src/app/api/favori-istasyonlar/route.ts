import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface IstasyonBaglanti {
  tip: string;
  tipSinifi: "dc" | "ac";
  gucKW?: number;
  adet: number;
}

export interface FavoriIstasyon {
  id: string;
  ad: string;
  sehir: string;
  ilce: string;
  adres: string;
  lat: number;
  lng: number;
  operator: string;
  baglantilar: IstasyonBaglanti[];
  not: string;
  durum: "musait" | "kismi" | "megul" | "kapali" | "bilinmiyor";
  durumNot: string;
  durumGuncelleme: string | null;
}

const DOSYA_YOLU = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "data",
  "favori-istasyonlar.json"
);

function oku(): FavoriIstasyon[] {
  try {
    const icerik = fs.readFileSync(DOSYA_YOLU, "utf-8");
    return JSON.parse(icerik);
  } catch {
    return [];
  }
}

function yaz(istasyonlar: FavoriIstasyon[]): void {
  fs.writeFileSync(DOSYA_YOLU, JSON.stringify(istasyonlar, null, 2), "utf-8");
}

// GET — tüm listeyi döndür
export async function GET() {
  return NextResponse.json(oku());
}

// POST — yeni istasyon ekle
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const istasyonlar = oku();

    const yeni: FavoriIstasyon = {
      id: body.id || `ist-${Date.now()}`,
      ad: body.ad || "Yeni İstasyon",
      sehir: body.sehir || "",
      ilce: body.ilce || "",
      adres: body.adres || "",
      lat: body.lat || 0,
      lng: body.lng || 0,
      operator: body.operator || "diger",
      baglantilar: body.baglantilar || [],
      not: body.not || "",
      durum: "bilinmiyor",
      durumNot: "",
      durumGuncelleme: null,
    };

    istasyonlar.push(yeni);
    yaz(istasyonlar);
    return NextResponse.json(yeni, { status: 201 });
  } catch (e) {
    return NextResponse.json({ hata: "Geçersiz veri" }, { status: 400 });
  }
}

// PATCH — durum veya herhangi bir alan güncelle
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...guncellemeler } = body;
    if (!id) return NextResponse.json({ hata: "id gerekli" }, { status: 400 });

    const istasyonlar = oku();
    const idx = istasyonlar.findIndex((i) => i.id === id);
    if (idx === -1) return NextResponse.json({ hata: "Bulunamadı" }, { status: 404 });

    // Durum güncellemesinde timestamp ekle
    if (guncellemeler.durum) {
      guncellemeler.durumGuncelleme = new Date().toISOString();
    }

    istasyonlar[idx] = { ...istasyonlar[idx], ...guncellemeler };
    yaz(istasyonlar);
    return NextResponse.json(istasyonlar[idx]);
  } catch (e) {
    return NextResponse.json({ hata: "Geçersiz veri" }, { status: 400 });
  }
}

// DELETE — istasyonu sil
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ hata: "id gerekli" }, { status: 400 });

    const istasyonlar = oku();
    const yeni = istasyonlar.filter((i) => i.id !== id);
    if (yeni.length === istasyonlar.length)
      return NextResponse.json({ hata: "Bulunamadı" }, { status: 404 });

    yaz(yeni);
    return NextResponse.json({ tamam: true });
  } catch (e) {
    return NextResponse.json({ hata: "Hata" }, { status: 500 });
  }
}
