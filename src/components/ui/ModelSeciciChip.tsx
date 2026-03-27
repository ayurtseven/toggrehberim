"use client";

import { useState, useRef, useEffect } from "react";
import { useModelSecim } from "@/lib/model-secim";
import { VARYANTLAR } from "@/lib/varyantlar";

const T10X = VARYANTLAR.filter((v) => v.model === "t10x");
const T10F = VARYANTLAR.filter((v) => v.model === "t10f");

const MODEL_RENK = {
  t10x: "text-blue-400",
  t10f: "text-purple-400",
};

export default function ModelSeciciChip() {
  const { secili, sec } = useModelSecim();
  const [acik, setAcik] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const seciliVaryant = secili ? VARYANTLAR.find((v) => v.id === secili) : null;

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function kapat(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    if (acik) document.addEventListener("mousedown", kapat);
    return () => document.removeEventListener("mousedown", kapat);
  }, [acik]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAcik((p) => !p)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
          seciliVaryant
            ? "border-white/15 bg-white/8 text-white hover:bg-white/12"
            : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="text-[10px]">🚗</span>
        {seciliVaryant ? (
          <span>
            <span className={MODEL_RENK[seciliVaryant.model]}>
              {seciliVaryant.model.toUpperCase()}
            </span>{" "}
            {seciliVaryant.kisaAd}
          </span>
        ) : (
          "Aracım"
        )}
        <svg
          className={`h-3 w-3 transition-transform ${acik ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {acik && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
          {/* T10X grubu */}
          <ModelGrubu
            baslik="T10X"
            renk="text-blue-400"
            varyantlar={T10X}
            secili={secili}
            sec={(id) => { sec(id); setAcik(false); }}
          />

          <div className="mx-3 border-t border-white/8" />

          {/* T10F grubu */}
          <ModelGrubu
            baslik="T10F"
            renk="text-purple-400"
            varyantlar={T10F}
            secili={secili}
            sec={(id) => { sec(id); setAcik(false); }}
          />

          {/* Temizle */}
          {secili && (
            <>
              <div className="mx-3 border-t border-white/8" />
              <button
                onClick={() => { sec(null); setAcik(false); }}
                className="w-full px-4 py-2.5 text-left text-xs text-slate-500 hover:text-slate-300"
              >
                Seçimi kaldır
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ModelGrubu({
  baslik,
  renk,
  varyantlar,
  secili,
  sec,
}: {
  baslik: string;
  renk: string;
  varyantlar: typeof VARYANTLAR;
  secili: string | null;
  sec: (id: string) => void;
}) {
  return (
    <div className="py-2">
      <p className={`px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider ${renk}`}>
        {baslik}
      </p>
      {varyantlar.map((v) => {
        const aktif = secili === v.id;
        return (
          <button
            key={v.id}
            onClick={() => sec(v.id)}
            className={`flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-white/5 ${
              aktif ? "bg-white/8" : ""
            }`}
          >
            <div>
              <span className="text-sm font-medium text-white">{v.kisaAd}</span>
              <span className="ml-2 text-xs text-slate-500">
                {v.specs.batarya} · {v.specs.wltp}
              </span>
            </div>
            {aktif && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
