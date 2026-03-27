export type ModelAdi = "t10x" | "t10f";

export interface Varyant {
  id: string;
  model: ModelAdi;
  ad: string;          // "T10X Long Range"
  kisaAd: string;      // "LR"
  renk: string;        // tailwind accent rengi
  specs: Record<string, string>;
}

// ─── Spec kategorileri ve satır sırası ────────────────────────────────────────
export const SPEC_KATEGORILER: {
  baslik: string;
  anahtarlar: { anahtar: string; etiket: string }[];
}[] = [
  {
    baslik: "Batarya & Menzil",
    anahtarlar: [
      { anahtar: "batarya", etiket: "Batarya Kapasitesi" },
      { anahtar: "wltp", etiket: "WLTP Menzil" },
      { anahtar: "batarya_garanti", etiket: "Batarya Garantisi" },
    ],
  },
  {
    baslik: "Performans",
    anahtarlar: [
      { anahtar: "guc", etiket: "Motor Gücü" },
      { anahtar: "cekis", etiket: "Çekiş" },
      { anahtar: "tork", etiket: "Maks. Tork" },
      { anahtar: "yuz", etiket: "0–100 km/s" },
      { anahtar: "maks_hiz", etiket: "Maks. Hız" },
    ],
  },
  {
    baslik: "Şarj",
    anahtarlar: [
      { anahtar: "ac_sarj", etiket: "Maks. AC Şarj" },
      { anahtar: "dc_sarj", etiket: "Maks. DC Şarj" },
      { anahtar: "sarj_suresi", etiket: "%20 → %80 (DC)" },
    ],
  },
  {
    baslik: "Boyutlar",
    anahtarlar: [
      { anahtar: "kasa", etiket: "Kasa Tipi" },
      { anahtar: "uzunluk", etiket: "Uzunluk" },
      { anahtar: "genislik", etiket: "Genişlik" },
      { anahtar: "yukseklik", etiket: "Yükseklik" },
      { anahtar: "bagaj", etiket: "Bagaj Hacmi" },
      { anahtar: "frunk", etiket: "Ön Bagaj (Frunk)" },
      { anahtar: "cd", etiket: "Aerodinamik (Cd)" },
    ],
  },
  {
    baslik: "Ağırlık",
    anahtarlar: [
      { anahtar: "agirlik", etiket: "Ağırlık (Boş)" },
    ],
  },
  {
    baslik: "Donanım & Güvenlik",
    anahtarlar: [
      { anahtar: "ncap", etiket: "Euro NCAP" },
      { anahtar: "hava_yastigi", etiket: "Hava Yastığı" },
      { anahtar: "yaya_koruma", etiket: "Aktif Yaya Koruma" },
      { anahtar: "koltuk", etiket: "Koltuk Ayarı" },
      { anahtar: "ses", etiket: "Ses Sistemi" },
    ],
  },
];

