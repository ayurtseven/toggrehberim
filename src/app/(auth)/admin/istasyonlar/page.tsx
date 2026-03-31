import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SarjFiyatEditor from "./IstasyonYonetimClient";

export const dynamic = "force-dynamic";

export interface SarjTarifeRow {
  id: string;
  operator_id: string;
  tip: "ac" | "dc";
  guc: string;
  birim: string;
  /** Varsayılan static başlık gösterimi */
  operatorAd: string;
}

// Statik metadata — sadece fiyat + not Supabase'den gelir
export const SARJ_SATIRLAR: SarjTarifeRow[] = [
  { id: "trugo-ac", operator_id: "trugo", tip: "ac", guc: "7–22 kW", birim: "TL/kWh", operatorAd: "Trugo" },
  { id: "trugo-dc-50", operator_id: "trugo", tip: "dc", guc: "50 kW", birim: "TL/kWh", operatorAd: "Trugo" },
  { id: "trugo-dc-150", operator_id: "trugo", tip: "dc", guc: "150 kW", birim: "TL/kWh", operatorAd: "Trugo" },
  { id: "trugo-dc-300", operator_id: "trugo", tip: "dc", guc: "300 kW", birim: "TL/kWh", operatorAd: "Trugo" },
  { id: "zes-ac", operator_id: "zes", tip: "ac", guc: "7–22 kW", birim: "TL/kWh", operatorAd: "ZES" },
  { id: "zes-dc-50", operator_id: "zes", tip: "dc", guc: "50 kW", birim: "TL/kWh", operatorAd: "ZES" },
  { id: "zes-dc-120", operator_id: "zes", tip: "dc", guc: "120+ kW", birim: "TL/kWh", operatorAd: "ZES" },
  { id: "esarj-ac", operator_id: "esarj", tip: "ac", guc: "7–22 kW", birim: "TL/kWh", operatorAd: "Eşarj" },
  { id: "esarj-dc-50", operator_id: "esarj", tip: "dc", guc: "50 kW", birim: "TL/kWh", operatorAd: "Eşarj" },
  { id: "esarj-dc-150", operator_id: "esarj", tip: "dc", guc: "150 kW", birim: "TL/kWh", operatorAd: "Eşarj" },
  { id: "beefull-ac", operator_id: "beefull", tip: "ac", guc: "7–22 kW", birim: "TL/kWh", operatorAd: "Beefull" },
  { id: "beefull-dc", operator_id: "beefull", tip: "dc", guc: "50–150 kW", birim: "TL/kWh", operatorAd: "Beefull" },
  { id: "voltrun-ac", operator_id: "voltrun", tip: "ac", guc: "7–22 kW", birim: "TL/kWh", operatorAd: "Voltrun" },
  { id: "voltrun-dc-50", operator_id: "voltrun", tip: "dc", guc: "50 kW", birim: "TL/kWh", operatorAd: "Voltrun" },
  { id: "voltrun-dc-150", operator_id: "voltrun", tip: "dc", guc: "150 kW", birim: "TL/kWh", operatorAd: "Voltrun" },
  { id: "sharz-ac", operator_id: "sharz", tip: "ac", guc: "7–22 kW", birim: "TL/kWh", operatorAd: "Sharz" },
  { id: "sharz-dc", operator_id: "sharz", tip: "dc", guc: "50–150 kW", birim: "TL/kWh", operatorAd: "Sharz" },
];

export default async function SarjFiyatSayfasi() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("sarj_fiyatlari").select("*");

  const fiyatMap: Record<string, { fiyat: string; guc: string; not: string; son_guncelleme: string }> = {};
  for (const row of rows ?? []) {
    fiyatMap[row.id] = {
      fiyat: row.fiyat ?? "—",
      guc: row.guc ?? "",
      not: row.aciklama ?? "",
      son_guncelleme: row.son_guncelleme ?? "—",
    };
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-slate-300 transition-colors">Admin</Link>
          <span>/</span>
          <span className="text-slate-200">Şarj Fiyatları</span>
        </nav>

        <h1 className="mb-1 text-xl font-bold">Şarj Fiyatları</h1>
        <p className="mb-6 text-sm text-slate-500">
          Operatör fiyatlarını güncelledikçe buraya gir. Değişiklikler anında{" "}
          <Link href="/sarj-haritasi" target="_blank" className="text-[var(--togg-red)] hover:text-red-400">
            şarj fiyatları sayfasına
          </Link>{" "}
          yansır.
        </p>

        <SarjFiyatEditor satirlar={SARJ_SATIRLAR} fiyatMap={fiyatMap} />
      </div>
    </div>
  );
}
