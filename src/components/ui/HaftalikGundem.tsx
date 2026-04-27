"use client";

import { useState } from "react";

// ─── Veri Yapısı ────────────────────────────────────────────────────────────

export interface GundemItem {
  id: string;
  title: string;
  platform: "Haber" | "Şikayet" | "Resmi" | "Forum" | "Pazar";
  summary: string;
  link: string;
  severity: "low" | "medium" | "high";
}

// ─── Haftalık Gündem Verisi (21–28 Nisan 2026) ──────────────────────────────

export const agendaData: GundemItem[] = [
  {
    id: "1",
    title: "Nisan 2026 Fiyat İndirimi: T10X ve T10F'te Hafif Gerileme",
    platform: "Haber",
    summary:
      "T10X 1.869.048 TL, T10F 1.884.980 TL oldu. Mart ayına göre yaklaşık 1.000 TL düşüş — sembolik de olsa yön değiştirdi.",
    link: "https://www.webtekno.com/nisan-2026-togg-fiyat-listesi-h214686.html",
    severity: "medium",
  },
  {
    id: "2",
    title: "Sıfır Faizli Kredi Kampanyası Başladı",
    platform: "Resmi",
    summary:
      "Seçili bankalarda 500.000–750.000 TL arasında faizsiz, 12 ay vadeli finansman imkânı. Belirli koşullar var, detay kritik.",
    link: "https://finans.cnnturk.com/finans-haberler/togg-sifir-faiz-kampanyasi-nisan-2026-togg-sifir-faiz-kampanyasi-hangi-bankalarda-var-kimler-faydalanabilir-t10x-ve-t10f-ne-2414347",
    severity: "high",
  },
  {
    id: "3",
    title: "2026 Üretim Hedefi: 60.000 Adet — Trafikte 100.000 Togg",
    platform: "Haber",
    summary:
      "Şirket 2024'te 25.000, 2025'te 40.000 üretti. Bu yıl 60.000, 2027'de 100.000 kapasiteye ulaşılması planlanıyor.",
    link: "https://www.donanimhaber.com/togg-un-2026-hedefi-60-bin-yeni-t6x-icin-tarih-haziran-2027--204788",
    severity: "medium",
  },
  {
    id: "4",
    title: "T6X Sipariş Tarihi: Haziran 2027 — Teslimat Temmuz 2027",
    platform: "Resmi",
    summary:
      "Daha kompakt ve uygun fiyatlı T6X modeli için resmi tarih açıklandı. Mevcut T10X fiyatının yaklaşık yarısına hedefleniyor.",
    link: "https://www.donanimhaber.com/togg-un-2026-hedefi-60-bin-yeni-t6x-icin-tarih-haziran-2027--204788",
    severity: "high",
  },
  {
    id: "5",
    title: "Togg Ticari Araç 2028'de Yollarda",
    platform: "Haber",
    summary:
      "Şehir içi kullanıma yönelik elektrikli ticari model 2028 hedefleniyor. Küçük esnaf ve kurumsal filolara yönelik.",
    link: "https://otonomhaber.com/2026/04/togg-t6x-yakinda-togg-ticari-2028de-geliyor/",
    severity: "low",
  },
  {
    id: "6",
    title: "AB'de T6/T8/T10/T12 Marka Tescili: Avrupa Hamlesi",
    platform: "Haber",
    summary:
      "Togg, Avrupa'da 10'dan fazla yeni model adını EUIPO'ya tescilletti. Fransız ve İtalyan pazarları gündemde.",
    link: "https://earacim.co/togg-yeni-model-isimleri-tescil-ab-euipo-t6-t8-t10-t12/",
    severity: "medium",
  },
  {
    id: "7",
    title: "TruOS Yeni Güncellemesi: Kronik Yazılım Sorunları Bitiyor mu?",
    platform: "Haber",
    summary:
      "Beklenen TruOS güncellemesiyle arayüz donmaları, navigasyon çökmeleri ve güvenlik uyarılarının çözüme kavuşması öngörülüyor.",
    link: "https://www.konsolkosesi.com/post/togg-t10x-yazilim-sorunlari-tarihe-mi-karisiyor-beklenen-truos-guncellemesi-geliyor",
    severity: "high",
  },
  {
    id: "8",
    title: "1.7.2 Güncellemesi Gez Navigasyon'u Çökertiyor",
    platform: "Şikayet",
    summary:
      "Güncel sürüm Gez uygulamasını kapatıyor, multimedya ekranını kilitliyor. Sürüş güvenliğini etkiliyor, servis randevusu şart.",
    link: "https://www.sikayetvar.com/togg/togg-172-guncellemesi-gez-navigasyon-uygulamasini-cokertiyor-ve-multimedya-ekranini-kilitliyor",
    severity: "high",
  },
  {
    id: "9",
    title: "Yazılım Güncellemesi Sonrası İmmobilizer Arızası",
    platform: "Şikayet",
    summary:
      "OTA güncellemesi sonrası ekran geç açılıyor, kamera çalışmıyor ve sürekli immobilizer hatası veriliyor. Şikayetvar'da artış.",
    link: "https://www.sikayetvar.com/togg/yazilim-guncellemeleri-sonrasi-arac-donmasi-ve-guvenlik-sorunlari-icin-acil-cozum-talebi",
    severity: "high",
  },
  {
    id: "10",
    title: "EPDK Tek Tarife Dönemi: Şarj Fiyatları Standardize Edildi",
    platform: "Resmi",
    summary:
      "Artık her operatör AC için tek fiyat, DC için tek fiyat uyguluyor. Hız bazlı ayrım kalktı, karşılaştırma kolaylaştı.",
    link: "https://www.turkiyegazetesi.com.tr/t-otomobil/sarj-istasyonlarinda-tek-tarife-donemi-iste-markalarin-sarj-fiyatlari-1784701",
    severity: "medium",
  },
  {
    id: "11",
    title: "Trugo Nisan 2026: DC 14,98 TL/kWh — AC 9,95 TL/kWh",
    platform: "Resmi",
    summary:
      "Togg'un kendi şarj ağı Trugo'nun güncel tarifesi açıklandı. DC fiyatı rakiplerinden biraz yüksek; Eşarj ve Beefull daha ucuz.",
    link: "https://www.donanimhaber.com/elektrik-arac-sarj-istasyonlari-fiyat-listesi--191391",
    severity: "medium",
  },
  {
    id: "12",
    title: "Türkiye'de EV'ye 'Yolda Kalma' Kaygısı Satışları Freniyor",
    platform: "Haber",
    summary:
      "Araştırma: Tüketicilerin en büyük çekincesi batarya ömrü ve şarj istasyonu yetersizliği. Şarj ağı büyümesi kritik.",
    link: "https://www.hardwarelab.net/2026/04/21/turkiyede-elektrikli-araca-yolda-kalir-kaygisiyla-az-satiliyor/",
    severity: "medium",
  },
  {
    id: "13",
    title: "EN YAKIT 'Tak ve Şarj Et': Filo Yönetiminde Otonom Devrim",
    platform: "Haber",
    summary:
      "320'ye yakın DC istasyonda uygulamaya giren sistem, kurumsal filolarda şarj takibini tamamen otomatize ediyor.",
    link: "https://mallreport.com.tr/2026/04/04/filolarin-enerjisi-dijitallesiyor-en-yakittan-tak-sarj-et-devrimi/",
    severity: "low",
  },
  {
    id: "14",
    title: "Türkiye'de 1,5M TL Altında EV Neredeyse Kalmadı",
    platform: "Pazar",
    summary:
      "Nisan listelerinde Citroën e-C3 (1,47M TL) son erişilebilir seçenek. Togg ve diğerleri 1,87M TL ve üzeri konumlandı.",
    link: "https://www.webtekno.com/en-ucuz-elektrikli-otomobiller-nisan-2026-h215451.html",
    severity: "medium",
  },
  {
    id: "15",
    title: "Mercedes Elektrikli GLB Türkiye'de: C-SUV Rekabeti Kızışıyor",
    platform: "Pazar",
    summary:
      "Mercedes-Benz, Nisan 2026'da Türkiye'ye elektrikli GLB'yi getirdi. Ardından eGLC, eC-Serisi ve eGLA geliyor.",
    link: "https://www.chargeiq.com.tr/tr/2026-turkiyede-satisa-sunulacak-elektrikli-araclar",
    severity: "low",
  },
];

