import type { Metadata } from "next";
import Link from "next/link";
import { getTumRehberler } from "@/lib/content/rehber";
import ModelVaryantDetay from "@/components/modeller/ModelVaryantDetay";

export const metadata: Metadata = {
  title: "Togg T10F — Teknik Özellikler & Versiyonlar",
  description:
    "Togg T10F Standart, Long Range ve AWD versiyonları: 623 km WLTP menzil, 0.24 Cd aerodinamik katsayı, 435 PS AWD. Tüm teknik özellikler, renkler ve donanım detayları.",
  keywords: [
    "togg t10f",
    "t10f teknik özellikler",
    "t10f long range",
    "t10f awd",
    "t10f 4more",
    "t10f menzil",
    "t10f renk seçenekleri",
  ],
};

const OZELLIKLER = [
  {
    ikon: "💨",
    baslik: "Cd 0.24 Aerodinamik",
    aciklama: "Sınıfının en düşük hava direnci katsayılarından biri. Lale motifinden ilham alan akıcı tasarım.",
  },
  {
    ikon: "🛣️",
    baslik: "623 km WLTP",
    aciklama: "Long Range versiyonuyla Türkiye'nin en uzun menzilli elektrikli otomobili. İstanbul–Ankara arasını tek şarjla geç.",
  },
  {
    ikon: "⚡",
    baslik: "4More AWD: 435 PS",
    aciklama: "İki motorlu AWD versiyonu 700 Nm tork ve 4.1 saniyede 0–100 km/s ile spor otomobil performansı sunar.",
  },
  {
    ikon: "📱",
    baslik: "41.3\" Toplam Ekran",
    aciklama: "29\" infotainment, 12.3\" dijital gösterge ve 8\" alt kontrol ekranıyla tam dijital kokpit deneyimi.",
  },
  {
    ikon: "🛡️",
    baslik: "Aktif Yaya Koruma",
    aciklama: "Çarpışma anında devreye giren kaput yükseltme sistemi yayaları korur. T10X'te bulunmayan T10F'ye özgü özellik.",
  },
  {
    ikon: "🎵",
    baslik: "Meridian 470W Premium",
    aciklama: "12 noktalı Meridian Premium ses sistemi. Long Range ve AWD versiyonlarda standart olarak sunulur.",
  },
];

const RENKLER = [
  { ad: "Ayder", ilham: "Karadeniz Ormanları", hex: "#3d6b4f", acik: false },
  { ad: "Gemlik", ilham: "Teknoloji Kampüsü", hex: "#1d4f91", acik: false },
  { ad: "Anadolu", ilham: "Anadolu'nun Tutkusu", hex: "#c8192e", acik: false },
  { ad: "Kula", ilham: "Jeolojik Oluşumlar", hex: "#7a7a7a", acik: false },
  { ad: "Kapadokya", ilham: "Peri Bacaları", hex: "#c8aa84", acik: true },
  { ad: "Oltu", ilham: "Oltu Taşı", hex: "#1a1a1a", acik: false },
  { ad: "Seyhan", ilham: "Adana Ovaları", hex: "#e6e6e6", acik: true },
  { ad: "4More Obsidian", ilham: "AWD özel renk", hex: "#0d0d1a", acik: false },
];

