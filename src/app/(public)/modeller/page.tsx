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
        <h1 className="text-3xl font-bold text-slate-100">Togg Modelleri</h1>
        <p className="mt-2 text-slate-400">
          T10X ve T10F teknik özellikleri, karşılaştırma ve model bazlı rehberler
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* T10X */}
        <Link
          href="/modeller/t10x"
          className="group rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8 transition-all hover:border-blue-500/40 hover:bg-blue-500/8 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                SUV
              </p>
              <h2 className="mt-1 text-3xl font-bold text-slate-100">Togg T10X</h2>
            </div>
            <span className="rounded-xl border border-blue-500/20 bg-blue-500/15 px-3 py-1 text-sm font-bold text-blue-300">
              272 HP
            </span>
          </div>
          <p className="mb-6 text-slate-400">
            Sportif SUV tasarımı, yüksek performans ve geniş iç hacmiyle öne çıkar.
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-blue-500/10 pt-5">
            <div>
              <p className="text-2xl font-bold text-slate-100">523</p>
              <p className="text-xs text-slate-500">km WLTP</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">6.3</p>
              <p className="text-xs text-slate-500">sn 0–100</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">150</p>
              <p className="text-xs text-slate-500">kW DC şarj</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-blue-400 group-hover:underline">
            Detaylı incele →
          </p>
        </Link>

        {/* T10F */}
        <Link
          href="/modeller/t10f"
          className="group rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 transition-all hover:border-purple-500/40 hover:bg-purple-500/8 hover:shadow-lg hover:shadow-purple-500/10"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
                Sedan
              </p>
              <h2 className="mt-1 text-3xl font-bold text-slate-100">Togg T10F</h2>
            </div>
            <span className="rounded-xl border border-purple-500/20 bg-purple-500/15 px-3 py-1 text-sm font-bold text-purple-300">
              218 HP
            </span>
          </div>
          <p className="mb-6 text-slate-400">
            Aerodinamik sedan, uzun menzil ve 22 kW AC şarjıyla şehir ve uzun yola ideal.
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-purple-500/10 pt-5">
            <div>
              <p className="text-2xl font-bold text-slate-100">561</p>
              <p className="text-xs text-slate-500">km WLTP</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">7.6</p>
              <p className="text-xs text-slate-500">sn 0–100</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">22</p>
              <p className="text-xs text-slate-500">kW AC şarj</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-purple-400 group-hover:underline">
            Detaylı incele →
          </p>
        </Link>
      </div>

      {/* Karşılaştırma CTA */}
      <div className="mt-6 rounded-2xl border border-white/8 bg-slate-900/40 p-6 text-center">
        <p className="mb-2 text-lg font-bold text-slate-100">Hangi model sana uygun?</p>
        <p className="mb-5 text-sm text-slate-500">
          T10X ile T10F&apos;yi tablo halinde yan yana karşılaştır
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
