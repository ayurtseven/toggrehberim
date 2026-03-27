import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getRehber, getRehberslugs } from "@/lib/content/rehber";

const gecerliKategoriler = ["sarj", "yazilim", "bakim", "suruculuk", "sss"];

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/rehber" className="hover:text-neutral-900 dark:hover:text-neutral-100">Rehber</Link>
        <span>/</span>
        <Link href={`/rehber/${kategori}`} className="capitalize hover:text-neutral-900 dark:hover:text-neutral-100">
          {kategori}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100 line-clamp-1">{rehber.baslik}</span>
      </nav>

      {/* Başlık */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {rehber.kategori}
          </span>
          {rehber.model !== "hepsi" && (
            <span className="rounded-full bg-[var(--togg-red)]/10 px-3 py-1 text-xs font-medium uppercase text-[var(--togg-red)]">
              {rehber.model}
            </span>
          )}
          {rehber.model === "hepsi" && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              T10X & T10F
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold leading-tight">{rehber.baslik}</h1>
        <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
          {rehber.ozet}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
          {rehber.sure && <span>{rehber.sure} dakika okuma</span>}
          <span>{new Date(rehber.tarih).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</span>
          {rehber.guncelleme && (
            <span>Güncellendi: {new Date(rehber.guncelleme).toLocaleDateString("tr-TR")}</span>
          )}
        </div>
      </header>

      {/* MDX İçerik */}
      <article className="prose prose-neutral prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--togg-red)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-[var(--togg-red)] prose-blockquote:bg-neutral-50 prose-blockquote:dark:bg-neutral-900 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-code:dark:bg-neutral-800">
        <MDXRemote source={rehber.icerik} />
      </article>

      {/* Etiketler */}
      {rehber.etiketler && rehber.etiketler.length > 0 && (
        <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <p className="mb-3 text-sm font-medium text-neutral-500">Etiketler</p>
          <div className="flex flex-wrap gap-2">
            {rehber.etiketler.map((etiket) => (
              <span
                key={etiket}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm dark:border-neutral-700"
              >
                {etiket}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Geri dön */}
      <div className="mt-8">
        <Link
          href={`/rehber/${kategori}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--togg-red)] hover:underline"
        >
          ← {kategori.charAt(0).toUpperCase() + kategori.slice(1)} rehberlerine dön
        </Link>
      </div>
    </div>
  );
}
