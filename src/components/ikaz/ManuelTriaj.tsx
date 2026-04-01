"use client";

/**
 * TOGGREHBERI — Blueprint Phase 2: Manual Triage Pathway
 * Tetiklenir: AI fallback (LOW confidence, TIMEOUT, OFFLINE)
 * Kullanıcıya kategoriler ve semptomlar sunulur → sembol seçilir → rule engine çalışır.
 */

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import type { IkazSembolu } from "@/lib/ikaz-sembolleri";
import type { VehicleState } from "@/lib/triage-types";

// ─── Hızlı semptom kategorileri ──────────────────────────────────────────────

const SEMPTOMLAR = [
  { id: "batarya",   label: "Batarya / Şarj",  icon: "🔋", keywords: ["batarya", "şarj", "menzil"] },
  { id: "ikaz",      label: "Uyarı Lambası",   icon: "🔴", keywords: ["kırmızı", "sarı", "ikaz", "uyarı"] },
  { id: "frenleme",  label: "Frenler / ABS",   icon: "🛑", keywords: ["fren", "abs", "esp", "park"] },
  { id: "motor",     label: "Motor / Performans", icon: "⚙️", keywords: ["motor", "kaplumbağa", "güç", "hız"] },
  { id: "lastik",    label: "Lastik Basıncı",  icon: "🛞", keywords: ["lastik", "basınç", "tpms"] },
  { id: "diger",     label: "Diğer",           icon: "❓", keywords: [] },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  semboller: IkazSembolu[];
  vehicleState: VehicleState;
  onSembolSec: (sembol: IkazSembolu) => void;
  fallbackMesaj?: string;
}

export default function ManuelTriaj({ semboller, vehicleState: _vehicleState, onSembolSec, fallbackMesaj }: Props) {
  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliKategori, setSeciliKategori] = useState<string | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(semboller, {
        keys: [
          { name: "ad", weight: 0.5 },
          { name: "anahtar_kelimeler", weight: 0.35 },
          { name: "anlami", weight: 0.15 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [semboller]
  );

  const filtrelenmis = useMemo(() => {
    if (aramaMetni.trim()) {
      return fuse.search(aramaMetni.trim()).map((r) => r.item).slice(0, 10);
    }
    if (seciliKategori && seciliKategori !== "diger") {
      const semptom = SEMPTOMLAR.find((s) => s.id === seciliKategori);
      if (semptom && semptom.keywords.length > 0) {
        return semboller
          .filter((s) =>
            semptom.keywords.some(
              (k) =>
                s.ad.toLowerCase().includes(k) ||
                s.anahtar_kelimeler.some((ak) => ak.toLowerCase().includes(k))
            )
          )
          .slice(0, 12);
      }
    }
    return seciliKategori === "diger" ? semboller.slice(0, 20) : [];
  }, [aramaMetni, seciliKategori, fuse, semboller]);

  const RENK_DOT: Record<IkazSembolu["renk"], string> = {
    kirmizi: "bg-red-500",
    sari: "bg-amber-400",
    yesil: "bg-green-500",
    mavi: "bg-blue-500",
    beyaz: "bg-neutral-300",
  };

  return (
    <div className="space-y-4">
      {/* Fallback mesajı */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3">
        <span className="text-lg">🤔</span>
        <p className="text-sm text-yellow-200">
          {fallbackMesaj ?? "Fotoğraf tam analiz edilemedi. Sembolü listeden seçerek devam edebilirsin."}
        </p>
      </div>

      {/* Arama */}
      <input
        type="search"
        value={aramaMetni}
        onChange={(e) => { setAramaMetni(e.target.value); setSeciliKategori(null); }}
        placeholder="Sembol adı veya anahtar kelime ara..."
        className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
      />

      {/* Kategori seçici */}
      {!aramaMetni.trim() && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            Sorun nerede?
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SEMPTOMLAR.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeciliKategori(seciliKategori === s.id ? null : s.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                  seciliKategori === s.id
                    ? "border-[var(--togg-red)]/40 bg-[var(--togg-red)]/10 text-[var(--togg-red)]"
                    : "border-white/8 bg-slate-900 text-slate-500 hover:border-white/15 hover:text-slate-300"
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                <span className="text-center leading-tight">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sembol listesi */}
      {filtrelenmis.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-600">{filtrelenmis.length} sonuç</p>
          {filtrelenmis.map((sembol) => (
            <button
              key={sembol.id}
              onClick={() => onSembolSec(sembol)}
              className="group w-full flex items-center gap-3 rounded-xl border border-white/8 bg-slate-900 p-3 text-left transition-all hover:border-white/20 hover:bg-slate-800"
            >
              <span className={`h-3 w-3 shrink-0 rounded-full ${RENK_DOT[sembol.renk]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                  {sembol.ad}
                </p>
                <p className="text-xs text-slate-600 truncate">{sembol.kitapcik_aciklama}</p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-slate-700 group-hover:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {!aramaMetni.trim() && !seciliKategori && (
        <p className="text-center text-xs text-slate-700 py-4">
          Kategori seç veya arama kutusuna yaz
        </p>
      )}
    </div>
  );
}
