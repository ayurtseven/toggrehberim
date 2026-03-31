import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import type { ServisNoktasi } from "@/lib/servis-noktalari";

const DOSYA = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "servis-noktalari.json");

function oku(): ServisNoktasi[] {
  try {
    return JSON.parse(fs.readFileSync(DOSYA, "utf-8"));
  } catch {
    return [];
  }
}

async function adminKontrol() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

export async function GET() {
  return NextResponse.json(oku());
}

/** PATCH /api/admin/servis — tek kaydın telefon/email alanlarını günceller */
export async function PATCH(req: NextRequest) {
  if (!(await adminKontrol())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json() as { id: string; telefon?: string; email?: string };
  if (!body.id) {
    return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  }

  const noktalar = oku();
  const idx = noktalar.findIndex((n) => n.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  }

  if (body.telefon !== undefined) noktalar[idx].telefon = body.telefon;
  if (body.email !== undefined) noktalar[idx].email = body.email;

  fs.writeFileSync(DOSYA, JSON.stringify(noktalar, null, 2), "utf-8");
  return NextResponse.json({ ok: true, nokta: noktalar[idx] });
}
