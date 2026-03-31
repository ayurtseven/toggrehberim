import type { Metadata } from "next";
import { getTumRehberler } from "@/lib/content/rehber";
import AramaIstemci from "./AramaIstemci";

export const metadata: Metadata = {
  title: "Arama",
  description: "Togg rehberlerinde arama yapın.",
};

export default function AramaSayfasi() {
  const rehberler = getTumRehberler();
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold text-slate-100">Rehberlerde Ara</h1>
        <AramaIstemci rehberler={rehberler} />
      </div>
    </div>
  );
}
