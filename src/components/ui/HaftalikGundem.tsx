"use client";

import { useState } from "react";

// ─── Tip ─────────────────────────────────────────────────────────────────────

export interface GundemItem {
  id: string;
  title: string;
  platform: string;
  summary: string;
  link: string;
  severity: "low" | "medium" | "high";
  hafta_basi?: string;
}

// ─── Stil sabitleri ───────────────────────────────────────────────────────────

const PLATFORM_RENK: Record<string, string> = {
  Resmi:   "bg-cyan-500/15 text-cyan-300",
  Haber:   "bg-slate-700/60 text-slate-300",
  Şikayet: "bg-red-500/15 text-red-400",
  Forum:   "bg-violet-500/15 text-violet-300",
  Pazar:   "bg-amber-500/15 text-amber-300",
};

const SEVERITY_CONFIG: Record<
  GundemItem["severity"],
  { border: string; bg: string; dot: string; icon: React.ReactNode }
> = {
  high: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    dot: "bg-red-500",
    icon: (
      <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  medium: {
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/4",
    dot: "bg-cyan-400",
    icon: null,
  },
  low: {
    border: "border-white/8",
    bg: "bg-white/2",
    dot: "bg-slate-600",
    icon: null,
  },
};

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function HaftalikGundem({
  items,
  haftaEtiketi,
}: {
  items: GundemItem[];
  haftaEtiketi?: string;
}) {
  const [filter, setFilter] = useState<GundemItem["severity"] | "hepsi">("hepsi");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (items.length === 0) return null;

  const filtered = filter === "hepsi" ? items : items.filter((i) => i.severity === filter);
  const counts = {
    high:   items.filter((i) => i.severity === "high").length,
    medium: items.filter((i) => i.severity === "medium").length,
    low:    items.filter((i) => i.severity === "low").length,
  };

  return (
    <section className="mx-auto max-w-5xl px-4 pb-10">
      <div className="rounded-2xl border border-cyan-500/20 bg-[#07111d] overflow-hidden shadow-xl shadow-cyan-950/30">

        {/* Başlık */}
        <div className="flex flex-col gap-3 border-b border-cyan-500/15 bg-gradient-to-r from-[#0a1e32] to-[#0d2035] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-sm">📡</span>
            <div>
              <h2 className="text-sm font-bold text-white">Haftalık Togg Gündemi</h2>
              <p className="text-[11px] text-cyan-500/70">
                {haftaEtiketi ?? ""} · {items.length} başlık
              </p>
            </div>
          </div>

          {/* Filtre butonları */}
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: "hepsi",  label: "Tümü",                           cls: "bg-slate-700/60 text-slate-300 hover:bg-slate-700",   activeCls: "bg-slate-600 text-white" },
              { key: "high",   label: `🚨 Kritik (${counts.high})`,     cls: "bg-red-500/10 text-red-400 hover:bg-red-500/20",      activeCls: "bg-red-500/25 text-red-300" },
              { key: "medium", label: `⚡ Önemli (${counts.medium})`,   cls: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",   activeCls: "bg-cyan-500/25 text-cyan-300" },
              { key: "low",    label: `📌 Bilgi (${counts.low})`,       cls: "bg-white/5 text-slate-500 hover:bg-white/8",          activeCls: "bg-white/12 text-slate-300" },
            ] as const).map(({ key, label, cls, activeCls }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${filter === key ? activeCls : cls}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div className="divide-y divide-white/5">
          {filtered.map((item) => {
            const cfg = SEVERITY_CONFIG[item.severity];
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} className={`${cfg.bg} ${isOpen ? cfg.border : ""} transition-colors`}>
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left"
                >
                  <div className="mt-1.5 shrink-0">
                    {cfg.icon ?? <span className={`block h-2 w-2 rounded-full ${cfg.dot}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PLATFORM_RENK[item.platform] ?? "bg-slate-700/60 text-slate-300"}`}>
                        {item.platform}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                  </div>
                  <svg
                    className={`mt-1 h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pl-[3.25rem]">
                    <p className="mb-3 text-sm leading-relaxed text-slate-400">{item.summary}</p>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 underline-offset-2 hover:underline"
                    >
                      Kaynağa git
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/15 bg-[#091826] px-5 py-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600">
            Haftanın Kritik Rehber İçeriği Önerisi
          </p>
          <p className="text-sm font-semibold text-white">
            📲 OTA Güncellemesi Öncesi Yapılması Gereken 5 Kontrol
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Güncel TruOS şikayetleri zirveye ulaştı. Güncelleme yüklemeden önce şarj seviyesi,
            Wi-Fi bağlantısı ve araç park konumu adımlarını anlatan rehber bu haftanın
            en öncelikli içerik fırsatı.
          </p>
          <a
            href="/rehber/yazilim/togg-ota-guncellemesi-nasil-yapilir-guncelleme-oncesi-kontrol-listesi"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline underline-offset-2"
          >
            Mevcut rehbere git →
          </a>
        </div>
      </div>
    </section>
  );
}
