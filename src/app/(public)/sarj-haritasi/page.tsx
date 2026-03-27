import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import type { FavoriIstasyon } from "@/app/api/favori-istasyonlar/route";
import IstasyonListesi from "./IstasyonListesi";

export const metadata: Metadata = {
  title: "Şarj İstasyonları — ToggRehberim",
  description:
    "Togg sahiplerinin sık kullandığı şarj istasyonları. Güncel müsaitlik durumu ve soket bilgileri.",
};

// Her istekte taze oku (no-cache)
export const dynamic = "force-dynamic";

function istasyonlariOku(): FavoriIstasyon[] {
  try {
    const dosya = path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "data",
      "favori-istasyonlar.json"
    );
    return JSON.parse(fs.readFileSync(dosya, "utf-8"));
  } catch {
    return [];
  }
}

export default function SarjIstasyonlariSayfasi() {
  const istasyonlar = istasyonlariOku();
  return <IstasyonListesi istasyonlar={istasyonlar} />;
}
