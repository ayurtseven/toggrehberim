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
  guc,
  not,
  sonGuncelleme,
  gizli: baslangicGizli,
  onKaydet,
  onGizliToggle,
}: {
  satir: SarjTarifeRow;
  fiyat: string;
  guc: string;
  not: string;
  sonGuncelleme: string;
  gizli: boolean;
  onKaydet: (id: string, fiyat: string, guc: string, not: string) => Promise<void>;
  onGizliToggle: (id: string, gizli: boolean) => Promise<void>;
}) {
  const [yeniFiyat, setYeniFiyat] = useState(fiyat === "—" ? "" : fiyat);
  const [yeniGuc, setYeniGuc] = useState(guc || satir.guc);
  const [yeniNot, setYeniNot] = useState(not);
  const [gizli, setGizli] = useState(baslangicGizli);
  const [durum, setDurum] = useState<"idle" | "saving" | "ok" | "err">("idle");

  const degisti =
    (yeniFiyat || "—") !== fiyat ||
    yeniGuc !== (guc || satir.guc) ||
    yeniNot !== not;

  async function kaydet() {
    setDurum("saving");
    try {
      await onKaydet(satir.id, yeniFiyat.trim() || "—", yeniGuc.trim(), yeniNot.trim());
      setDurum("ok");
      setTimeout(() => setDurum("idle"), 2000);
    } catch {
      setDurum("err");
      setTimeout(() => setDurum("idle"), 2000);
    }
  }

  async function toggleGizli() {
    setDurum("saving");
    try {
      await onGizliToggle(satir.id, !gizli);
      setGizli(!gizli);
      setDurum("idle");
    } catch {
      setDurum("err");
      setTimeout(() => setDurum("idle"), 2000);
    }
  }

  if (gizli) {
    return (
      <div className="flex items-center gap-3 border-b border-white/5 py-2.5 last:border-0 opacity-40">
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
          satir.tip === "dc" ? "bg-[var(--togg-red)]/15 text-[var(--togg-red)]" : "bg-blue-500/15 text-blue-400"
        }`}>
          {satir.tip.toUpperCase()}
        </span>
        <span className="flex-1 text-sm text-slate-600 line-through">{yeniGuc}</span>
        <span className="text-xs text-slate-700">Gizli</span>
        <button
          onClick={toggleGizli}
          disabled={durum === "saving"}
          className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-300 hover:border-white/25 transition disabled:opacity-50"
        >
          {durum === "saving" ? "..." : "Geri Al"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/5 py-3 last:border-0">
      {/* Tip badge */}
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
        satir.tip === "dc" ? "bg-[var(--togg-red)]/15 text-[var(--togg-red)]" : "bg-blue-500/15 text-blue-400"
      }`}>
        {satir.tip.toUpperCase()}
      </span>

      {/* Güç input */}
      <input
        type="text"
        value={yeniGuc}
        onChange={(e) => setYeniGuc(e.target.value)}
        placeholder={satir.guc}
        className="w-28 shrink-0 rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:border-white/30 focus:outline-none"
      />

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

      {/* Gizle butonu */}
      {!degisti && durum === "idle" && (
        <button
          onClick={toggleGizli}
          className="shrink-0 rounded-lg border border-white/8 px-2.5 py-1 text-[11px] text-slate-600 hover:border-red-500/30 hover:text-red-400 transition"
          title="Bu satırı gizle"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function SarjFiyatEditor({
  satirlar,
  fiyatMap,
}: {
  satirlar: SarjTarifeRow[];
  fiyatMap: Record<string, { fiyat: string; guc: string; not: string; son_guncelleme: string; gizli: boolean }>;
}) {
  const oplar = [...new Set(satirlar.map((s) => s.operator_id))];

  async function kaydet(id: string, fiyat: string, guc: string, not: string) {
    const res = await fetch("/api/admin/sarj-fiyatlari", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fiyat, guc, not }),
    });
    if (!res.ok) {
      const hata = await res.json().catch(() => ({}));
      throw new Error(hata.error ?? "Güncelleme başarısız");
    }
  }

  async function gizliToggle(id: string, gizli: boolean) {
    const res = await fetch("/api/admin/sarj-fiyatlari", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, gizli }),
    });
    if (!res.ok) {
      const hata = await res.json().catch(() => ({}));
      throw new Error(hata.error ?? "Güncelleme başarısız");
    }
  }

  return (
    <div className="space-y-4">
      {/* Sütun başlıkları */}
      <div className="flex flex-wrap items-center gap-3 px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
        <span className="w-10 shrink-0">Tip</span>
        <span className="w-28 shrink-0">kW / Güç</span>
        <span className="w-24">Fiyat</span>
        <span className="flex-1">Not</span>
      </div>

      {oplar.map((opId) => {
        const opSatirlar = satirlar.filter((s) => s.operator_id === opId);
        const renk = OP_RENK[opId] ?? "text-slate-400";
        const ad = opSatirlar[0]?.operatorAd ?? opId;
        return (
          <div key={opId} className="rounded-xl border border-white/10 bg-slate-900 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
              <span className={`font-bold ${renk}`}>{ad}</span>
            </div>

            <div className="px-4">
              {opSatirlar.map((satir) => {
                const kayit = fiyatMap[satir.id] ?? { fiyat: "—", guc: "", not: "", son_guncelleme: "—", gizli: false };
                return (
                  <TarifeSatiri
                    key={satir.id}
                    satir={satir}
                    fiyat={kayit.fiyat}
                    guc={kayit.guc}
                    not={kayit.not}
                    sonGuncelleme={kayit.son_guncelleme}
                    gizli={kayit.gizli}
                    onKaydet={kaydet}
                    onGizliToggle={gizliToggle}
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
