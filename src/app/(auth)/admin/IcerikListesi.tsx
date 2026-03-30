"use client";

import { useState } from "react";
import Link from "next/link";

export interface IcerikKarti {
  dosya: string;
  baslik: string;
  tarih: string;
  tur: "haber" | "rehber";
  kategori?: string;
  taslak: boolean;
  ozet?: string;
  model?: string;
  etiketler?: string[];
  onizleme?: string;
}

const KAT_RENK: Record<string, string> = {
  sarj: "bg-blue-500/20 text-blue-300",
  yazilim: "bg-purple-500/20 text-purple-300",
  suruculuk: "bg-green-500/20 text-green-300",
  bakim: "bg-orange-500/20 text-orange-300",
  sss: "bg-gray-500/20 text-gray-300",
  haber: "bg-red-500/20 text-red-300",
};

export default function IcerikListesi({
  baslik,
  renk,
  icerikler,
}: {
  baslik: string;
  renk: "yellow" | "green";
  icerikler: IcerikKarti[];
}) {
  const [acikId, setAcikId] = useState<string | null>(null);

  if (icerikler.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <span className={`h-2 w-2 rounded-full ${renk === "yellow" ? "bg-yellow-400" : "bg-green-400"}`} />
        {baslik} <span className="text-sm font-normal text-slate-500">({icerikler.length})</span>
      </h2>
      <div className="space-y-1.5">
        {icerikler.map((ic) => {
          const etiket = ic.kategori || ic.tur;
          const renkSinif = KAT_RENK[etiket] || "bg-neutral-500/20 text-neutral-300";
          const editUrl = `/admin/duzenle?dosya=${encodeURIComponent(ic.dosya)}`;
          const acik = acikId === ic.dosya;

          return (
            <div key={ic.dosya} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
              {/* Satır */}
              <button
                onClick={() => setAcikId(acik ? null : ic.dosya)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
              >
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${renkSinif}`}>
                  {etiket}
                </span>
                <span className="flex-1 truncate text-sm text-slate-200">{ic.baslik}</span>
                <span className="shrink-0 text-xs text-slate-500">{ic.tarih}</span>
                <span className={`shrink-0 text-xs text-slate-500 transition-transform ${acik ? "rotate-180" : ""}`}>▼</span>
              </button>

              {/* Expanded detay */}
              {acik && (
                <div className="border-t border-white/8 bg-black/20 px-4 py-3 space-y-2">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {ic.model && (
                      <span className="rounded-full bg-white/8 px-2 py-0.5 text-slate-400">{ic.model}</span>
                    )}
                    {ic.etiketler?.map((e) => (
                      <span key={e} className="rounded-full bg-white/8 px-2 py-0.5 text-slate-500">#{e}</span>
                    ))}
                  </div>
                  {ic.ozet && (
                    <p className="text-xs text-slate-400 leading-relaxed">{ic.ozet}</p>
                  )}
                  {ic.onizleme && (
                    <p className="text-xs text-slate-600 line-clamp-2">{ic.onizleme}</p>
                  )}
                  <p className="text-[10px] text-slate-600 font-mono">{ic.dosya}</p>
                  <div className="pt-1">
                    <Link
                      href={editUrl}
                      className="inline-block rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
                    >
                      ✏️ Düzenle
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
