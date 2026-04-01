"use client";

/**
 * TOGGREHBERI — Blueprint Phase 1
 * Emergency triage result card.
 * Full-screen colored status bar, max 3 action steps, service CTAs.
 */

import type { TriageResult } from "@/lib/triage-types";
import { logServiceDirected } from "@/lib/analytics";

// ─── Status renk haritası ─────────────────────────────────────────────────────

const STATUS_STYLE = {
  STOP_NOW: {
    bar: "bg-red-600",
    badge: "bg-red-600 text-white",
    border: "border-red-500/40",
    bg: "bg-red-500/8",
    text: "text-red-300",
    icon: "🛑",
    label: "HEMEN DUR",
  },
  SERVICE_ASAP: {
    bar: "bg-orange-500",
    badge: "bg-orange-500 text-white",
    border: "border-orange-500/30",
    bg: "bg-orange-500/8",
    text: "text-orange-300",
    icon: "⚠️",
    label: "YAKINDA SERVİSE GİT",
  },
  PROCEED_CAREFUL: {
    bar: "bg-yellow-500",
    badge: "bg-yellow-500/20 text-yellow-300",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/8",
    text: "text-yellow-300",
    icon: "⚡",
    label: "DİKKATLİ İLERLE",
  },
  INFO_ONLY: {
    bar: "bg-blue-500",
    badge: "bg-blue-500/20 text-blue-300",
    border: "border-blue-500/20",
    bg: "bg-blue-500/8",
    text: "text-blue-300",
    icon: "ℹ️",
    label: "BİLGİ",
  },
};

const CONFIDENCE_LABEL = {
  HIGH:   { cls: "bg-emerald-500/15 text-emerald-400", text: "Yüksek güven ✓" },
  MEDIUM: { cls: "bg-yellow-500/15 text-yellow-400",   text: "Orta güven — servisi teyit edin" },
  LOW:    { cls: "bg-slate-700 text-slate-400",         text: "Düşük güven" },
};

// ─── Bileşen ──────────────────────────────────────────────────────────────────

interface Props {
  triage: TriageResult;
  onReset: () => void;
  onManualTriage?: () => void;
}

export default function TriajSonuc({ triage, onReset, onManualTriage }: Props) {
  const style = STATUS_STYLE[triage.status];
  const confStyle = CONFIDENCE_LABEL[triage.confidence];

  function handleServiceCall() {
    logServiceDirected(triage.offlineMode);
    window.location.href = `tel:${triage.servicePhone.replace(/\s/g, "")}`;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      {/* Status color bar */}
      <div className={`h-2 w-full ${style.bar}`} />

      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-2xl">{style.icon}</span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}>
                {style.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${confStyle.cls}`}>
                {confStyle.text}
              </span>
            </div>
            <p className={`mt-2 text-base font-semibold leading-snug ${style.text}`}>
              {triage.summary}
            </p>
          </div>
        </div>

        {/* Vehicle state advice */}
        {triage.vehicleStateAdvice && (
          <div className="flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3">
            <span className="mt-0.5 text-sm">📍</span>
            <p className="text-sm text-yellow-200">{triage.vehicleStateAdvice}</p>
          </div>
        )}

        {/* Action steps */}
        {triage.steps.length > 0 && !triage.manualTriageRequired && (
          <div className="space-y-2.5">
            {triage.steps.map((step) => (
              <div key={step.order} className="flex items-start gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.badge}`}>
                  {step.order}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{step.action}</p>
                  {step.detail && (
                    <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Offline banner */}
        {triage.offlineMode && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3">
            <span className="text-sm">📵</span>
            <p className="text-xs text-slate-400">
              Çevrimdışısın. Bu adımlar cihazda önbelleğe alınmış verilere dayanmaktadır.
              Bağlantı sağlandığında servis konumunu gösterebiliriz.
            </p>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Service call */}
          {(triage.serviceRequired || triage.status === "STOP_NOW") && (
            <button
              onClick={handleServiceCall}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--togg-red)] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              📞 Togg Care Ara
              <span className="text-xs font-normal opacity-80">{triage.servicePhone}</span>
            </button>
          )}

          {/* Nearby service (GPS-based) */}
          {triage.nearbyServiceEnabled && !triage.offlineMode && (
            <a
              href="/servis-noktalari"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              🗺️ En Yakın Servis
            </a>
          )}
        </div>

        {/* Manual triage fallback */}
        {triage.manualTriageRequired && onManualTriage && (
          <button
            onClick={onManualTriage}
            className="w-full rounded-xl border border-dashed border-white/15 py-3 text-sm font-semibold text-slate-400 transition hover:border-white/30 hover:text-slate-300"
          >
            Listeden sembolü seç →
          </button>
        )}

        {/* Reset */}
        <div className="flex items-center justify-between border-t border-white/6 pt-3">
          <button
            onClick={onReset}
            className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
          >
            ← Yeni fotoğraf çek
          </button>
          {triage.alertId && (
            <a
              href={`/ikaz/${triage.alertId}`}
              className="text-xs font-semibold text-[var(--togg-red)] hover:text-red-400 transition-colors"
            >
              Detaylı bilgi →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
