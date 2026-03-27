import { NextResponse } from "next/server";
import { getTumRehberler } from "@/lib/content/rehber";
import { getTumHaberler } from "@/lib/content/haberler";

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

  return NextResponse.json([...rehberler, ...haberler]);
}
