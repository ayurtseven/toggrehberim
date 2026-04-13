import { createServiceClient } from "@/lib/supabase/service";
import FiyatTakipClient from "./FiyatTakipClient";

export const dynamic = "force-dynamic";

export default async function FiyatTakipSayfasi() {
  const supabase = createServiceClient();

  const { data: satirlar } = await supabase
    .from("sarj_fiyatlari")
    .select("id, fiyat, tarife_url, css_selector, son_otomatik_kontrol, otomatik_kontrol_sonucu, son_guncelleme")
    .order("id");

  const { data: gecmis } = await supabase
    .from("fiyat_gecmisi")
    .select("*")
    .order("degisim_tarihi", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--togg-red)]">
            Admin
          </p>
          <h1 className="text-2xl font-bold">Fiyat Takip Sistemi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Her tarife satırı için kaynak URL ve CSS selector tanımla. Sistem her gün 08:00'de otomatik kontrol eder.
          </p>
        </div>

        <FiyatTakipClient
          satirlar={satirlar ?? []}
          gecmis={gecmis ?? []}
        />
      </div>
    </div>
  );
}
