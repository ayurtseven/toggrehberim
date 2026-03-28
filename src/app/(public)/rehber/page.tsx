import type { Metadata } from "next";
import { getTumRehberler } from "@/lib/content/rehber";
import RehberSayfasi from "@/components/rehber/RehberSayfasi";

export const metadata: Metadata = {
  title: "Rehberler",
  description: "Togg T10X ve T10F için şarj, yazılım, bakım ve sürüş rehberleri.",
};

export default function RehberHub() {
  const tumRehberler = getTumRehberler().map((r) => ({
    ...r,
    model: r.model ?? "hepsi",
  }));

  return <RehberSayfasi rehberler={tumRehberler} />;
}
