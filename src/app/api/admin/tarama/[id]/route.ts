import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = serviceClient();
  const { data, error } = await sb
    .from("icerik_taramalari")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ hata: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { eylem, dosya_adi } = await req.json();

  const sb = serviceClient();

  if (eylem === "reddet") {
    const { error } = await sb
      .from("icerik_taramalari")
      .update({ durum: "reddedildi" })
      .eq("id", id);
    if (error) return NextResponse.json({ hata: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (eylem === "kaydet") {
    const { data, error } = await sb
      .from("icerik_taramalari")
      .select("mdx_taslak, baslik, kategori, durum")
      .eq("id", id)
      .single();

    if (error || !data) return NextResponse.json({ hata: "Kayıt bulunamadı" }, { status: 404 });
    if (data.durum === "kaydedildi") return NextResponse.json({ hata: "Zaten kaydedildi" }, { status: 400 });

    await sb.from("icerik_taramalari").update({ durum: "kaydedildi" }).eq("id", id);

    const temizAd = (dosya_adi || `tarama-${id}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);

    const tur = data.kategori === "haber" ? "haberler" : "rehber";
    const klasorYolu = data.kategori === "haber"
      ? `content/draft/${tur}`
      : `content/draft/${tur}/${data.kategori}`;

    return NextResponse.json({
      ok: true,
      dosya: `${klasorYolu}/${temizAd}.mdx`,
      dosya_adi: `${temizAd}.mdx`,
      mdx: data.mdx_taslak,
    });
  }

  return NextResponse.json({ hata: "Geçersiz eylem" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = serviceClient();
  const { error } = await sb.from("icerik_taramalari").delete().eq("id", id);
  if (error) return NextResponse.json({ hata: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
