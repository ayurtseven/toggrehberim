import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function adminKontrol() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { yetkili: !!user, supabase };
}

/** GET /api/admin/sarj-fiyatlari — tüm fiyat kayıtlarını döner */
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("sarj_fiyatlari").select("*");
  return NextResponse.json(data ?? []);
}

/** PATCH /api/admin/sarj-fiyatlari — tek tarife satırını günceller */
export async function PATCH(req: NextRequest) {
  const { yetkili, supabase } = await adminKontrol();
  if (!yetkili) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json() as {
    id: string;
    fiyat?: string;
    guc?: string;
    not?: string;
    gizli?: boolean;
    son_guncelleme?: string;
  };
  if (!body.id) {
    return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  }

  const sonGuncelleme = body.son_guncelleme ?? new Date().toLocaleDateString("tr-TR");

  // gizli toggle ise sadece o alanı güncelle
  const upsertData: Record<string, unknown> = { id: body.id };
  if (body.gizli !== undefined) {
    upsertData.gizli = body.gizli;
  } else {
    upsertData.fiyat = body.fiyat ?? "—";
    upsertData.guc = body.guc ?? "";
    upsertData.aciklama = body.not ?? "";
    upsertData.son_guncelleme = sonGuncelleme;
  }

  let { data, error } = await supabase
    .from("sarj_fiyatlari")
    .upsert(upsertData)
    .select()
    .single();

  if (error?.code === "42703") {
    // guc/gizli kolonu henüz eklenmemiş — temel alanlarla kaydet
    delete upsertData.guc;
    delete upsertData.gizli;
    ({ data, error } = await supabase
      .from("sarj_fiyatlari")
      .upsert(upsertData)
      .select()
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, kayit: data });
}
