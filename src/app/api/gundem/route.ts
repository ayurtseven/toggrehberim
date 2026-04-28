import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export interface GundemKayit {
  id?: string;
  title: string;
  platform: string;
  summary: string;
  link: string;
  severity: "low" | "medium" | "high";
  hafta_basi: string; // YYYY-MM-DD (Pazartesi)
  aktif?: boolean;
}

// ─── GET — public, belirli haftanın gündem öğeleri ──────────────────────────

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json([]);

  const sb = createServiceClient(url, key);
  const { searchParams } = new URL(req.url);
  const hafta = searchParams.get("hafta"); // opsiyonel filtre

  // admin=true → tüm öğeler (aktif+pasif); yoksa sadece aktif
  const adminMod = searchParams.get("admin") === "true";

  let query = sb
    .from("gundem_items")
    .select("id, title, platform, summary, link, severity, hafta_basi, aktif")
    .order("created_at", { ascending: false });

  if (!adminMod) {
    query = query.eq("aktif", true);
  }

  if (hafta) {
    query = query.eq("hafta_basi", hafta);
  } else {
    // En güncel haftayı getir
    const sonHaftaQuery = sb
      .from("gundem_items")
      .select("hafta_basi")
      .order("hafta_basi", { ascending: false })
      .limit(1)
      .single();

    const { data: sonHafta } = await sonHaftaQuery;
    if (sonHafta) {
      query = query.eq("hafta_basi", sonHafta.hafta_basi);
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json([]);
  return NextResponse.json(data ?? []);
}

// ─── POST — kaydet (giriş gerekli) ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const body: GundemKayit = await req.json();

  if (!body.title || !body.platform || !body.summary || !body.link || !body.severity || !body.hafta_basi) {
    return NextResponse.json({ hata: "Tüm alanlar zorunludur" }, { status: 400 });
  }

  if (body.id) {
    // Güncelle
    const { error } = await supabase
      .from("gundem_items")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", body.id);
    if (error) return NextResponse.json({ hata: error.message }, { status: 500 });
  } else {
    // Yeni ekle
    const { error } = await supabase
      .from("gundem_items")
      .insert({ ...body, aktif: body.aktif ?? true });
    if (error) return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ─── DELETE — sil (giriş gerekli) ──────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ hata: "id gerekli" }, { status: 400 });

  const { error } = await supabase.from("gundem_items").delete().eq("id", id);
  if (error) return NextResponse.json({ hata: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