// ─── Yardımcı Bileşenler ─────────────────────────────────────────────────────

const PLATFORM_RENK: Record<GundemItem["platform"], string> = {
  Resmi:   "bg-cyan-500/15 text-cyan-300",
  Haber:   "bg-slate-700/60 text-slate-300",
  Şikayet: "bg-red-500/15 text-red-400",
  Forum:   "bg-violet-500/15 text-violet-300",
  Pazar:   "bg-amber-500/15 text-amber-300",
};

const SEVERITY_CONFIG = {
  high: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    dot: "bg-red-500",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  medium: {
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/4",
    dot: "bg-cyan-400",
    icon: null,
  },
  low: {
    border: "border-white/8",
    bg: "bg-white/2",
    dot: "bg-slate-600",
    icon: null,
  },
} satisfies Record<GundemItem["severity"], { border: string; bg: string; dot: string; icon: React.ReactNode }>;

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function HaftalikGundem() {
  const [filter, setFilter] = useState<GundemItem["severity"] | "hepsi">("hepsi");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    filter === "hepsi"
      ? agendaData
      : agendaData.filter((item) => item.severity === filter);

  const counts = {
    high:   agendaData.filter((i) => i.severity === "high").length,
    medium: agendaData.filter((i) => i.severity === "medium").length,
    low:    agendaData.filter((i) => i.severity === "low").length,
  };

  return (
    <section className="mx-auto max-w-5xl px-4 pb-10">
      {/* Kart çerçevesi */}
      <div className="rounded-2xl border border-cyan-500/20 bg-[#07111d] overflow-hidden shadow-xl shadow-cyan-950/30">

        {/* Başlık */}
        <div className="flex flex-col gap-3 border-b border-cyan-500/15 bg-gradient-to-r from-[#0a1e32] to-[#0d2035] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-sm">📡</span>
            <div>
              <h2 className="text-sm font-bold text-white">Haftalık Togg Gündemi</h2>
              <p className="text-[11px] text-cyan-500/70">21–28 Nisan 2026 · {agendaData.length} başlık</p>
            </div>
          </div>

          {/* Filtre butonları */}
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: "hepsi",  label: "Tümü",    cls: "bg-slate-700/60 text-slate-300 hover:bg-slate-700", activeCls: "bg-slate-600 text-white" },
              { key: "high",   label: `🚨 Kritik (${counts.high})`, cls: "bg-red-500/10 text-red-400 hover:bg-red-500/20", activeCls: "bg-red-500/25 text-red-300" },
              { key: "medium", label: `⚡ Önemli (${counts.medium})`, cls: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20", activeCls: "bg-cyan-500/25 text-cyan-300" },
              { key: "low",    label: `📌 Bilgi (${counts.low})`, cls: "bg-white/5 text-slate-500 hover:bg-white/8", activeCls: "bg-white/12 text-slate-300" },
            ] as const).map(({ key, label, cls, activeCls }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  filter === key ? activeCls : cls
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div className="divide-y divide-white/5">
          {filtered.map((item) => {
            const cfg = SEVERITY_CONFIG[item.severity];
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} className={`${cfg.bg} ${isOpen ? cfg.border : ""} transition-colors`}>
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left"
                >
                  {/* Severity dot / icon */}
                  <div className="mt-1.5 shrink-0">
                    {cfg.icon ?? (
                      <span className={`block h-2 w-2 rounded-full ${cfg.dot}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PLATFORM_RENK[item.platform]}`}>
                        {item.platform}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`mt-1 h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Genişletilmiş içerik */}
                {isOpen && (
                  <div className="px-4 pb-4 pl-[3.25rem]">
                    <p className="mb-3 text-sm leading-relaxed text-slate-400">{item.summary}</p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 underline-offset-2 hover:underline"
                    >
                      Kaynağa git
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer — Haftanın Kritik Rehber Önerisi */}
        <div className="border-t border-cyan-500/15 bg-[#091826] px-5 py-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600">
            Haftanın Kritik Rehber İçeriği Önerisi
          </p>
          <p className="text-sm font-semibold text-white">
            📲 OTA Güncellemesi Öncesi Yapılması Gereken 5 Kontrol
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            1.7.2 sürümündeki Gez çökmesi ve immobilizer arızası şikayetleri zirveye ulaştı. Güncelleme
            yüklemeden önce şarj seviyesi, Wi-Fi bağlantısı ve araç park konumu gibi kritik adımları
            anlatan güncel bir rehber hem arama trafiği hem topluluk değeri açısından bu haftanın
            en öncelikli içerik fırsatı.
          </p>
          <a
            href="/rehber/yazilim/togg-ota-guncellemesi-nasil-yapilir-guncelleme-oncesi-kontrol-listesi"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline underline-offset-2"
          >
            Mevcut rehbere git →
          </a>
        </div>
      </div>
    </section>
  );
}
