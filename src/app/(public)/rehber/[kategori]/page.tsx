import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRehberslugs, getRehber } from "@/lib/content/rehber";
import RehberFiltreli from "@/components/rehber/RehberFiltreli";

const KATEGORILER: Record<
  string,
  { label: string; icon: string; aciklama: string; renk: string; iconBg: string; iconText: string; border: string; bg: string }
> = {
  sarj:      { label: "Şarj & Batarya",     icon: "⚡", aciklama: "Evde ve yolda şarj, batarya ömrü ve sağlığı hakkında rehberler.", renk: "blue",   iconBg: "bg-blue-500/10",   iconText: "text-blue-400",   border: "border-blue-500/20",   bg: "bg-blue-500/5"   },
  yazilim:   { label: "Yazılım & T-UI",     icon: "💻", aciklama: "OTA güncellemeler, T-UI kullanımı ve gizli özellikler.",           renk: "purple", iconBg: "bg-purple-500/10", iconText: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5" },
  bakim:     { label: "Bakım & Servis",     icon: "🔧", aciklama: "Periyodik bakım takvimleri ve servis önerileri.",                  renk: "orange", iconBg: "bg-orange-500/10", iconText: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5" },
  suruculuk: { label: "Sürüş İpuçları",    icon: "🚗", aciklama: "Menzil optimizasyonu, kış sürüşü ve uzun yol tavsiyeleri.",        renk: "green",  iconBg: "bg-green-500/10",  iconText: "text-green-400",  border: "border-green-500/20",  bg: "bg-green-500/5"  },
  sss:       { label: "Sık Sorulan Sorular", icon: "❓", aciklama: "Togg sahiplerinin en çok sorduğu sorular ve cevaplar.",            renk: "slate",  iconBg: "bg-slate-500/10",  iconText: "text-slate-400",  border: "border-slate-500/20",  bg: "bg-slate-500/5"  },
};

const gecerliKategoriler = Object.keys(KATEGORILER);

export async function generateStaticParams() {
  return gecerliKategoriler.map((kategori) => ({ kategori }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const info = KATEGORILER[kategori];
  if (!info) return {};
  return { title: info.label, description: info.aciklama };
}

export default async function KategoriSayfasi({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const info = KATEGORILER[kategori];
  if (!info) notFound();

  const slugs = getRehberslugs(kategori);
  const rehberler = slugs
    .map((slug) => getRehber(slug, kategori))
    .filter(Boolean)
    .map((r) => ({ ...r!, model: r!.model ?? "hepsi" }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/rehber" className="hover:text-slate-200 transition-colors">
          Rehber
        </Link>
        <span>/</span>
        <span className="text-slate-200">{info.label}</span>
      </nav>

      {/* Kategori başlık bloğu */}
      <div className={`mb-10 rounded-2xl border ${info.border} ${info.bg} p-6`}>
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${info.border} ${info.iconBg} text-2xl`}>
            {info.icon}
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${info.iconText}`}>{info.label}</h1>
            <p className="mt-1 text-slate-400">{info.aciklama}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
          <span>{rehberler.length} rehber</span>
          <span>·</span>
          <Link href="/rehber" className="hover:text-slate-300 transition-colors">
            ← Tüm kategoriler
          </Link>
        </div>
      </div>

      <RehberFiltreli rehberler={rehberler} />
    </div>
    </div>
  );
}
