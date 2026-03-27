import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const KOK = path.resolve(/*turbopackIgnore: true*/ process.cwd());

// Güvenlik: sadece content/ altındaki dosyalara izin ver
function guvenliYol(dosya: string): string | null {
  const tam = path.resolve(KOK, dosya);
  if (!tam.startsWith(path.join(KOK, "content"))) return null;
  if (!tam.endsWith(".mdx")) return null;
  return tam;
}

// GET /api/admin/icerik?dosya=content/draft/...
export async function GET(req: NextRequest) {
  const dosya = req.nextUrl.searchParams.get("dosya");
  if (!dosya) return NextResponse.json({ hata: "dosya parametresi gerekli" }, { status: 400 });

  const tam = guvenliYol(dosya);
  if (!tam) return NextResponse.json({ hata: "Geçersiz dosya yolu" }, { status: 403 });
  if (!fs.existsSync(tam)) return NextResponse.json({ hata: "Dosya bulunamadı" }, { status: 404 });

  const icerik = fs.readFileSync(tam, "utf-8");
  return NextResponse.json({ icerik });
}

// POST /api/admin/icerik  { dosya, icerik }
export async function POST(req: NextRequest) {
  const { dosya, icerik } = await req.json();
  if (!dosya || !icerik) return NextResponse.json({ hata: "dosya ve icerik gerekli" }, { status: 400 });

  const tam = guvenliYol(dosya);
  if (!tam) return NextResponse.json({ hata: "Geçersiz dosya yolu" }, { status: 403 });

  fs.mkdirSync(path.dirname(tam), { recursive: true });
  fs.writeFileSync(tam, icerik, "utf-8");
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/icerik?dosya=content/draft/...
export async function DELETE(req: NextRequest) {
  const dosya = req.nextUrl.searchParams.get("dosya");
  if (!dosya) return NextResponse.json({ hata: "dosya parametresi gerekli" }, { status: 400 });

  const tam = guvenliYol(dosya);
  if (!tam) return NextResponse.json({ hata: "Geçersiz dosya yolu" }, { status: 403 });
  if (!fs.existsSync(tam)) return NextResponse.json({ hata: "Dosya bulunamadı" }, { status: 404 });

  fs.unlinkSync(tam);
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/icerik  { dosya } → taslaktan yayına taşı
export async function PATCH(req: NextRequest) {
  const { dosya } = await req.json();
  if (!dosya) return NextResponse.json({ hata: "dosya gerekli" }, { status: 400 });

  const tam = guvenliYol(dosya);
  if (!tam) return NextResponse.json({ hata: "Geçersiz dosya yolu" }, { status: 403 });
  if (!tam.includes(`${path.sep}draft${path.sep}`))
    return NextResponse.json({ hata: "Sadece taslaklar yayınlanabilir" }, { status: 400 });

  // content/draft/haberler/x.mdx → content/haberler/x.mdx
  // content/draft/rehber/sarj/x.mdx → content/rehber/sarj/x.mdx
  const yeniYol = tam.replace(
    path.join(KOK, "content", "draft") + path.sep,
    path.join(KOK, "content") + path.sep
  );

  fs.mkdirSync(path.dirname(yeniYol), { recursive: true });
  fs.renameSync(tam, yeniYol);

  const yeniDosya = yeniYol.replace(KOK + path.sep, "").replace(/\\/g, "/");
  return NextResponse.json({ ok: true, yeniDosya });
}
