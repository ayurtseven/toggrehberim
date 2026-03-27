// Togg ve elektrikli araç içeriği için kaynak listesi

export interface RssKaynak {
  ad: string;
  url: string;
  etiketler: string[];
}

export interface YouTubeSorgu {
  sorgu: string;
  aciklama: string;
}

// Türk teknoloji ve otomotiv haber siteleri RSS feed'leri
export const RSS_KAYNAKLAR: RssKaynak[] = [
  {
    ad: "ShiftDelete",
    url: "https://shiftdelete.net/feed",
    etiketler: ["tech", "otomotiv"],
  },
  {
    ad: "Webtekno",
    url: "https://www.webtekno.com/rss.xml",
    etiketler: ["tech"],
  },
  {
    ad: "Technopat",
    url: "https://www.technopat.net/feed/",
    etiketler: ["tech"],
  },
  {
    ad: "Teknoloji.org",
    url: "https://teknoloji.org/feed",
    etiketler: ["tech", "otomotiv"],
  },
  {
    ad: "Electrive (EV haberleri EN)",
    url: "https://www.electrive.com/feed/",
    etiketler: ["ev", "global"],
  },
  {
    ad: "InsideEVs",
    url: "https://insideevs.com/rss/articles/all/",
    etiketler: ["ev", "global"],
  },
];

// YouTube arama sorguları
export const YOUTUBE_SORGULAR: YouTubeSorgu[] = [
  { sorgu: "togg T10X 2025", aciklama: "T10X haberleri" },
  { sorgu: "togg T10F inceleme", aciklama: "T10F incelemeleri" },
  { sorgu: "togg güncelleme OTA", aciklama: "Yazılım güncellemeleri" },
  { sorgu: "togg şarj istasyonu", aciklama: "Şarj altyapısı" },
  { sorgu: "togg test sürüşü", aciklama: "Test sürüşleri" },
  { sorgu: "elektrikli araç türkiye 2025", aciklama: "Türkiye EV haberleri" },
  { sorgu: "togg ekonomik sürüş", aciklama: "Sürücü ipuçları" },
];

// İçerik filtresi için anahtar kelimeler (en az biri bulunmalı)
export const TOGG_ANAHTAR_KELIMELERI = [
  "togg",
  "t10x",
  "t10f",
  "türkiye elektrikli",
  "yerli otomobil",
  "yerli araç",
  "türkiye ev",
  "bilişim vadisi",
  "TOGG A.Ş",
  "togg şarj",
  "togg güncelleme",
];

// Önceden tanımlı rehber konuları - Claude bunlar için aktif içerik üretir
export const REHBER_KONULARI: {
  konu: string;
  kategori: "sarj" | "yazilim" | "bakim" | "suruculuk" | "sss";
  model: "t10x" | "t10f" | "hepsi";
  etiketler: string[];
}[] = [
  {
    konu: "Togg T10X ile uzun yolculuk planlama: şarj duraklarını nasıl ayarlarsın?",
    kategori: "suruculuk",
    model: "t10x",
    etiketler: ["uzun yol", "menzil", "şarj planı", "HES"],
  },
  {
    konu: "Togg bataryasını koruma: %20-80 şarj alışkanlığının önemi",
    kategori: "sarj",
    model: "hepsi",
    etiketler: ["batarya", "şarj", "ömür", "degradasyon"],
  },
  {
    konu: "Togg T10F 4More Sport modu: ne zaman kullanılır, ne zaman kaçınılır?",
    kategori: "suruculuk",
    model: "t10f",
    etiketler: ["sport", "performans", "menzil", "sürüş modu"],
  },
  {
    konu: "Kışın Togg şarj etme: soğuk hava batarya ve menzil üzerindeki etkisi",
    kategori: "sarj",
    model: "hepsi",
    etiketler: ["kış", "soğuk hava", "batarya", "ön ısıtma"],
  },
  {
    konu: "Togg akıllı direksiyon ve yüzer ekranın tüm gizli özellikleri",
    kategori: "yazilim",
    model: "hepsi",
    etiketler: ["akıllı direksiyon", "dokunmatik", "arayüz", "özellikler"],
  },
  {
    konu: "Togg'da ücretsiz ve ücretli şarj seçenekleri: en ekonomik şarj rehberi",
    kategori: "sarj",
    model: "hepsi",
    etiketler: ["şarj maliyeti", "ücretsiz şarj", "AC DC", "evde şarj"],
  },
  {
    konu: "Togg OTA güncellemesi nasıl yapılır? Güncelleme öncesi ne yapmalısın?",
    kategori: "yazilim",
    model: "hepsi",
    etiketler: ["OTA", "güncelleme", "yazılım", "yenilikler"],
  },
];
