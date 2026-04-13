import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/** GET /api/admin/fiyat-gecmisi — son 100 değişim kaydı */
export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("fiyat_gecmisi")
    .select("*")
    .order("degisim_tarihi", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
