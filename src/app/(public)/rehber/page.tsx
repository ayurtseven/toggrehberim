import type { Metadata } from "next";
import Link from "next/link";
import { getTumRehberler } from "@/lib/content/rehber";

export const metadata: Metadata = {
  title: "Rehberler",
  description: "Togg T10X ve T10F için şarj, yazılım, bakım ve sürüş rehberleri.",
};

const kategoriler = [
  { slug: "sarj", label: "Şarj & Batarya", icon: "⚡" },
  { slug: "yazilim", label: "Yazılım & T-UI", icon: "💻" },
  { slug: "bakim", label: "Bakım & Servis", icon: "🔧" },
  { slug: "suruculuk", label: "Sürüş İpuçları", icon: "🚗" },
  { slug: "sss", label: "Sık Sorulan Sorular", icon: "❓" },
];

export default function RehberHub() {
  const tumRehberler = getTumRehberler();

  const rehberlereGoreKategori = kategoriler.map((kat) => ({
    ...kat,
    rehberler: tumRehberler.filter((r) => r.kategori === kat.slug),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Tüm Rehberler</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Togg sahipleri için kapsamlı kullanım kılavuzları
        </p>
      </div>

      <div className="space-y-12">
        {rehberlereGoreKategori.map((kat) => (
          <section key={kat.slug}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <span>{kat.icon}</span>
                {kat.label}
              </h2>
              <Link
                href={`/rehber/${kat.slug}`}
                className="text-sm font-medium text-[var(--togg-red)] hover:underline"
              >
                Tümünü gör →
              </Link>
            </div>

            {kat.rehberler.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500 dark:border-neutral-700">
                Yakında içerik eklenecek.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kat.rehberler.slice(0, 3).map((rehber) => (
                  <Link
                    key={rehber.slug}
                    href={`/rehber/${rehber.kategori}/${rehber.slug}`}
                    className="group rounded-xl border border-neutral-200 p-5 transition-shadow hover:shadow-md dark:border-neutral-800"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {rehber.model !== "hepsi" && (
                        <span className="rounded-full bg-[var(--togg-red)]/10 px-2 py-0.5 text-xs font-medium uppercase text-[var(--togg-red)]">
                          {rehber.model}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold group-hover:text-[var(--togg-red)]">
                      {rehber.baslik}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {rehber.ozet}
                    </p>
                    {rehber.sure && (
                      <p className="mt-3 text-xs text-neutral-400">
                        {rehber.sure} dk okuma
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
