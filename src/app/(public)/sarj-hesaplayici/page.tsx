import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import type { FavoriIstasyon } from "@/app/api/favori-istasyonlar/route";
import SarjHesaplayici from "./SarjHesaplayici";

export const metadata: Metadata = {
  title: "Şarj Hesaplayıcı — Togg Menzil Tahmini",
  description: "Togg T10X ve T10F için kalan batarya, hava ve sürüş koşullarına göre tahmini menzil hesaplama.",
};

export const dynamic = "force-dynamic";

function istasyonlariOku(): FavoriIstasyon[] {
  try {
    const dosya = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "favori-istasyonlar.json");
    return JSON.parse(fs.readFileSync(dosya, "utf-8"));
  } catch {
    return [];
  }
}

export default function SarjHesaplayiciSayfasi() {
  const istasyonlar = istasyonlariOku();
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[var(--togg-red)]">Araç Aracı</p>
          <h1 className="text-3xl font-bold">Şarj Hesaplayıcı</h1>
          <p className="mt-2 text-neutral-400">Kalan batarya ve koşullara göre tahmini menzilini hesapla.</p>
        </div>
        <SarjHesaplayici istasyonlar={istasyonlar} />
      </div>
    </div>
  );
}
