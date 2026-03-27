import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Onaylanan deneyimleri getir
export async function GET(req: NextRequest) {
  const ikaz_id = req.nextUrl.searchParams.get("ikaz_id");
  if (!ikaz_id) return NextResponse.json({ hata: "ikaz_id gerekli" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json([]);

  const supabase = createServiceClient(url, key);
  const { data, error } = await supabase
    .from("ikaz_deneyimler")
    .select("id, kullanici_adi, model, metin, created_at")
    .eq("ikaz_id", ikaz_id)
    .eq("onaylandi", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json([]);
  return NextResponse.json(data ?? []);
}

// Yeni deneyim ekle
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { ikaz_id, model, metin } = await req.json();

  if (!ikaz_id || !metin?.trim()) {
    return NextResponse.json({ hata: "Eksik alan" }, { status: 400 });
  }

  if (metin.trim().length < 10) {
    return NextResponse.json({ hata: "Deneyim en az 10 karakter olmalı" }, { status: 400 });
  }

  const kullanici_adi =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Anonim";

  const { error } = await supabase.from("ikaz_deneyimler").insert({
    ikaz_id,
    user_id: user.id,
    kullanici_adi,
    model: model || "hepsi",
    metin: metin.trim(),
  });

  if (error) return NextResponse.json({ hata: "Kayıt hatası" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
