import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Modeller",
  description: "Togg T10X ve T10F teknik özellikleri ve karşılaştırması.",
};

export default function ModellerHub() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Togg Modelleri</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          T10X ve T10F teknik özellikleri, karşılaştırma ve model bazlı rehberler
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* T10X */}
        <Link
          href="/modeller/t10x"
          className="group rounded-2xl border-2 border-neutral-200 p-8 transition-all hover:border-blue-400 hover:shadow-lg dark:border-neutral-800 dark:hover:border-blue-600"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                SUV
              </p>
              <h2 className="mt-1 text-3xl font-bold">Togg T10X</h2>
            </div>
            <span className="rounded-xl bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              272 HP
            </span>
          </div>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            Sportif SUV tasarımı, yüksek performans ve geniş iç hacmiyle öne çıkar.
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-neutral-100 pt-5 dark:border-neutral-800">
            <div>
              <p className="text-2xl font-bold">523</p>
              <p className="text-xs text-neutral-500">km WLTP</p>
            </div>
            <div>
              <p className="text-2xl font-bold">6.3</p>
              <p className="text-xs text-neutral-500">sn 0–100</p>
            </div>
            <div>
              <p className="text-2xl font-bold">150</p>
              <p className="text-xs text-neutral-500">kW DC şarj</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
            Detaylı incele →
          </p>
        </Link>

        {/* T10F */}
        <Link
          href="/modeller/t10f"
          className="group rounded-2xl border-2 border-neutral-200 p-8 transition-all hover:border-purple-400 hover:shadow-lg dark:border-neutral-800 dark:hover:border-purple-600"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                Sedan
              </p>
              <h2 className="mt-1 text-3xl font-bold">Togg T10F</h2>
            </div>
            <span className="rounded-xl bg-purple-50 px-3 py-1 text-sm font-bold text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              218 HP
            </span>
          </div>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            Aerodinamik sedan, uzun menzil ve 22 kW AC şarjıyla şehir ve uzun yola ideal.
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-neutral-100 pt-5 dark:border-neutral-800">
            <div>
              <p className="text-2xl font-bold">561</p>
              <p className="text-xs text-neutral-500">km WLTP</p>
            </div>
            <div>
              <p className="text-2xl font-bold">7.6</p>
              <p className="text-xs text-neutral-500">sn 0–100</p>
            </div>
            <div>
              <p className="text-2xl font-bold">22</p>
              <p className="text-xs text-neutral-500">kW AC şarj</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-purple-600 group-hover:underline dark:text-purple-400">
            Detaylı incele →
          </p>
        </Link>
      </div>

      {/* Karşılaştırma CTA */}
      <div className="mt-6 rounded-2xl bg-neutral-50 p-6 text-center dark:bg-neutral-900">
        <p className="mb-3 text-lg font-bold">Hangi model sana uygun?</p>
        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          T10X ile T10F'yi tablo halinde yan yana karşılaştır
        </p>
        <Link
          href="/modeller/karsilastir"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--togg-red)] px-6 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
        >
          T10X vs T10F Karşılaştır
        </Link>
      </div>
    </div>
  );
}
