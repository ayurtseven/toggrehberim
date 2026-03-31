import fs from "fs";
import path from "path";
import Link from "next/link";
import type { ServisNoktasi } from "@/lib/servis-noktalari";
import ServisEditor from "./ServisEditor";

export const dynamic = "force-dynamic";

function noktaOku(): ServisNoktasi[] {
  try {
    const dosya = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "servis-noktalari.json");
    return JSON.parse(fs.readFileSync(dosya, "utf-8"));
  } catch {
    return [];
  }
}

export default function AdminServisSayfasi() {
  const noktalar = noktaOku();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-slate-300 transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-slate-200">Servis Noktaları</span>
        </nav>

        <h1 className="mb-1 text-xl font-bold">Servis Noktaları</h1>
        <p className="mb-6 text-sm text-slate-500">
          Telefon numarası öğrendikçe ilgili servise ekle. Kaydet butonuna basınca anında canlıya geçer.
        </p>

        <ServisEditor noktalar={noktalar} />
      </div>
    </div>
  );
}
