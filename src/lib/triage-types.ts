/**
 * TOGGREHBERI — Blueprint Phase 1 & 2
 * Core TypeScript interfaces for the triage system.
 * Stateless, KVKK-compliant, deterministic.
 */

// ─── Severity & Status ────────────────────────────────────────────────────────

export type SeverityLevel = "CRITICAL" | "URGENT" | "MODERATE" | "INFO";
export type TriageStatus = "STOP_NOW" | "PROCEED_CAREFUL" | "SERVICE_ASAP" | "INFO_ONLY";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type InputType = "CAMERA" | "TEXT";
export type AIFallbackTrigger = "TIMEOUT" | "PARSING_FAILED" | "OFFLINE_MODE" | "BLOCKED_IMAGE";

// ─── Vehicle State ────────────────────────────────────────────────────────────

export interface VehicleState {
  isRunning: boolean;       // Araç hareket halinde mi?
  onCharging: boolean;      // Şarjda mı?
  batteryLevel: number;     // 0-100, bilinmiyorsa -1
  lastFaultCount: number;   // Ardışık hata sayısı (cascading fault tespiti)
}

export const DEFAULT_VEHICLE_STATE: VehicleState = {
  isRunning: false,
  onCharging: false,
  batteryLevel: -1,
  lastFaultCount: 0,
};

// ─── Alert Entity ─────────────────────────────────────────────────────────────

export interface AlertCategory {
  code: string;
  label: string; // "Motor Arızası", "Batarya", "Isı Yönetimi"
  icon: string;
}

export interface ActionStep {
  order: number;
  action: string;   // "Güvenli yere çek", "Klimayı kapat"
  detail?: string;  // İkincil açıklama (opsiyonel)
}

export interface TriageOutput {
  status: TriageStatus;
  summary: string;         // Maks 1 cümle, sade Türkçe
  steps: ActionStep[];     // Maks 3 adım
  confidence: ConfidenceLevel;
  servicePhoneNumber?: string;
}

export interface Alert {
  id: string;              // e.g., "batarya-kritik", "DTC-P0101"
  category: AlertCategory;
  severityLevel: SeverityLevel;
  vehicleStateHint?: Partial<VehicleState>;
  triageOutput: TriageOutput;
}

// ─── Input Layer ──────────────────────────────────────────────────────────────

export interface InputRaw {
  type: InputType;
  payload: string;          // Base64 image veya text
  timestamp: string;        // ISO 8601
  sessionId: string;        // Stateless — sadece bu oturum için
}

export interface InputNormalized {
  detectedAlertId: string | null;
  confidenceScore: number;           // 0.0 – 1.0
  confidenceLevel: ConfidenceLevel;
  fallback: boolean;                 // AI başarısız → true
  fallbackTrigger?: AIFallbackTrigger;
  rawInputDeleted: boolean;          // KVKK: fotoğraf/ses silindiğini teyit eder
}

// ─── Rule Engine ──────────────────────────────────────────────────────────────

export type RuleOperator = "===" | ">" | "<" | ">=" | "<=" | "IN" | "REGEX";

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: string | number | string[];
}

export interface RuleExpression {
  type: "AND" | "OR";
  conditions: RuleCondition[];
}

export interface TriageNode {
  nodeId: string;
  condition: RuleExpression;
  alertId: string;
  onMatch: {
    triageStatus: TriageStatus;
    nextNode?: string;
  };
  onMissMatch?: string;
}

// ─── Triage Result (final output to UI) ──────────────────────────────────────

export interface TriageResult {
  alertId: string | null;
  status: TriageStatus;
  severityLevel: SeverityLevel;
  summary: string;
  steps: ActionStep[];
  confidence: ConfidenceLevel;
  confidenceScore: number;
  vehicleStateAdvice?: string;   // "Araç hareket halindeyse önce güvenli yere çek"
  serviceRequired: boolean;
  servicePhone: string;
  nearbyServiceEnabled: boolean; // GPS izni istenmeli mi?
  manualTriageRequired: boolean; // LOW confidence → manuel selector göster
  offlineMode: boolean;
}

// ─── Analytics (KVKK-safe, no PII) ──────────────────────────────────────────

export interface AnalyticsEvent {
  event: "triage_completed" | "triage_fallback" | "service_directed" | "manual_triage";
  input_type: InputType | "MANUAL";
  alert_category?: string;
  confidence: ConfidenceLevel | "NONE";
  triage_status?: TriageStatus;
  service_directed: boolean;
  offline_mode: boolean;
  timestamp: string; // ISO 8601 — NO session ID, NO IP, NO location
}

// ─── AI Fallback Flow ────────────────────────────────────────────────────────

export interface AIFallbackFlow {
  trigger: AIFallbackTrigger;
  action: {
    deleteRawPhoto: true;
    deleteRawAudio: true;
    showManualSelector: true;
    overrideConfidence: "MEDIUM";
    showServiceLocator: true;
    showPhoneNumber: true;
  };
}

// ─── KVKK Consent ────────────────────────────────────────────────────────────

export interface KvkkConsent {
  givenAt: string;   // ISO 8601
  version: string;   // "1.0"
  purposes: {
    triage: boolean;
    anonymousAnalytics: boolean;
  };
}
