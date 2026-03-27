export interface ModelSpec {
  slug: "t10x" | "t10f";
  ad: string;
  tam_ad: string;
  aciklama: string;
  renk: string; // tailwind accent rengi
  ozellikler: {
    kategori: string;
    degerler: { etiket: string; t10x: string; t10f: string }[];
  }[];
}

export const MODEL_SPECS = {
  t10x: {
    slug: "t10x" as const,
    ad: "T10X",
    tam_ad: "Togg T10X",
    aciklama:
      "Togg'un sportif SUV modeli. Yüksek performans ve geniş iç hacmiyle öne çıkar.",
    renk: "blue",
    ozellikler: [],
  },
  t10f: {
    slug: "t10f" as const,
    ad: "T10F",
    tam_ad: "Togg T10F",
    aciklama:
      "Togg'un sedan modeli. Aerodinamik tasarım ve uzun menziliyle şehir ve yol sürüşüne uygun.",
    renk: "purple",
    ozellikler: [],
  },
};

export interface KarsilastirmaKategori {
  baslik: string;
  satirlar: {
    ozellik: string;
    t10x: string;
    t10f: string;
    kazanan?: "t10x" | "t10f" | "esit";
  }[];
}

export const KARSILASTIRMA_VERILERI: KarsilastirmaKategori[] = [
  {
    baslik: "Batarya & Menzil",
    satirlar: [
      { ozellik: "Batarya Kapasitesi", t10x: "88.5 kWh", t10f: "88.5 kWh", kazanan: "esit" },
      { ozellik: "WLTP Menzil", t10x: "523 km", t10f: "623 km", kazanan: "t10f" },
      { ozellik: "Batarya Garantisi", t10x: "8 yıl / 160.000 km", t10f: "8 yıl / 160.000 km", kazanan: "esit" },
    ],
  },
  {
    baslik: "Performans (RWD)",
    satirlar: [
      { ozellik: "Motor Gücü (RWD)", t10x: "218 PS", t10f: "218 PS", kazanan: "esit" },
      { ozellik: "0-100 km/s (RWD)", t10x: "7.4 sn", t10f: "7.5 sn", kazanan: "t10x" },
      { ozellik: "Motor Gücü (AWD)", t10x: "—", t10f: "435 PS", kazanan: "t10f" },
      { ozellik: "0-100 km/s (AWD)", t10x: "—", t10f: "4.1 sn", kazanan: "t10f" },
      { ozellik: "Maks. Tork (AWD)", t10x: "—", t10f: "700 Nm", kazanan: "t10f" },
      { ozellik: "Maks. Hız", t10x: "180 km/s", t10f: "180 km/s", kazanan: "esit" },
    ],
  },
  {
    baslik: "Şarj",
    satirlar: [
      { ozellik: "Maks. AC Şarj", t10x: "22 kW", t10f: "22 kW", kazanan: "esit" },
      { ozellik: "Maks. DC Şarj", t10x: "150 kW", t10f: "180 kW", kazanan: "t10f" },
      { ozellik: "%20→%80 (DC)", t10x: "~28 dk", t10f: "~28 dk", kazanan: "esit" },
    ],
  },
  {
    baslik: "Boyutlar",
    satirlar: [
      { ozellik: "Kasa Tipi", t10x: "SUV", t10f: "Hatchback", kazanan: "esit" },
      { ozellik: "Bagaj Hacmi", t10x: "485 L", t10f: "505 L", kazanan: "t10f" },
      { ozellik: "Aerodinamik (Cd)", t10x: "—", t10f: "0.24", kazanan: "t10f" },
    ],
  },
  {
    baslik: "Donanım & Güvenlik",
    satirlar: [
      { ozellik: "Euro NCAP", t10x: "5 Yıldız", t10f: "5 Yıldız", kazanan: "esit" },
      { ozellik: "Hava Yastığı", t10x: "7 adet", t10f: "7 adet", kazanan: "esit" },
      { ozellik: "Yaya Koruma Aktif", t10x: "—", t10f: "Var", kazanan: "t10f" },
      { ozellik: "Elektrikli Koltuk", t10x: "—", t10f: "Var", kazanan: "t10f" },
      { ozellik: "Ses Sistemi", t10x: "Standart", t10f: "Meridian 470W (12 nokta)", kazanan: "t10f" },
    ],
  },
];
