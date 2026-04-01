/**
 * TOGGREHBERI — Anonymous Analytics
 * Blueprint Phase 2 §3 Logging.
 * KVKK/GDPR: NO personal data, NO IP, NO session ID, NO location.
 * Aggregate metrics only. 90-day retention on server.
 */

import type { AnalyticsEvent } from "./triage-types";

const ANALYTICS_ENDPOINT = "/api/analytics";

// ─── Log an event (fire-and-forget, never throws) ────────────────────────────

export function logEvent(event: Omit<AnalyticsEvent, "timestamp">): void {
  try {
    const payload: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    // Fire-and-forget — never block UI
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true, // Survives page unload
    }).catch(() => {
      // Analytics failure must never surface to user
    });
  } catch {
    // Silently ignore
  }
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export function logTriageCompleted(
  inputType: AnalyticsEvent["input_type"],
  alertCategory: string | undefined,
  confidence: AnalyticsEvent["confidence"],
  triageStatus: AnalyticsEvent["triage_status"],
  serviceDirected: boolean,
  offlineMode: boolean,
): void {
  logEvent({
    event: "triage_completed",
    input_type: inputType,
    alert_category: alertCategory,
    confidence,
    triage_status: triageStatus,
    service_directed: serviceDirected,
    offline_mode: offlineMode,
  });
}

export function logTriageFallback(
  inputType: AnalyticsEvent["input_type"],
  offlineMode: boolean,
): void {
  logEvent({
    event: "triage_fallback",
    input_type: inputType,
    confidence: "NONE",
    service_directed: false,
    offline_mode: offlineMode,
  });
}

export function logServiceDirected(offlineMode: boolean): void {
  logEvent({
    event: "service_directed",
    input_type: "MANUAL",
    confidence: "NONE",
    service_directed: true,
    offline_mode: offlineMode,
  });
}
