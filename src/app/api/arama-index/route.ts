import { NextResponse } from "next/server";
import { getTumRehberler } from "@/lib/content/rehber";
import { getTumHaberler } from "@/lib/content/haberler";
import { TUM_IKAZ_SEMBOLLERI } from "@/lib/ikaz-sembolleri";

export const revalidate = 3600;

export function GET() {
  const rehberler = getTumRehberler().map((r) => ({
    tur: "rehber" as const,
    baslik: r.baslik,
    ozet: r.ozet,
    kategori: r.kategori,
    model: r.model,
    etiketler: r.etiketler ?? [],
    href: `/rehber/${r.kategori}/${r.slug}`,
  }));

  const haberler = getTumHaberler().map((h) => ({
    tur: "haber" as const,
    baslik: h.baslik,
    ozet: h.ozet,
    kategori: "haber",
    etiketler: h.etiketler ?? [],
    href: `/haberler/${h.slug}`,
  }));

  const ikazlar = TUM_IKAZ_SEMBOLLERI.map((ik) => ({
    tur: "ikaz" as const,
    baslik: ik.ad,
    ozet: ik.anlami,
    kategori: "ikaz",
    model: ik.model,
    etiketler: ik.anahtar_kelimeler ?? [],
    href: `/ikaz/${ik.id}`,
  }));

  return NextResponse.json([...rehberler, ...haberler, ...ikazlar]);
}
