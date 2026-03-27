"use client";

import Link from "next/link";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useModelSecim } from "@/lib/model-secim";

interface RehberOzet {
  slug: string;
  kategori: string;
  baslik: string;
  ozet: string;
  model: string;
  sure?: number;
}

export default function SonRehberlerIstemci({
  rehberler,
}: {
  rehberler: RehberOzet[];
}) {
  const { secili } = useModelSecim();
  const seciliModel = secili
    ? secili.startsWith("t10x")
      ? "t10x"
      : "t10f"
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rehberler.map((rehber, i) => {
        const uyumlu =
          seciliModel &&
          (rehber.model === "hepsi" || rehber.model === seciliModel);

        return (
          <SpotlightCard
            key={`${rehber.kategori}/${rehber.slug}`}
            className={`group relative h-full rounded-2xl border p-6 transition-all duration-300 ${
              uyumlu
                ? "border-white/15 bg-slate-900 hover:border-white/25"
                : "border-white/8 bg-slate-900 hover:border-white/15"
            }`}
          >
            {uyumlu && rehber.model !== "hepsi" && (
              <span className="absolute right-3 top-3 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                senin için ✓
              </span>
            )}
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-300">
                {rehber.kategori}
              </span>
              {rehber.model !== "hepsi" && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${
                    rehber.model === "t10x"
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-purple-500/15 text-purple-400"
                  }`}
                >
                  {rehber.model}
                </span>
              )}
            </div>
            <h3 className="font-bold leading-snug transition-colors group-hover:text-[var(--togg-red)]">
              {rehber.baslik}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">
              {rehber.ozet}
            </p>
            {rehber.sure && (
              <p className="mt-4 text-xs text-slate-500">{rehber.sure} dk okuma</p>
            )}
            <Link
              href={`/rehber/${rehber.kategori}/${rehber.slug}`}
              className="absolute inset-0"
              aria-label={rehber.baslik}
            />
          </SpotlightCard>
        );
      })}
    </div>
  );
}
