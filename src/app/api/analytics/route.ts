import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase yoksa sessizce başarısız ol — analytics kritik değil
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ ok: true }); // Supabase yoksa sessiz

    // ── Triage analytics (Blueprint Phase 1/2) ───────────────────────────────
    if ("event" in body && typeof body.event === "string") {
      const { event, input_type, alert_category, confidence, triage_status, service_directed, offline_mode } = body as {
        event: string;
        input_type: string;
        alert_category?: string;
        confidence: string;
        triage_status?: string;
        service_directed: boolean;
        offline_mode: boolean;
      };
      // Silently ignore if table doesn't exist — analytics is non-critical
      try {
        await supabase.from("triage_events").insert({
          event,
          input_type,
          alert_category: alert_category ?? null,
          confidence,
          triage_status: triage_status ?? null,
          service_directed,
          offline_mode,
        });
      } catch {
        // Table may not exist yet — non-critical
      }
      return NextResponse.json({ ok: true });
    }

    // ── Legacy search/pageview analytics ─────────────────────────────────────
    const { tip, ...veri } = body as { tip: "search" | "pageview"; [key: string]: unknown };

    if (tip === "search") {
      await supabase.from("search_logs").insert({
        query: veri.query,
        type: veri.type ?? "genel",
        result_count: veri.result_count ?? 0,
        session_id: veri.session_id,
      });
    } else if (tip === "pageview") {
      await supabase.from("page_views").insert({
        path: veri.path,
        referrer: veri.referrer,
        session_id: veri.session_id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics hatası kullanıcıyı etkilemesin
    return NextResponse.json({ ok: true });
  }
}
