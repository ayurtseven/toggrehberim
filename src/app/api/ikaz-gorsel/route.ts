import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// POST — ikaz görseli yükle, Supabase Storage'a kaydet, public URL döndür
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ hata: "Storage yapılandırılmamış" }, { status: 503 });
  }

  const formData = await req.formData();
  const dosya = formData.get("gorsel") as File | null;
  const sembolId = formData.get("sembol_id") as string | null;

  if (!dosya) return NextResponse.json({ hata: "Görsel gerekli" }, { status: 400 });
  if (!sembolId) return NextResponse.json({ hata: "sembol_id gerekli" }, { status: 400 });

  if (dosya.size > 2 * 1024 * 1024) {
    return NextResponse.json({ hata: "Görsel 2MB'yi geçemez" }, { status: 400 });
  }

  const izinliTipler = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!izinliTipler.includes(dosya.type)) {
    return NextResponse.json({ hata: "Sadece PNG, JPG, WebP veya SVG kabul edilir" }, { status: 400 });
  }

  const uzanti = dosya.name.split(".").pop() ?? "png";
  const dosyaYolu = `ikaz/${sembolId}.${uzanti}`;

  const arrayBuffer = await dosya.arrayBuffer();
  const serviceSupabase = createServiceClient(url, serviceKey);

  const { error: uploadHata } = await serviceSupabase.storage
    .from("ikaz-gorseller")
    .upload(dosyaYolu, arrayBuffer, {
      contentType: dosya.type,
      upsert: true,
    });

  if (uploadHata) {
    console.error("Storage upload hatası:", uploadHata);
    return NextResponse.json({ hata: uploadHata.message }, { status: 500 });
  }

  const { data: publicData } = serviceSupabase.storage
    .from("ikaz-gorseller")
    .getPublicUrl(dosyaYolu);

  return NextResponse.json({ ok: true, url: publicData.publicUrl });
}

// DELETE — ikaz görselini sil
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hata: "Giriş gerekli" }, { status: 401 });

  const { sembol_id, uzanti } = await req.json();
  if (!sembol_id) return NextResponse.json({ hata: "sembol_id gerekli" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ hata: "Storage yapılandırılmamış" }, { status: 503 });

  const serviceSupabase = createServiceClient(url, serviceKey);
  const dosyaYolu = `ikaz/${sembol_id}.${uzanti ?? "png"}`;

  const { error } = await serviceSupabase.storage
    .from("ikaz-gorseller")
    .remove([dosyaYolu]);

  if (error) return NextResponse.json({ hata: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
