"use client";

import { useState, useMemo } from "react";
import type { ServisNoktasi } from "@/lib/servis-noktalari";
import { googleMapsUrl } from "@/lib/servis-noktalari";

export default function ServisListesi({ noktalar }: { noktalar: ServisNoktasi[] }) {
  const [seciliIl, setSeciliIl] = useState<string | null>(null);

  const iller = useMemo(
    () => [...new Set(noktalar.map((n) => n.il))].sort((a, b) => a.localeCompare(b, "tr")),
    [noktalar]
  );

  const filtrelenmis = useMemo(
    () => (seciliIl ? noktalar.filter((n) => n.il === seciliIl) : noktalar),
    [noktalar, seciliIl]
  );

  const gruplar = useMemo(() => {
    const map = new Map<string, ServisNoktasi[]>();
    for (const n of filtrelenmis) {
      if (!map.has(n.il)) map.set(n.il, []);
      map.get(n.il)!.push(n);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "tr"));
  }, [filtrelenmis]);

  return (
    <>
      {/* İl filtre çipleri */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSeciliIl(null)}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
            seciliIl === null
              ? "border-[var(--togg-red)] bg-[var(--togg-red)]/15 text-[var(--togg-red)]"
              : "border-white/15 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white"
          }`}
        >
          Tümü
          <span className="ml-1.5 text-xs opacity-60">({noktalar.length})</span>
        </button>
        {iller.map((il) => {
          const count = noktalar.filter((n) => n.il === il).length;
          return (
            <button
              key={il}
              onClick={() => setSeciliIl(il === seciliIl ? null : il)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                seciliIl === il
                  ? "border-[var(--togg-red)] bg-[var(--togg-red)]/15 text-[var(--togg-red)]"
                  : "border-white/15 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white"
              }`}
            >
              {il}
              {count > 1 && <span className="ml-1.5 text-xs opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Gruplar */}
      <div className="space-y-10">
        {gruplar.map(([il, liste]) => (
          <section key={il} id={il.toLowerCase().replace(/\s/g, "-")}>
            <h2 className="mb-4 flex items-center gap-3 text-lg font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--togg-red)]/15 text-xs font-bold text-[var(--togg-red)]">
                {liste.length}
              </span>
              {il}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {liste.map((nokta) => (
                <div
                  key={nokta.id}
                  className={`relative flex flex-col rounded-2xl border bg-slate-900 p-5 transition-all ${
                    nokta.yakinZamanda
                      ? "border-yellow-500/25 opacity-70"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {nokta.yakinZamanda && (
                    <span className="absolute right-4 top-4 rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-400">
                      Yakında
                    </span>
                  )}
                  <p className="mb-1 text-base font-bold text-white">{nokta.ilce}</p>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400">{nokta.adres}</p>

                  {/* Telefonlar */}
                  {(nokta.telefonlar && nokta.telefonlar.length > 0) ? (
                    <div className="mb-3 space-y-1">
                      {nokta.telefonlar.map((tel) => (
                        <a
                          key={tel}
                          href={`tel:${tel.replace(/\s/g, "")}`}
                          className="flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[var(--togg-red)]"
                        >
                          <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {tel}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-3 flex items-center gap-2 text-xs text-slate-600">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Telefon ekleniyor...
                    </p>
                  )}

                  {!nokta.yakinZamanda && (
                    <a
                      href={nokta.maps_url || googleMapsUrl(nokta.koordinat.lat, nokta.koordinat.lon)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-white/8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/15"
                    >
                      <svg className="h-4 w-4 text-[var(--togg-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Konuma Git
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
