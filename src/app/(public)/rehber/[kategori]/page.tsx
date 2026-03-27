import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRehberslugs, getRehber } from "@/lib/content/rehber";

const kategoriLabels: Record<string, { label: string; icon: string; aciklama: string }> = {
  sarj: { label: "Şarj & Batarya", icon: "⚡", aciklama: "Evde ve yolda şarj, batarya ömrü ve sağlığı hakkında rehberler." },
  yazilim: { label: "Yazılım & T-UI", icon: "💻", aciklama: "OTA güncellemeler, T-UI kullanımı ve gizli özellikler." },
  bakim: { label: "Bakım & Servis", icon: "🔧", aciklama: "Periyodik bakım takvimleri ve servis önerileri." },
  suruculuk: { label: "Sürüş İpuçları", icon: "🚗", aciklama: "Menzil optimizasyonu, kış sürüşü ve uzun yol tavsiyeleri." },
  sss: { label: "Sık Sorulan Sorular", icon: "❓", aciklama: "Togg sahiplerinin en çok sorduğu sorular ve cevaplar." },
};

const gecerliKategoriler = Object.keys(kategoriLabels);

export async function generateStaticParams() {
  return gecerliKategoriler.map((kategori) => ({ kategori }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const info = kategoriLabels[kategori];
  if (!info) return {};
  return {
    title: info.label,
    description: info.aciklama,
  };
}

export default async function KategoriSayfasi({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const info = kategoriLabels[kategori];

  if (!info) notFound();

  const slugs = getRehberslugs(kategori);
  const rehberler = slugs
    .map((slug) => getRehber(slug, kategori))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/rehber" className="hover:text-neutral-900 dark:hover:text-neutral-100">Rehber</Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100">{info.label}</span>
      </nav>

      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <span>{info.icon}</span>
          {info.label}
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{info.aciklama}</p>
      </div>

      {rehberler.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
          Bu kategoride henüz rehber yok. Yakında eklenecek.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rehberler.map((rehber) => rehber && (
            <Link
              key={rehber.slug}
              href={`/rehber/${kategori}/${rehber.slug}`}
              className="group rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-md dark:border-neutral-800"
            >
              <div className="mb-2 flex items-center gap-2">
                {rehber.model !== "hepsi" && (
                  <span className="rounded-full bg-[var(--togg-red)]/10 px-2 py-0.5 text-xs font-medium uppercase text-[var(--togg-red)]">
                    {rehber.model}
                  </span>
                )}
                {rehber.etiketler?.slice(0, 2).map((etiket) => (
                  <span key={etiket} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {etiket}
                  </span>
                ))}
              </div>
              <h2 className="text-lg font-semibold group-hover:text-[var(--togg-red)]">
                {rehber.baslik}
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {rehber.ozet}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400">
                {rehber.sure && <span>{rehber.sure} dk okuma</span>}
                <span>{new Date(rehber.tarih).toLocaleDateString("tr-TR")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
