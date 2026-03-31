"use client";

import { useState } from "react";
import type { SarjTarifeRow } from "./page";

const OP_RENK: Record<string, string> = {
  trugo: "text-red-400",
  zes: "text-blue-400",
  esarj: "text-green-400",
  beefull: "text-orange-400",
  voltrun: "text-violet-400",
  sharz: "text-cyan-400",
};

function TarifeSatiri({
  satir,
  fiyat,
  not,
  sonGuncelleme,
  onKaydet,
}: {
  satir: SarjTarifeRow;
  fiyat: string;
  not: string;
  sonGuncelleme: string;
  onKaydet: (id: string, fiyat: string, not: string) => Promise<void>;
}) {
  const [yeniFiyat, setYeniFiyat] = useState(fiyat === "—" ? "" : fiyat);
  const [yeniNot, setYeniNot] = useState(not);
  const [durum, setDurum] = useState<"idle" | "saving" | "ok" | "err">("idle");

  const degisti =
    (yeniFiyat || "—") !== fiyat || yeniNot !== not;

  async function kaydet() {
    setDurum("saving");
    try {
      await onKaydet(satir.id, yeniFiyat.trim() || "—", yeniNot.trim());
      setDurum("ok");
      setTimeout(() => setDurum("idle"), 2000);
    } catch {
      setDurum("err");
      setTimeout(() => setDurum("idle"), 2000);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/5 py-3 last:border-0">
      {/* Tip badge */}
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
          satir.tip === "dc"
            ? "bg-[var(--togg-red)]/15 text-[var(--togg-red)]"
            : "bg-blue-500/15 text-blue-400"
        }`}
      >
        {satir.tip.toUpperCase()}
      </span>

      {/* Güç */}
      <span className="w-20 shrink-0 text-sm text-slate-400">{satir.guc}</span>

      {/* Fiyat input */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={yeniFiyat}
          onChange={(e) => setYeniFiyat(e.target.value)}
          placeholder="—"
          className="w-24 rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:outline-none"
        />
        <span className="text-xs text-slate-600">{satir.birim}</span>
      </div>

      {/* Not input */}
      <input
        type="text"
        value={yeniNot}
        onChange={(e) => setYeniNot(e.target.value)}
        placeholder="Not (isteğe bağlı)"
        className="flex-1 min-w-[120px] rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-400 placeholder:text-slate-700 focus:border-white/30 focus:outline-none"
      />

      {/* Son güncelleme */}
      {sonGuncelleme !== "—" && (
        <span className="shrink-0 text-[10px] text-slate-700">{sonGuncelleme}</span>
      )}

      {/* Kaydet */}
      {degisti && (
        <button
          onClick={kaydet}
          disabled={durum === "saving"}
          className="shrink-0 rounded-lg bg-[var(--togg-red)] px-3 py-1.5 text-[11px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {durum === "saving" ? "..." : "Kaydet"}
        </button>
      )}
      {durum === "ok" && <span className="shrink-0 text-[11px] text-emerald-400">✓</span>}
      {durum === "err" && <span className="shrink-0 text-[11px] text-red-400">Hata</span>}
    </div>
  );
}

export default function SarjFiyatEditor({
  satirlar,
  fiyatMap,
}: {
  satirlar: SarjTarifeRow[];
  fiyatMap: Record<string, { fiyat: string; not: string; son_guncelleme: string }>;
}) {
  // Operatörlere göre grupla
  const oplar = [...new Set(satirlar.map((s) => s.operator_id))];

  async function kaydet(id: string, fiyat: string, not: string) {
    const res = await fetch("/api/admin/sarj-fiyatlari", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fiyat, not }),
    });
    if (!res.ok) {
      const hata = await res.json().catch(() => ({}));
      throw new Error(hata.error ?? "Güncelleme başarısız");
    }
  }

  return (
    <div className="space-y-4">
      {oplar.map((opId) => {
        const opSatirlar = satirlar.filter((s) => s.operator_id === opId);
        const renk = OP_RENK[opId] ?? "text-slate-400";
        const ad = opSatirlar[0]?.operatorAd ?? opId;
        return (
          <div key={opId} className="rounded-xl border border-white/10 bg-slate-900 overflow-hidden">
            {/* Operatör başlığı */}
            <div className={`flex items-center gap-2 border-b border-white/8 px-4 py-3`}>
              <span className={`font-bold ${renk}`}>{ad}</span>
            </div>

            {/* Tarifeler */}
            <div className="px-4">
              {opSatirlar.map((satir) => {
                const kayit = fiyatMap[satir.id] ?? { fiyat: "—", not: "", son_guncelleme: "—" };
                return (
                  <TarifeSatiri
                    key={satir.id}
                    satir={satir}
                    fiyat={kayit.fiyat}
                    not={kayit.not}
                    sonGuncelleme={kayit.son_guncelleme}
                    onKaydet={kaydet}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