// ─── Varyant tanımları ─────────────────────────────────────────────────────────
export const VARYANTLAR: Varyant[] = [
  // ── T10X ──────────────────────────────────────────────────────────────────
  {
    id: "t10x-standard",
    model: "t10x",
    ad: "T10X Standart",
    kisaAd: "Standart",
    renk: "blue",
    specs: {
      batarya: "52.4 kWh",
      wltp: "314 km",
      batarya_garanti: "8 yıl / 160.000 km",
      guc: "160 PS",
      cekis: "RWD",
      tork: "310 Nm",
      yuz: "8.5 sn",
      maks_hiz: "160 km/s",
      ac_sarj: "11 kW",
      dc_sarj: "85 kW",
      sarj_suresi: "~35 dk",
      kasa: "SUV, 5 kapılı",
      uzunluk: "4.559 mm",
      genislik: "1.905 mm",
      yukseklik: "1.666 mm",
      bagaj: "485 L",
      frunk: "45 L",
      cd: "—",
      agirlik: "1.980 kg",
      ncap: "5 Yıldız",
      hava_yastigi: "7 adet",
      yaya_koruma: "—",
      koltuk: "Manuel",
      ses: "Standart",
    },
  },
  {
    id: "t10x-long-range",
    model: "t10x",
    ad: "T10X Long Range",
    kisaAd: "Long Range",
    renk: "blue",
    specs: {
      batarya: "88.5 kWh",
      wltp: "523 km",
      batarya_garanti: "8 yıl / 160.000 km",
      guc: "218 PS",
      cekis: "RWD",
      tork: "340 Nm",
      yuz: "7.4 sn",
      maks_hiz: "180 km/s",
      ac_sarj: "22 kW",
      dc_sarj: "150 kW",
      sarj_suresi: "~28 dk",
      kasa: "SUV, 5 kapılı",
      uzunluk: "4.559 mm",
      genislik: "1.905 mm",
      yukseklik: "1.666 mm",
      bagaj: "485 L",
      frunk: "45 L",
      cd: "—",
      agirlik: "2.090 kg",
      ncap: "5 Yıldız",
      hava_yastigi: "7 adet",
      yaya_koruma: "—",
      koltuk: "Manuel",
      ses: "Standart",
    },
  },
  // ── T10F ──────────────────────────────────────────────────────────────────
  {
    id: "t10f-standard",
    model: "t10f",
    ad: "T10F Standart",
    kisaAd: "Standart",
    renk: "purple",
    specs: {
      batarya: "52.4 kWh",
      wltp: "395 km",
      batarya_garanti: "8 yıl / 160.000 km",
      guc: "160 PS",
      cekis: "RWD",
      tork: "310 Nm",
      yuz: "8.9 sn",
      maks_hiz: "160 km/s",
      ac_sarj: "11 kW",
      dc_sarj: "85 kW",
      sarj_suresi: "~35 dk",
      kasa: "Hatchback, 5 kapılı",
      uzunluk: "4.646 mm",
      genislik: "1.895 mm",
      yukseklik: "1.450 mm",
      bagaj: "505 L",
      frunk: "45 L",
      cd: "0.24",
      agirlik: "1.950 kg",
      ncap: "5 Yıldız",
      hava_yastigi: "7 adet",
      yaya_koruma: "Var",
      koltuk: "Elektrikli (opsiyonel)",
      ses: "Standart",
    },
  },
  {
    id: "t10f-long-range",
    model: "t10f",
    ad: "T10F Long Range",
    kisaAd: "Long Range",
    renk: "purple",
    specs: {
      batarya: "88.5 kWh",
      wltp: "623 km",
      batarya_garanti: "8 yıl / 160.000 km",
      guc: "218 PS",
      cekis: "RWD",
      tork: "310 Nm",
      yuz: "7.5 sn",
      maks_hiz: "180 km/s",
      ac_sarj: "22 kW",
      dc_sarj: "180 kW",
      sarj_suresi: "~28 dk",
      kasa: "Hatchback, 5 kapılı",
      uzunluk: "4.646 mm",
      genislik: "1.895 mm",
      yukseklik: "1.450 mm",
      bagaj: "505 L",
      frunk: "45 L",
      cd: "0.24",
      agirlik: "2.020 kg",
      ncap: "5 Yıldız",
      hava_yastigi: "7 adet",
      yaya_koruma: "Var",
      koltuk: "Elektrikli (opsiyonel)",
      ses: "Meridian 470W (12 nokta)",
    },
  },
  {
    id: "t10f-awd",
    model: "t10f",
    ad: "T10F AWD",
    kisaAd: "AWD",
    renk: "purple",
    specs: {
      batarya: "88.5 kWh",
      wltp: "520 km",
      batarya_garanti: "8 yıl / 160.000 km",
      guc: "435 PS",
      cekis: "AWD",
      tork: "700 Nm",
      yuz: "4.1 sn",
      maks_hiz: "200 km/s",
      ac_sarj: "22 kW",
      dc_sarj: "180 kW",
      sarj_suresi: "~28 dk",
      kasa: "Hatchback, 5 kapılı",
      uzunluk: "4.646 mm",
      genislik: "1.895 mm",
      yukseklik: "1.450 mm",
      bagaj: "505 L",
      frunk: "45 L",
      cd: "0.24",
      agirlik: "2.150 kg",
      ncap: "5 Yıldız",
      hava_yastigi: "7 adet",
      yaya_koruma: "Var",
      koltuk: "Elektrikli",
      ses: "Meridian 470W (12 nokta)",
    },
  },
];

export const VARYANT_MAP = Object.fromEntries(VARYANTLAR.map((v) => [v.id, v]));

export const VARSAYILAN_VARYANTLAR = ["t10x-long-range", "t10f-long-range"];

// Renk sınıfları
export const RENK_SINIFLAR: Record<string, {
  baslik: string;
  kart: string;
  secili: string;
  badge: string;
  kazanan: string;
}> = {
  blue: {
    baslik: "text-blue-600 dark:text-blue-400",
    kart: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
    secili: "border-blue-500 ring-2 ring-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    kazanan: "bg-blue-50 dark:bg-blue-950/40",
  },
  purple: {
    baslik: "text-purple-600 dark:text-purple-400",
    kart: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30",
    secili: "border-purple-500 ring-2 ring-purple-300",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    kazanan: "bg-purple-50 dark:bg-purple-950/40",
  },
};
