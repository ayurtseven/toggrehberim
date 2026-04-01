"use client";

/**
 * TOGGREHBERI — Blueprint Phase 2: Vehicle State Context
 * Kullanıcıdan araç durumunu alır (Sürüyor / Park / Şarjda).
 * Rule engine'e VehicleState olarak geçirilir.
 */

import type { VehicleState } from "@/lib/triage-types";

type DurumSec = "suruyor" | "park" | "sarjda";

const DURUMLAR: { id: DurumSec; label: string; icon: string; hint: string }[] = [
  { id: "suruyor", label: "Sürüyorum",  icon: "🚗", hint: "Araç hareket halinde" },
  { id: "park",    label: "Parkta",     icon: "🅿️", hint: "Motor kapalı, park halinde" },
  { id: "sarjda",  label: "Şarjda",    icon: "⚡", hint: "Şarj kablosu bağlı" },
];

function durumToState(durum: DurumSec): VehicleState {
  return {
    isRunning:     durum === "suruyor",
    onCharging:    durum === "sarjda",
    batteryLevel:  -1,  // bilinmiyor
    lastFaultCount: 0,
  };
}

interface Props {
  value: VehicleState;
  onChange: (state: VehicleState) => void;
}

export default function AracDurumu({ value, onChange }: Props) {
  const aktif: DurumSec = value.isRunning ? "suruyor" : value.onCharging ? "sarjda" : "park";

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
        Araç şu an ne yapıyor?
      </p>
      <div className="grid grid-cols-3 gap-2">
        {DURUMLAR.map((d) => (
          <button
            key={d.id}
            onClick={() => onChange(durumToState(d.id))}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-center text-xs font-semibold transition-all ${
              aktif === d.id
                ? "border-[var(--togg-red)]/40 bg-[var(--togg-red)]/10 text-[var(--togg-red)]"
                : "border-white/8 bg-slate-900 text-slate-500 hover:border-white/15 hover:text-slate-300"
            }`}
          >
            <span className="text-xl">{d.icon}</span>
            <span>{d.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-center text-[11px] text-slate-700">
        {DURUMLAR.find((d) => d.id === aktif)?.hint}
      </p>
    </div>
  );
}
