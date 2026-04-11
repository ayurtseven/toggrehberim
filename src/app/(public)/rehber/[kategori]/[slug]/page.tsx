import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getRehber, getRehberslugs } from "@/lib/content/rehber";

const gecerliKategoriler = ["sarj", "yazilim", "bakim", "suruculuk", "sss"];

const KATEGORI_RENK: Record<string, { label: string; text: string; badge: string; border: string }> = {
  sarj:      { label: "Şarj & Batarya",      text: "text-blue-400",   badge: "bg-blue-500/15 text-blue-300",   border: "border-blue-500/20"   },
  yazilim:   { label: "Yazılım & T-UI",      text: "text-purple-400", badge: "bg-purple-500/15 text-purple-300", border: "border-purple-500/20" },
  bakim:     { label: "Bakım & Servis",      text: "text-orange-400", badge: "bg-orange-500/15 text-orange-300", border: "border-orange-500/20" },
  suruculuk: { label: "Sürüş İpuçları",     text: "text-green-400",  badge: "bg-green-500/15 text-green-300",  border: "border-green-500/20"  },
  sss:       { label: "Sık Sorulan Sorular", text: "text-slate-400",  badge: "bg-slate-500/15 text-slate-300",  border: "border-slate-500/20"  },
};

export async function generateStaticParams() {
  const params: { kategori: string; slug: string }[] = [];
  for (const kategori of gecerliKategoriler) {
    const slugs = getRehberslugs(kategori);
    slugs.forEach((slug) => params.push({ kategori, slug }));
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string; slug: string }>;
}): Promise<Metadata> {
  const { kategori, slug } = await params;
  const rehber = getRehber(slug, kategori);
  if (!rehber) return {};
  return {
    title: rehber.baslik,
    description: rehber.ozet,
    keywords: rehber.etiketler,
    openGraph: {
      title: rehber.baslik,
      description: rehber.ozet,
    },
  };
}

export default async function RehberDetay({
  params,
}: {
  params: Promise<{ kategori: string; slug: string }>;
}) {
  const { kategori, slug } = await params;
  const rehber = getRehber(slug, kategori);

  if (!rehber) notFound();

  const katInfo = KATEGORI_RENK[kategori] ?? KATEGORI_RENK.sss;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/rehber" className="hover:text-slate-300 transition-colors">
          Rehber
        </Link>
        <span>/</span>
        <Link
          href={`/rehber/${kategori}`}
          className={`hover:text-slate-300 transition-colors ${katInfo.text}`}
        >
          {katInfo.label}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-slate-300">{rehber.baslik}</span>
      </nav>

      {/* Başlık */}
      <header className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${katInfo.badge} ${katInfo.border}`}>
            {katInfo.label}
          </span>
          {rehber.model !== "hepsi" && (
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                rehber.model === "t10x"
                  ? "border-blue-500/20 bg-blue-500/15 text-blue-300"
                  : "border-purple-500/20 bg-purple-500/15 text-purple-300"
              }`}
            >
              {rehber.model}
            </span>
          )}
          {rehber.model === "hepsi" && (
            <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-400">
              T10X & T10F
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold leading-tight text-slate-100">{rehber.baslik}</h1>
        <p className="mt-3 text-lg text-slate-400">{rehber.ozet}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {rehber.sure && (
            <span className="flex items-center gap-1.5">
              <span>📖</span>
              {rehber.sure} dakika okuma
            </span>
          )}
          <span>
            {new Date(rehber.tarih).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {rehber.guncelleme && (
            <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-500">
              Güncellendi: {new Date(rehber.guncelleme).toLocaleDateString("tr-TR")}
            </span>
          )}
        </div>
      </header>

      {/* MDX İçerik */}
      <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-100 prose-p:text-slate-300 prose-a:text-[var(--togg-red)] prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-100 prose-blockquote:border-[var(--togg-red)] prose-blockquote:bg-slate-900/60 prose-blockquote:py-1 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-300 prose-code:rounded-lg prose-code:border prose-code:border-white/10 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-slate-200 prose-code:before:content-none prose-code:after:content-none prose-li:text-slate-300 prose-hr:border-slate-800 prose-img:rounded-xl prose-img:w-full prose-img:my-6 prose-img:border prose-img:border-white/10">
        <MDXRemote source={rehber.icerik} />
      </article>

      {/* Etiketler */}
      {rehber.etiketler && rehber.etiketler.length > 0 && (
        <div className="mt-10 border-t border-slate-800 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-600">
            Etiketler
          </p>
          <div className="flex flex-wrap gap-2">
            {rehber.etiketler.map((etiket) => (
              <span
                key={etiket}
                className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-sm text-slate-400"
              >
                {etiket}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Geri dön */}
      <div className="mt-8 flex items-center gap-4">
        <Link
          href={`/rehber/${kategori}`}
          className={`inline-flex items-center gap-2 text-sm font-medium ${katInfo.text} hover:underline`}
        >
          ← {katInfo.label} rehberlerine dön
        </Link>
        <span className="text-slate-700">·</span>
        <Link href="/rehber" className="text-sm text-slate-600 hover:text-slate-300 transition-colors">
          Tüm rehberler
        </Link>
      </div>
    </div>
    </div>
  );
}
