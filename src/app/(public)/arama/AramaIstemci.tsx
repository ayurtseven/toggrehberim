"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { RehberMeta } from "@/lib/content/rehber";
import { searchRehberler } from "@/lib/search/fuse";

export default function AramaIstemci({ rehberler }: { rehberler: RehberMeta[] }) {
  const [sorgu, setSorgu] = useState("");

  const sonuclar = useMemo(
    () => searchRehberler(rehberler, sorgu),
    [rehberler, sorgu]
  );

  return (
    <>
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Şarj, OTA güncelleme, batarya..."
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-white/15 bg-slate-900 py-4 pl-12 pr-4 text-base text-white placeholder:text-slate-600 outline-none transition-colors focus:border-white/30"
        />
      </div>

      {sorgu && (
        <p className="mb-4 text-sm text-slate-500">
          {sonuclar.length} sonuç bulundu
        </p>
      )}

      <div className="space-y-3">
        {sonuclar.map((rehber) => (
          <Link
            key={`${rehber.kategori}/${rehber.slug}`}
            href={`/rehber/${rehber.kategori}/${rehber.slug}`}
            className="group block rounded-xl border border-white/10 bg-slate-900 p-4 transition-colors hover:border-white/20 hover:bg-slate-800"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize text-slate-400">
                {rehber.kategori}
              </span>
              {rehber.model !== "hepsi" && (
                <span className="rounded-full bg-[var(--togg-red)]/10 px-2 py-0.5 text-xs uppercase text-[var(--togg-red)]">
                  {rehber.model}
                </span>
              )}
            </div>
            <p className="font-semibold text-white group-hover:text-[var(--togg-red)] transition-colors">
              {rehber.baslik}
            </p>
            <p className="mt-1 text-sm text-slate-500 line-clamp-1">
              {rehber.ozet}
            </p>
          </Link>
        ))}

        {sorgu && sonuclar.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-600">
            &quot;{sorgu}&quot; için sonuç bulunamadı.
          </p>
        )}
      </div>
    </>
  );
}