export default function T10FSayfasi() {
  const rehberler = getTumRehberler()
    .filter((r) => r.model === "t10f" || r.model === "hepsi")
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/modeller" className="hover:text-neutral-900 dark:hover:text-neutral-100">
          Modeller
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100">T10F</span>
      </nav>

      {/* Hero */}
      <div className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 px-8 py-12 text-white md:px-12">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-purple-200">
          Hatchback · 5 Kapılı
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">Togg T10F</h1>
        <p className="mt-4 max-w-xl text-lg text-purple-100">
          Lale ilhamlı aerodinamik form, 623 km WLTP menzil ve isteğe bağlı AWD ile
          uzun yolun en akıllı tercihi.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold">623 km</span>
            <span className="ml-2 text-sm text-purple-200">WLTP LR</span>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold">435 PS</span>
            <span className="ml-2 text-sm text-purple-200">AWD</span>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold">4.1 sn</span>
            <span className="ml-2 text-sm text-purple-200">0–100</span>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold">Cd 0.24</span>
            <span className="ml-2 text-sm text-purple-200">Aerodinamik</span>
          </div>
        </div>

        {/* AWD rozeti */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="text-sm font-semibold">4More AWD</span>
            <span className="rounded-md bg-amber-400/80 px-2 py-0.5 text-xs font-bold text-amber-900">
              Özel Versiyon
            </span>
          </div>
          <Link
            href="/modeller/karsilastir"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 transition-opacity hover:opacity-90"
          >
            T10X ile Karşılaştır →
          </Link>
        </div>
      </div>

      {/* İnteraktif versiyon detayları */}
      <div className="mb-12">
        <ModelVaryantDetay model="t10f" />
      </div>

      {/* Özellikler */}
      <div className="mb-12">
        <h2 className="mb-2 text-2xl font-bold">Öne Çıkan Özellikler</h2>
        <p className="mb-6 text-neutral-500">T10F'yi özel kılan detaylar</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OZELLIKLER.map((oz) => (
            <div
              key={oz.baslik}
              className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="mb-3 text-3xl">{oz.ikon}</div>
              <h3 className="mb-1.5 font-bold">{oz.baslik}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">{oz.aciklama}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Renk Seçenekleri */}
      <div className="mb-12">
        <h2 className="mb-2 text-2xl font-bold">Renk Seçenekleri</h2>
        <p className="mb-6 text-neutral-500">
          Türkiye'nin coğrafyasından ilham alan renkler — T10F'de çift renk çatı seçeneği mevcut
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {RENKLER.map((renk) => (
            <div key={renk.ad} className="group text-center">
              <div className="relative mx-auto mb-3 h-16 w-16">
                <div
                  className="h-full w-full rounded-2xl shadow-md ring-2 ring-neutral-200 transition-transform group-hover:scale-105 dark:ring-neutral-700"
                  style={{ backgroundColor: renk.hex }}
                />
                {renk.ad === "4More Obsidian" && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-amber-900 leading-none">
                    AWD
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold leading-tight">{renk.ad}</p>
              <p className="text-[10px] text-neutral-500">{renk.ilham}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-400">
          <span>* Ekran renkleri gerçek araç renklerinden farklılık gösterebilir.</span>
          <span>* Çift renk çatı seçeneği için ek ücret uygulanabilir.</span>
        </div>
      </div>

      {/* AWD Detay Kartı */}
      <div className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg font-bold">4More AWD</span>
              <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                Yalnızca T10F
              </span>
            </div>
            <p className="text-sm text-neutral-300">
              İki motor, dört çeker, sınırsız güç. 435 PS ve 700 Nm tork ile 0–100 km/s'de sadece 4.1 saniye.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="text-amber-300 font-semibold">435 PS</span>
              <span className="text-neutral-400">·</span>
              <span className="text-amber-300 font-semibold">700 Nm</span>
              <span className="text-neutral-400">·</span>
              <span className="text-amber-300 font-semibold">4.1 sn 0–100</span>
              <span className="text-neutral-400">·</span>
              <span className="text-amber-300 font-semibold">200 km/s Maks.</span>
            </div>
          </div>
          <Link
            href="/modeller/karsilastir"
            className="shrink-0 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-amber-900 transition-opacity hover:opacity-90"
          >
            Versiyonları Karşılaştır
          </Link>
        </div>
      </div>

      {/* T10X Karşılaştırma CTA */}
      <div className="mb-12 overflow-hidden rounded-2xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-900/50 dark:bg-purple-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-purple-900 dark:text-purple-200">
              T10F mi, T10X mi?
            </h3>
            <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
              Sedan mı SUV mu? Tüm versiyonları yan yana karşılaştır, uzun menzil mi performans mı hangisi senin için?
            </p>
          </div>
          <Link
            href="/modeller/karsilastir"
            className="shrink-0 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Karşılaştırmaya Git →
          </Link>
        </div>
      </div>

      {/* İlgili Rehberler */}
      {rehberler.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">T10F için Rehberler</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {rehberler.map((rehber) => (
              <Link
                key={rehber.slug}
                href={`/rehber/${rehber.kategori}/${rehber.slug}`}
                className="group rounded-xl border border-neutral-200 p-5 transition-shadow hover:shadow-md dark:border-neutral-800"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {rehber.kategori}
                  </span>
                  {rehber.sure && (
                    <span className="text-xs text-neutral-400">{rehber.sure} dk</span>
                  )}
                </div>
                <p className="font-semibold group-hover:text-[var(--togg-red)]">
                  {rehber.baslik}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {rehber.ozet}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
