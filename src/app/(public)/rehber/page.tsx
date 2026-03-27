import type { Metadata } from "next";
import { getTumRehberler } from "@/lib/content/rehber";
import RehberFiltreli from "@/components/rehber/RehberFiltreli";

export const metadata: Metadata = {
  title: "Rehberler",
  description: "Togg T10X ve T10F için şarj, yazılım, bakım ve sürüş rehberleri.",
};

export default function RehberHub() {
  const tumRehberler = getTumRehberler().map((r) => ({
    ...r,
    model: r.model ?? "hepsi",
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Tüm Rehberler</h1>
        <p className="mt-2 text-slate-400">
          Togg sahipleri için kapsamlı kullanım kılavuzları
        </p>
      </div>

      <RehberFiltreli rehberler={tumRehberler} gosterKategoriGrubu />
    </div>
  );
}
