import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRehberslugs, getRehber } from "@/lib/content/rehber";
import RehberFiltreli from "@/components/rehber/RehberFiltreli";

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
  return { title: info.label, description: info.aciklama };
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
    .filter(Boolean)
    .map((r) => ({ ...r!, model: r!.model ?? "hepsi" }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/rehber" className="hover:text-slate-200 transition-colors">Rehber</Link>
        <span>/</span>
        <span className="text-slate-200">{info.label}</span>
      </nav>

      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <span>{info.icon}</span>
          {info.label}
        </h1>
        <p className="mt-2 text-slate-400">{info.aciklama}</p>
      </div>

      <RehberFiltreli rehberler={rehberler} />
    </div>
  );
}
