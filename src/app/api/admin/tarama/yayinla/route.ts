import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    return NextResponse.json(
      { hata: "GITHUB_TOKEN veya GITHUB_REPO env değişkeni eksik." },
      { status: 500 }
    );
  }

  const { tarama_id, mdx, dosya_adi, kategori, tur } = await req.json();

  if (!mdx || !dosya_adi) {
    return NextResponse.json({ hata: "mdx ve dosya_adi gerekli." }, { status: 400 });
  }

  const temizAd = dosya_adi
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const dosyaYolu =
    tur === "haber"
      ? `content/haberler/${temizAd}.mdx`
      : `content/rehber/${kategori}/${temizAd}.mdx`;

  // GitHub API ile dosya oluştur
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${dosyaYolu}`;

  // Mevcut dosya SHA'sını kontrol et (güncelleme için gerekli)
  let sha: string | undefined;
  const mevcut = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (mevcut.ok) {
    const mevData = await mevcut.json();
    sha = mevData.sha;
  }

  const body: Record<string, string> = {
    message: `içerik: ${temizAd} yayınlandı (admin tarama)`,
    content: Buffer.from(mdx, "utf-8").toString("base64"),
    branch: "master",
  };
  if (sha) body.sha = sha;

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { hata: `GitHub hatası: ${err.message || res.status}` },
      { status: 500 }
    );
  }

  // Supabase'de durumu güncelle
  if (tarama_id) {
    const sb = serviceClient();
    await sb
      .from("icerik_taramalari")
      .update({ durum: "kaydedildi", mdx_taslak: mdx })
      .eq("id", tarama_id);
  }

  return NextResponse.json({ ok: true, dosya: dosyaYolu });
}
