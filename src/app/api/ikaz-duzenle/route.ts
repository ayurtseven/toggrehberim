import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── Tipler ──────────────────────────────────────────────────────────────────

export interface IkazOverrideKayit {
  sembol_id: string;
  kitapcik_aciklama?: string;
  anlami?: string;
  nedenler?: string[];
  yapilacaklar?: string[];
  not_metni?: string;
  // Genişletilmiş alanlar (is_custom = true için zorunlu)
  ad?: string;
  renk?: string;
  aciliyet?: string;
  model?: string;
  servis_gerekli?: boolean;
  gorsel_url?: string;
  anahtar_kelimeler?: string[];
  is_custom?: boolean;
  /** Admin panelden gizleme — public sayfalarda gösterilmez */
  gizli?: boolean;
}

// ─── GET — tüm override'ları getir (herkese açık) ──────────────────────────

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json([]);

  const supabase = createServiceClient(url, key);
  const { data } = await supabase
    .from("ikaz_overrides")
    .select(
      "sembol_id, kitapcik_aciklama, anlami, nedenler, yapilacaklar, not_metni, ad, renk, aciliyet, model, servis_gerekli, gorsel_url, anahtar_kelimeler, is_custom, gizli"
    );

  return NextResponse.json(data ?? []);
}

// ─── POST — kaydet / güncelle (giriş gerekli) ──────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const body: IkazOverrideKayit = await req.json();
  const { sembol_id, ...alanlar } = body;

  if (!sembol_id) {
    return NextResponse.json({ hata: "sembol_id gerekli" }, { status: 400 });
  }

  // Yeni sembol ekliyorsa zorunlu alanları kontrol et (gizleme için bypass)
  if (alanlar.is_custom && !alanlar.gizli) {
    if (!alanlar.ad || !alanlar.renk || !alanlar.aciliyet || !alanlar.anlami) {
      return NextResponse.json(
        { hata: "Yeni sembol için ad, renk, aciliyet ve anlami zorunludur" },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase.from("ikaz_overrides").upsert(
    {
      sembol_id,
      ...alanlar,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "sembol_id" }
  );

  if (error) {
    console.error("ikaz_overrides upsert hatası:", error);
    return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ─── DELETE — override sil (giriş gerekli) ────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { sembol_id } = await req.json();
  if (!sembol_id) return NextResponse.json({ hata: "sembol_id gerekli" }, { status: 400 });

  const { error } = await supabase
    .from("ikaz_overrides")
    .delete()
    .eq("sembol_id", sembol_id);

  if (error) return NextResponse.json({ hata: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
