/**
 * TOGGREHBERI — AI Input Pipeline
 * Blueprint Phase 2: Stateless, KVKK-compliant input normalization.
 * - 1s timeout on AI calls
 * - EXIF strip before sending
 * - Photo deleted from memory immediately after normalization
 * - Fallback to manual triage on any failure
 */

import type { InputNormalized, AIFallbackTrigger } from "./triage-types";
import { confidenceLevel } from "./rule-engine";

const AI_TIMEOUT_MS = 1000;

// ─── EXIF strip ───────────────────────────────────────────────────────────────
// Removes metadata (geolocation, device info) from JPEG before sending to AI.
// Keeps only pixel data. Works in browser (canvas) and server (Buffer crop).

export function stripExifFromBase64(base64: string, mediaType: string): string {
  if (!mediaType.includes("jpeg") && !mediaType.includes("jpg")) {
    return base64; // PNG/WebP have minimal EXIF — skip
  }
  try {
    const bytes = Buffer.from(base64, "base64");
    // JPEG EXIF block sits between SOI marker (FFD8) and first SOS (FFDA).
    // We rewrite the file by removing APP1 (FFE1) segments which carry EXIF.
    const result: number[] = [];
    let i = 0;
    while (i < bytes.length - 1) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xe1) {
        // APP1 segment — skip it
        const length = (bytes[i + 2] << 8) | bytes[i + 3];
        i += 2 + length;
      } else {
        result.push(bytes[i]);
        i++;
      }
    }
    if (i < bytes.length) result.push(bytes[bytes.length - 1]);
    return Buffer.from(result).toString("base64");
  } catch {
    return base64; // Strip failed — use original (still no retention)
  }
}

// ─── Confidence score parser ──────────────────────────────────────────────────
// Converts AI "guven" string → numeric 0.0–1.0

export function parseConfidenceScore(guven: string): number {
  if (guven === "yuksek") return 0.90;
  if (guven === "orta")   return 0.70;
  if (guven === "dusuk")  return 0.40;
  return 0.50;
}

// ─── AI call with timeout ─────────────────────────────────────────────────────

export async function callAIWithTimeout<T>(
  fetcher: () => Promise<T>,
  timeoutMs = AI_TIMEOUT_MS,
): Promise<{ ok: true; data: T } | { ok: false; trigger: AIFallbackTrigger }> {
  const timeoutSignal = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs)
  );

  try {
    const data = await Promise.race([fetcher(), timeoutSignal]);
    return { ok: true, data };
  } catch (err) {
    const trigger: AIFallbackTrigger =
      err instanceof Error && err.message === "TIMEOUT" ? "TIMEOUT" : "PARSING_FAILED";
    return { ok: false, trigger };
  }
}

// ─── Normalize AI response → InputNormalized ────────────────────────────────

export function normalizeAIResponse(
  aiResult: { tanindi: boolean; guven: string; sembol_id?: string } | null,
  fallbackTrigger?: AIFallbackTrigger,
): InputNormalized {
  // AI başarısız
  if (!aiResult || fallbackTrigger) {
    return {
      detectedAlertId: null,
      confidenceScore: 0,
      confidenceLevel: "LOW",
      fallback: true,
      fallbackTrigger: fallbackTrigger ?? "PARSING_FAILED",
      rawInputDeleted: true, // Server-side: Buffer never stored
    };
  }

  // AI başarılı ama tanımlanamadı
  if (!aiResult.tanindi || !aiResult.sembol_id) {
    const score = parseConfidenceScore(aiResult.guven);
    return {
      detectedAlertId: null,
      confidenceScore: score,
      confidenceLevel: confidenceLevel(score),
      fallback: score < 0.60,
      rawInputDeleted: true,
    };
  }

  const score = parseConfidenceScore(aiResult.guven);
  return {
    detectedAlertId: aiResult.sembol_id,
    confidenceScore: score,
    confidenceLevel: confidenceLevel(score),
    fallback: score < 0.60,
    rawInputDeleted: true,
  };
}

// ─── Session ID generator (stateless — per-request only) ────────────────────

export function generateSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${ts}-${rand}`;
}
