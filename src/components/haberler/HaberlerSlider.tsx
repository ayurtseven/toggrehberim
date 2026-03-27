"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useCallback } from "react";
import type { HaberMeta } from "@/lib/content/haberler";

const etiketRenkleri: Record<string, string> = {
  OTA:     "bg-blue-500/15 text-blue-300",
  yazılım: "bg-blue-500/15 text-blue-300",
  şarj:    "bg-yellow-500/15 text-yellow-300",
  ZES:     "bg-yellow-500/15 text-yellow-300",
  T10F:    "bg-violet-500/15 text-violet-300",
  T10X:    "bg-violet-500/15 text-violet-300",
};

const defaultEtiketRengi = "bg-white/8 text-neutral-400";

export default function HaberlerSlider({ haberler }: { haberler: HaberMeta[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const onceki = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const sonraki = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (haberler.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Son Haberler</h2>
        <div className="flex items-center gap-3">
          <Link href="/haberler" className="text-sm font-semibold text-[var(--togg-red)] transition-colors hover:text-red-400">
            Tümünü gör →
          </Link>
          <div className="flex gap-2">
            <button
              onClick={onceki}
              aria-label="Önceki haber"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-neutral-400 transition-colors hover:border-white/25 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={sonraki}
              aria-label="Sonraki haber"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-neutral-400 transition-colors hover:border-white/25 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {haberler.map((haber) => (
            <Link
              key={haber.slug}
              href={`/haberler/${haber.slug}`}
              className="group min-w-0 shrink-0 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <article className="h-full rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]">
                <p className="mb-2 text-xs text-neutral-600">
                  {new Date(haber.tarih).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mb-2 font-semibold leading-snug transition-colors group-hover:text-[var(--togg-red)] line-clamp-2">
                  {haber.baslik}
                </h3>
                <p className="text-sm text-neutral-500 line-clamp-3">
                  {haber.ozet}
                </p>
                {haber.etiketler && haber.etiketler.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {haber.etiketler.slice(0, 3).map((etiket) => (
                      <span
                        key={etiket}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${etiketRenkleri[etiket] ?? defaultEtiketRengi}`}
                      >
                        {etiket}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
