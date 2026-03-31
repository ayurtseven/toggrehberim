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

const KAT_RENK: Record<string, { bg: string; text: string; label: string }> = {
  sarj:      { bg: "bg-blue-500/15",   text: "text-blue-300",   label: "Şarj & Batarya" },
  yazilim:   { bg: "bg-purple-500/15", text: "text-purple-300", label: "Yazılım" },
  suruculuk: { bg: "bg-green-500/15",  text: "text-green-300",  label: "Sürücülük" },
  bakim:     { bg: "bg-orange-500/15", text: "text-orange-300", label: "Bakım" },
  sss:       { bg: "bg-gray-500/15",   text: "text-gray-300",   label: "SSS" },
  haber:     { bg: "bg-red-500/15",    text: "text-red-300",    label: "Haber" },
};

function defaultLabel(key: string) {
  return KAT_RENK[key]?.label ?? key;
}

/** Tek bir içerik satırı (genişletilebilir) */
function IcerikSatiri({ ic }: { ic: IcerikKarti }) {
  const [acik, setAcik] = useState(false);
  const etiket = ic.kategori || ic.tur;
  const stil = KAT_RENK[etiket] ?? { bg: "bg-neutral-500/15", text: "text-neutral-300", label: etiket };
  const editUrl = `/admin/duzenle?dosya=${encodeURIComponent(ic.dosya)}`;

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
      <button
        onClick={() => setAcik((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5"
      >
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${stil.bg} ${stil.text}`}>
          {defaultLabel(etiket)}
        </span>
        <span className="flex-1 truncate text-sm text-slate-200">{ic.baslik}</span>
        <span className="shrink-0 text-xs text-slate-600">{ic.tarih}</span>
        <span className={`shrink-0 text-xs text-slate-600 transition-transform ${acik ? "rotate-180" : ""}`}>▼</span>
      </button>

      {acik && (
        <div className="border-t border-white/8 bg-black/20 px-4 py-3 space-y-2">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {ic.model && (
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-slate-400">{ic.model}</span>
            )}
            {ic.etiketler?.map((e) => (
              <span key={e} className="rounded-full bg-white/8 px-2 py-0.5 text-slate-500">#{e}</span>
            ))}
          </div>
          {ic.ozet && <p className="text-xs leading-relaxed text-slate-400">{ic.ozet}</p>}
          {ic.onizleme && <p className="line-clamp-2 text-xs text-slate-600">{ic.onizleme}</p>}
          <p className="font-mono text-[10px] text-slate-700">{ic.dosya}</p>
          <div className="pt-0.5">
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
}

/** Kategori grubu (başlık + içerik listesi, grup kapatılabilir) */
function KategoriGrubu({
  grupKey,
  icerikler,
}: {
  grupKey: string;
  icerikler: IcerikKarti[];
}) {
  const [acik, setAcik] = useState(true);
  const stil = KAT_RENK[grupKey] ?? { bg: "bg-neutral-500/15", text: "text-neutral-300", label: grupKey };

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {/* Grup başlığı */}
      <button
        onClick={() => setAcik((v) => !v)}
        className="flex w-full items-center gap-3 bg-white/4 px-4 py-2.5 text-left transition hover:bg-white/7"
      >
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${stil.bg} ${stil.text}`}>
          {defaultLabel(grupKey)}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-300">
          {icerikler.length} içerik
        </span>
        <span className={`text-xs text-slate-600 transition-transform ${acik ? "rotate-180" : ""}`}>▼</span>
      </button>

      {/* İçerikler */}
      {acik && (
        <div className="divide-y divide-white/5 px-3 py-2 space-y-1.5">
          {icerikler.map((ic) => (
            <IcerikSatiri key={ic.dosya} ic={ic} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Ana bileşen */
export default function IcerikListesi({
  baslik,
  renk,
  icerikler,
}: {
  baslik: string;
  renk: "yellow" | "green";
  icerikler: IcerikKarti[];
}) {
  if (icerikler.length === 0) return null;

  // Kategoriye göre grupla
  const grupMap = new Map<string, IcerikKarti[]>();
  for (const ic of icerikler) {
    const key = ic.kategori || ic.tur;
    if (!grupMap.has(key)) grupMap.set(key, []);
    grupMap.get(key)!.push(ic);
  }

  // Belirli sırayla göster
  const SIRA = ["sarj", "yazilim", "suruculuk", "bakim", "sss", "haber"];
  const siraliGruplar = [
    ...SIRA.filter((k) => grupMap.has(k)).map((k) => [k, grupMap.get(k)!] as const),
    ...[...grupMap.entries()].filter(([k]) => !SIRA.includes(k)),
  ];

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <span
          className={`h-2 w-2 rounded-full ${renk === "yellow" ? "bg-yellow-400" : "bg-green-400"}`}
        />
        {baslik}
        <span className="text-sm font-normal text-slate-500">({icerikler.length})</span>
      </h2>
      <div className="space-y-2">
        {siraliGruplar.map(([key, liste]) => (
          <KategoriGrubu key={key} grupKey={key} icerikler={liste} />
        ))}
      </div>
    </section>
  );
}
