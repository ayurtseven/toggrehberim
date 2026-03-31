"use client";

import { useState, useMemo } from "react";

interface SarjTarife {
  id: string;
  tip: "ac" | "dc";
  guc: string;
  fiyat: string;
  birim: string;
  not?: string;
}

interface Operator {
  id: string;
  ad: string;
  renk: string;
  logoBg: string;
  url: string;
  app: string;
  toggNot?: string;
  tarifeler: SarjTarife[];
}

type TipFiltre = "tumu" | "ac" | "dc";
type SiralamaYon = "ucuz" | "pahali";

function fiyatSayi(fiyat: string): number {
  if (!fiyat || fiyat === "—") return Infinity;
  return parseFloat(fiyat.replace(",", ".")) || Infinity;
}

export default function SarjFiyatListesi({ operatorler }: { operatorler: Operator[] }) {
  const [tipFiltre, setTipFiltre] = useState<TipFiltre>("tumu");
  const [gorunum, setGorunum] = useState<"kart" | "liste">("kart");
  const [siralama, setSiralama] = useState<SiralamaYon>("ucuz");

  // Düz liste — tüm operatörlerin tarifeleri
  const duzListe = useMemo(() => {
    const satirlar = operatorler.flatMap((op) =>
      op.tarifeler.map((t) => ({ ...t, operatorAd: op.ad, operatorRenk: op.renk }))
    );
    const filtered = tipFiltre === "tumu" ? satirlar : satirlar.filter((s) => s.tip === tipFiltre);
    return filtered.sort((a, b) => {
      const fark = fiyatSayi(a.fiyat) - fiyatSayi(b.fiyat);
      return siralama === "ucuz" ? fark : -fark;
    });
  }, [operatorler, tipFiltre, siralama]);

  // Kart görünümü için filtreli operatörler
  const filtreliOperatorler = useMemo(() => {
    if (tipFiltre === "tumu") return operatorler;
    return operatorler
      .map((op) => ({ ...op, tarifeler: op.tarifeler.filter((t) => t.tip === tipFiltre) }))
      .filter((op) => op.tarifeler.length > 0);
  }, [operatorler, tipFiltre]);

  return (
    <div>
      {/* ── Kontrol Çubuğu ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* AC / DC filtre */}
        <div className="flex rounded-xl border border-white/10 bg-slate-900/60 p-1 gap-1">
          {(["tumu", "ac", "dc"] as TipFiltre[]).map((f) => (
            <button
              key={f}
              onClick={() => setTipFiltre(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                tipFiltre === f
                  ? f === "ac"
                    ? "bg-blue-500/20 text-blue-300 shadow-sm"
                    : f === "dc"
                    ? "bg-[var(--togg-red)]/20 text-[var(--togg-red)] shadow-sm"
                    : "bg-slate-700/60 text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f === "tumu" ? "Tümü" : f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Görünüm toggle */}
          <div className="flex rounded-xl border border-white/10 bg-slate-900/60 p-1 gap-1">
            <button
              onClick={() => setGorunum("kart")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                gorunum === "kart" ? "bg-slate-700/60 text-slate-100" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Kart görünümü"
            >
              ▦ Kart
            </button>
            <button
              onClick={() => setGorunum("liste")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                gorunum === "liste" ? "bg-slate-700/60 text-slate-100" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Liste görünümü"
            >
              ☰ Liste
            </button>
          </div>

          {/* Sıralama — sadece liste görünümünde */}
          {gorunum === "liste" && (
            <button
              onClick={() => setSiralama(siralama === "ucuz" ? "pahali" : "ucuz")}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-white/20 transition"
            >
              {siralama === "ucuz" ? "↑ Ucuzdan Pahalıya" : "↓ Pahalıdan Ucuza"}
            </button>
          )}
        </div>
      </div>

      {/* ── Kart Görünümü ── */}
      {gorunum === "kart" && (
        <div className="space-y-4">
          {filtreliOperatorler.map((op) => (
            <div key={op.id} className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
              <div className="flex items-center gap-4 border-b border-white/8 px-5 py-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${op.logoBg} text-base font-black`}
                  style={{ color: op.renk }}
                >
                  {op.ad[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{op.ad}</p>
                  {op.toggNot && <p className="text-xs text-slate-500">{op.toggNot}</p>}
                </div>
                <a
                  href={op.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white hover:border-white/25"
                >
                  Web →
                </a>
              </div>

              <div className="divide-y divide-white/5">
                {op.tarifeler.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      t.tip === "dc" ? "bg-[var(--togg-red)]/15 text-[var(--togg-red)]" : "bg-blue-500/15 text-blue-400"
                    }`}>
                      {t.tip.toUpperCase()}
                    </span>
                    <span className="flex-1 text-sm text-slate-400">{t.guc}</span>
                    <span className={`text-sm font-bold ${t.fiyat === "—" ? "text-slate-600" : "text-white"}`}>
                      {t.fiyat}
                    </span>
                    <span className="text-xs text-slate-600">{t.birim}</span>
                    {t.not && <span className="text-xs text-yellow-500/70">{t.not}</span>}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end border-t border-white/8 px-5 py-2.5">
                <a
                  href={op.app}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold transition-colors hover:opacity-80"
                  style={{ color: op.renk }}
                >
                  Uygulamayı İndir →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Liste Görünümü ── */}
      {gorunum === "liste" && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
          {/* Başlık satırı */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-white/8 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            <span className="w-10">Tip</span>
            <span>Ağ / Güç</span>
            <span className="text-right">Fiyat</span>
            <span className="w-14 text-right">Birim</span>
          </div>

          <div className="divide-y divide-white/5">
            {duzListe.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-600">Veri yok.</p>
            ) : (
              duzListe.map((satir) => (
                <div key={satir.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-5 py-3">
                  <span className={`w-10 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    satir.tip === "dc" ? "bg-[var(--togg-red)]/15 text-[var(--togg-red)]" : "bg-blue-500/15 text-blue-400"
                  }`}>
                    {satir.tip.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{satir.operatorAd}</span>
                    <span className="text-xs text-slate-500">{satir.guc}</span>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${satir.fiyat === "—" ? "text-slate-600" : "text-white"}`}>
                    {satir.fiyat}
                  </span>
                  <span className="w-14 text-right text-xs text-slate-600">{satir.birim}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
