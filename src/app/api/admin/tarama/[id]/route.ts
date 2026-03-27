import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── PATCH: Durum güncelle (reddedildi) veya taslak dosyaya kaydet ────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { eylem, dosya_adi } = await req.json(); // eylem: 'kaydet' | 'reddet'

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
    // MDX taslağı dosya sistemine yaz
    const { data, error } = await sb
      .from("icerik_taramalari")
      .select("mdx_taslak, kategori, durum")
      .eq("id", id)
      .single();

    if (error || !data) return NextResponse.json({ hata: "Kayıt bulunamadı" }, { status: 404 });
    if (data.durum === "kaydedildi") return NextResponse.json({ hata: "Zaten kaydedildi" }, { status: 400 });

    const tur = data.kategori === "haber" ? "haberler" : "rehber";
    const kategoriKlasor = data.kategori === "haber" ? "" : `/${data.kategori}`;
    const klasorYolu = path.join(
      process.cwd(),
      "content",
      "draft",
      tur,
      data.kategori === "haber" ? "" : data.kategori
    );

    if (!fs.existsSync(klasorYolu)) {
      fs.mkdirSync(klasorYolu, { recursive: true });
    }

    const temizAd = (dosya_adi || `tarama-${id}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
    const dosyaYolu = path.join(klasorYolu, `${temizAd}.mdx`);

    fs.writeFileSync(dosyaYolu, data.mdx_taslak, "utf-8");

    await sb
      .from("icerik_taramalari")
      .update({ durum: "kaydedildi" })
      .eq("id", id);

    return NextResponse.json({ ok: true, dosya: `content/draft/${tur}${kategoriKlasor}/${temizAd}.mdx` });
  }

  return NextResponse.json({ hata: "Geçersiz eylem" }, { status: 400 });
}
