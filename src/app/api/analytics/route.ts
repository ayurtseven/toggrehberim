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
    const { tip, ...veri } = body as { tip: "search" | "pageview"; [key: string]: unknown };

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ ok: true }); // Supabase yoksa sessiz

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
