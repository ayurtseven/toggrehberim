import type { Metadata } from "next";
import Link from "next/link";
import { getTumRehberler } from "@/lib/content/rehber";
import ModelVaryantDetay from "@/components/modeller/ModelVaryantDetay";

export const metadata: Metadata = {
  title: "Togg T10X — Teknik Özellikler & Versiyonlar",
  description:
    "Togg T10X Standart ve Long Range versiyonları: 218 PS, 523 km WLTP menzil, 150 kW DC şarj. Tüm teknik özellikler, renkler ve donanım detayları.",
  keywords: [
    "togg t10x",
    "t10x teknik özellikler",
    "t10x long range",
    "t10x standart",
    "t10x menzil",
    "t10x renk seçenekleri",
  ],
};

const OZELLIKLER = [
  {
    ikon: "🏔️",
    baslik: "SUV Tasarımı",
    aciklama: "Yüksek sürüş pozisyonu, 5 kapılı karoser ve geniş iç hacmiyle aile ve şehir dışı kullanıma uygun.",
  },
  {
    ikon: "📱",
    baslik: "Tam Genişlik Ekran",
    aciklama: "29 inç infotainment ekranı ve 12.3 inç dijital gösterge paneliyle modern dijital kokpit.",
  },
  {
    ikon: "📦",
    baslik: "485 L + 45 L Frunk",
    aciklama: "Arkada 485 litrelik bagaj, önde 45 litrelik frunk. Toplam depolama alanında sınıf lideri.",
  },
  {
    ikon: "🎵",
    baslik: "Meridian Ses Sistemi",
    aciklama: "Long Range'de standart olan 470 W Meridian Premium, 12 hoparlörle sinema kalitesinde ses.",
  },
  {
    ikon: "🛡️",
    baslik: "Euro NCAP 5 Yıldız",
    aciklama: "7 hava yastığı, yüksek dayanımlı çelik gövde ve gelişmiş sürücü destek sistemleriyle en yüksek güvenlik puanı.",
  },
  {
    ikon: "🔑",
    baslik: "Keyless Giriş & Bagaj",
    aciklama: "Anahtarsız kapı açma ve bagaj kapağı, dijital kart desteği. Telefonunuzu araç anahtarınız olarak kullanın.",
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
];

export default function T10XSayfasi() {
  const rehberler = getTumRehberler()
    .filter((r) => r.model === "t10x" || r.model === "hepsi")
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/modeller" className="hover:text-neutral-900 dark:hover:text-neutral-100">
          Modeller
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100">T10X</span>
      </nav>

      {/* Hero */}
      <div className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-8 py-12 text-white md:px-12">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-200">
          SUV · 5 Kapılı
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">Togg T10X</h1>
        <p className="mt-4 max-w-xl text-lg text-blue-100">
          Sportif SUV çizgisi, yüksek yol kontrolü ve geniş iç hacmiyle. Şehirden dağa,
          her koşulda Togg deneyimi.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold">523 km</span>
            <span className="ml-2 text-sm text-blue-200">WLTP</span>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold">218 PS</span>
            <span className="ml-2 text-sm text-blue-200">RWD</span>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold">7.4 sn</span>
            <span className="ml-2 text-sm text-blue-200">0–100</span>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl font-bold">150 kW</span>
            <span className="ml-2 text-sm text-blue-200">DC Şarj</span>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Link
            href="/modeller/karsilastir"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition-opacity hover:opacity-90"
          >
            T10F ile Karşılaştır →
          </Link>
          <Link
            href="/rehber/sarj/evde-ve-yolda-sarj"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Şarj Rehberi
          </Link>
        </div>
      </div>

      {/* İnteraktif versiyon detayları */}
      <div className="mb-12">
        <ModelVaryantDetay model="t10x" />
      </div>

      {/* Özellikler */}
      <div className="mb-12">
        <h2 className="mb-2 text-2xl font-bold">Öne Çıkan Özellikler</h2>
        <p className="mb-6 text-neutral-500">T10X'i özel kılan detaylar</p>
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
          Türkiye'nin coğrafyasından ilham alan 7 renk seçeneği
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {RENKLER.map((renk) => (
            <div key={renk.ad} className="group text-center">
              <div
                className="mx-auto mb-3 h-16 w-16 rounded-2xl shadow-md ring-2 ring-neutral-200 transition-transform group-hover:scale-105 dark:ring-neutral-700"
                style={{ backgroundColor: renk.hex }}
              />
              <p className="text-sm font-semibold">{renk.ad}</p>
              <p className="text-xs text-neutral-500">{renk.ilham}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-400">
          * Ekran renkleri gerçek araç renklerinden farklılık gösterebilir.
        </p>
      </div>

      {/* T10F Karşılaştırma CTA */}
      <div className="mb-12 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-200">
              T10X mi, T10F mi?
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              SUV mu sedan mı? Tüm versiyonları yan yana karşılaştır, senin için hangisi daha uygun gör.
            </p>
          </div>
          <Link
            href="/modeller/karsilastir"
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Karşılaştırmaya Git →
          </Link>
        </div>
      </div>

      {/* İlgili Rehberler */}
      {rehberler.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">T10X için Rehberler</h2>
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
