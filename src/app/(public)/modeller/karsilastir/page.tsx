import type { Metadata } from "next";
import Link from "next/link";
import KarsilastirmaTablosu from "@/components/modeller/KarsilastirmaTablosu";

export const metadata: Metadata = {
  title: "T10X vs T10F Karşılaştırma — Tüm Versiyonlar",
  description:
    "Togg T10X Standart, Long Range ile T10F Standart, Long Range ve AWD versiyonlarını yan yana karşılaştır.",
  keywords: [
    "togg t10x t10f karşılaştırma",
    "t10x long range",
    "t10f awd",
    "togg versiyonlar",
    "t10x mı t10f mi",
  ],
};

export default function KarsilastirSayfasi() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/modeller" className="hover:text-neutral-900 dark:hover:text-neutral-100">
          Modeller
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-neutral-100">Karşılaştırma</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">T10X vs T10F Karşılaştırma</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Versiyonu seç, özelliklerini karşılaştır. Sarı satırlar iki model arasındaki farkları gösterir.
        </p>

        {/* Versiyon rozetleri */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">T10X:</span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">Standart</span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">Long Range</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-purple-600 dark:text-purple-400">T10F:</span>
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">Standart</span>
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">Long Range</span>
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">AWD</span>
          </div>
        </div>
      </div>

      {/* İnteraktif karşılaştırma tablosu */}
      <KarsilastirmaTablosu />

      {/* Model detay linkleri */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/modeller/t10x"
          className="flex-1 rounded-xl border border-blue-200 bg-blue-50 p-4 text-center transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30"
        >
          <p className="font-bold text-blue-700 dark:text-blue-300">T10X Detay →</p>
          <p className="mt-1 text-xs text-neutral-500">Tüm teknik özellikler</p>
        </Link>
        <Link
          href="/modeller/t10f"
          className="flex-1 rounded-xl border border-purple-200 bg-purple-50 p-4 text-center transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30"
        >
          <p className="font-bold text-purple-700 dark:text-purple-300">T10F Detay →</p>
          <p className="mt-1 text-xs text-neutral-500">Tüm teknik özellikler</p>
        </Link>
      </div>
    </div>
  );
}
