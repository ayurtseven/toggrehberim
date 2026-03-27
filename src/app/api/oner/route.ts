import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { baslik, icerik, kategori, model } = await req.json();

  if (!baslik?.trim() || !icerik?.trim() || !kategori) {
    return NextResponse.json({ hata: "Eksik alan" }, { status: 400 });
  }

  const { error } = await supabase.from("suggestions").insert({
    user_id: user.id,
    baslik: baslik.trim(),
    icerik: icerik.trim(),
    kategori,
    model: model || "hepsi",
  });

  if (error) return NextResponse.json({ hata: "Kayıt hatası" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
