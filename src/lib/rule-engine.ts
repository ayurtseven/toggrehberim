/**
 * TOGGREHBERI — Rule Engine
 * Blueprint Phase 2: Deterministic, offline-safe triage decision engine.
 * Maps IkazSembolu + VehicleState → TriageResult with confidence gating.
 * 100% deterministic — no AI calls here.
 */

import type { IkazSembolu, AciliyetDuzeyi } from "./ikaz-sembolleri";
import type {
  TriageResult,
  TriageStatus,
  SeverityLevel,
  ConfidenceLevel,
  VehicleState,
  ActionStep,
} from "./triage-types";

// ─── Sabit eşleştirmeler ──────────────────────────────────────────────────────

const ACILIYET_TO_STATUS: Record<AciliyetDuzeyi, TriageStatus> = {
  hemen_dur:    "STOP_NOW",
  yakin_servis: "SERVICE_ASAP",
  dikkat:       "PROCEED_CAREFUL",
  bilgi:        "INFO_ONLY",
};

const ACILIYET_TO_SEVERITY: Record<AciliyetDuzeyi, SeverityLevel> = {
  hemen_dur:    "CRITICAL",
  yakin_servis: "URGENT",
  dikkat:       "MODERATE",
  bilgi:        "INFO",
};

const SERVIS_TELEFON = "0 850 222 86 44";

// ─── Confidence score → level ─────────────────────────────────────────────────

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.85) return "HIGH";
  if (score >= 0.60) return "MEDIUM";
  return "LOW";
}

// ─── VehicleState bağlamsal tavsiye ──────────────────────────────────────────

function vehicleStateAdvice(state: VehicleState, status: TriageStatus): string | undefined {
  if (status === "STOP_NOW" && state.isRunning) {
    return "Araç hareket halinde — önce güvenli bir yere çek, motoru kapat.";
  }
  if (status === "STOP_NOW" && state.onCharging) {
    return "Araç şarjda — şarj kablosunu çıkar ve servisi ara.";
  }
  if (status === "SERVICE_ASAP" && state.isRunning) {
    return "Acil servis gerektiriyor — güvenli hızda en yakın servise git.";
  }
  if (state.batteryLevel !== -1 && state.batteryLevel < 20 && status !== "INFO_ONLY") {
    return `Batarya düşük (%${state.batteryLevel}) — şarj istasyonuna yönlen.`;
  }
  if (state.lastFaultCount > 1) {
    return "Birden fazla hata tespit edildi — servise gitmeden araç kullanma.";
  }
  return undefined;
}

// ─── Adım üretimi ─────────────────────────────────────────────────────────────

function buildSteps(sembol: IkazSembolu, state: VehicleState, status: TriageStatus): ActionStep[] {
  const steps: ActionStep[] = [];

  // Running + critical → ilk adım her zaman güvenli park
  if (state.isRunning && (status === "STOP_NOW" || status === "SERVICE_ASAP")) {
    steps.push({ order: 1, action: "Güvenli bir yere çek ve dur", detail: "Trafikten uzak, sabit zemine park et." });
  }

  // Sembolün yapilacaklar listesinden maks 3 adım al (zaten oluşturulmuş içerik)
  const sembolSteps = sembol.yapilacaklar.slice(0, 3 - steps.length);
  sembolSteps.forEach((adim, i) => {
    steps.push({ order: steps.length + 1 + i, action: adim });
  });

  // Servis gerekiyorsa ve henüz eklenmemişse CTA ekle
  const hasServiceStep = steps.some((s) => s.action.toLowerCase().includes("servis") || s.action.toLowerCase().includes("ara"));
  if (sembol.servis_gerekli && !hasServiceStep && steps.length < 3) {
    steps.push({ order: steps.length + 1, action: `Togg Care'i ara: ${SERVIS_TELEFON}` });
  }

  return steps.slice(0, 3);
}

// ─── Ana rule engine fonksiyonu ───────────────────────────────────────────────

export function runRuleEngine(
  sembol: IkazSembolu,
  confidenceScore: number,
  vehicleState: VehicleState,
): TriageResult {
  const level = confidenceLevel(confidenceScore);
  const status = ACILIYET_TO_STATUS[sembol.aciliyet];
  const severityLevel = ACILIYET_TO_SEVERITY[sembol.aciliyet];

  // LOW confidence → manuel triage gerektir, risky advice bloklama
  if (level === "LOW") {
    return {
      alertId: sembol.id,
      status: "PROCEED_CAREFUL",
      severityLevel: "MODERATE",
      summary: "Sembol net tespit edilemedi. Lütfen listeden seçim yapın.",
      steps: [
        { order: 1, action: "Aşağıdaki listeden sembolü bul ve seç" },
        { order: 2, action: "Daha net fotoğraf çekmeyi dene" },
        { order: 3, action: `Emin değilsen Togg Care'i ara: ${SERVIS_TELEFON}` },
      ],
      confidence: "LOW",
      confidenceScore,
      serviceRequired: false,
      servicePhone: SERVIS_TELEFON,
      nearbyServiceEnabled: false,
      manualTriageRequired: true,
      offlineMode: false,
    };
  }

  const steps = buildSteps(sembol, vehicleState, status);
  const advice = vehicleStateAdvice(vehicleState, status);

  // MEDIUM confidence → sonuçlara servis CTA ekle
  const serviceRequired = sembol.servis_gerekli || status === "STOP_NOW" || level === "MEDIUM";

  return {
    alertId: sembol.id,
    status,
    severityLevel,
    summary: sembol.anlami.split(".")[0] + ".",
    steps,
    confidence: level,
    confidenceScore,
    vehicleStateAdvice: advice,
    serviceRequired,
    servicePhone: SERVIS_TELEFON,
    nearbyServiceEnabled: status === "STOP_NOW" || status === "SERVICE_ASAP",
    manualTriageRequired: false,
    offlineMode: false,
  };
}

// ─── AI olmadan (offline / fallback) doğrudan ID ile çalış ──────────────────

export function runRuleEngineById(
  sembolId: string,
  semboller: IkazSembolu[],
  vehicleState: VehicleState,
): TriageResult | null {
  const sembol = semboller.find((s) => s.id === sembolId);
  if (!sembol) return null;
  return runRuleEngine(sembol, 0.90, vehicleState); // Manuel seçim = HIGH confidence
}

// ─── AI yokken tam fallback sonucu ────────────────────────────────────────────

export function buildFallbackResult(trigger: string, offlineMode: boolean): TriageResult {
  return {
    alertId: null,
    status: "PROCEED_CAREFUL",
    severityLevel: "MODERATE",
    summary: offlineMode
      ? "Çevrimdışısın. Aşağıdan sembolü seçerek devam edebilirsin."
      : "Fotoğraf analiz edilemedi. Listeden sembolü bul.",
    steps: [
      { order: 1, action: "Aşağıdaki sembol listesinden simgeyi seç" },
      { order: 2, action: "Daha net, tek sembole odaklı fotoğraf çek" },
      { order: 3, action: `Yardım için Togg Care: ${SERVIS_TELEFON}` },
    ],
    confidence: "LOW",
    confidenceScore: 0,
    serviceRequired: false,
    servicePhone: SERVIS_TELEFON,
    nearbyServiceEnabled: false,
    manualTriageRequired: true,
    offlineMode,
  };
}
