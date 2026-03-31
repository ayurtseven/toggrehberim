import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SarjFiyatListesi from "./SarjFiyatListesi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Elektrikli Araç Şarj Fiyatları 2025 — Trugo, ZES, Eşarj, Voltrun",
  description:
    "Türkiye'deki elektrikli araç şarj istasyonu fiyat tarifeleri. Trugo, ZES, Eşarj, Beefull, Voltrun, Sharz AC ve DC şarj ücretleri.",
  keywords: [
    "şarj fiyatları 2025",
    "trugo fiyat",
    "zes şarj fiyatı",
    "eşarj fiyat",
    "elektrikli araç şarj ücreti",
    "dc hızlı şarj fiyatı",
    "togg şarj maliyeti",
  ],
};

interface SarjTarife {
  id: string;
  tip: "ac" | "dc";
  guc: string;
  fiyat: string;
  birim: string;
  not?: string;
}

interface Operator {
  id: string;
  ad: string;
  renk: string;
  logoBg: string;
  url: string;
  app: string;
  toggNot?: string;
  tarifeler: SarjTarife[];
}

const OPERATORLER_META: Omit<Operator, "tarifeler">[] = [
  { id: "trugo", ad: "Trugo", renk: "#e8002d", logoBg: "bg-red-600/15", url: "https://www.trugo.com.tr", app: "https://www.trugo.com.tr/uygulamayi-indir", toggNot: "Togg'un kendi şarj ağı — en geniş DC ağı" },
  { id: "zes", ad: "ZES", renk: "#1d6eff", logoBg: "bg-blue-600/15", url: "https://zes.net", app: "https://zes.net/uygulama" },
  { id: "esarj", ad: "Eşarj", renk: "#00c853", logoBg: "bg-green-600/15", url: "https://esarj.com", app: "https://esarj.com/uygulama" },
  { id: "beefull", ad: "Beefull", renk: "#ff6600", logoBg: "bg-orange-600/15", url: "https://beefull.com", app: "https://beefull.com" },
  { id: "voltrun", ad: "Voltrun", renk: "#8b5cf6", logoBg: "bg-violet-600/15", url: "https://voltrun.com", app: "https://voltrun.com" },
  { id: "sharz", ad: "Sharz", renk: "#06b6d4", logoBg: "bg-cyan-600/15", url: "https://sharz.net", app: "https://sharz.net" },
];

const TARIFELER_META: Omit<SarjTarife, "fiyat" | "not">[] = [
  { id: "trugo-ac",     tip: "ac", guc: "7–22 kW",  birim: "TL/kWh" },
  { id: "trugo-dc-50",  tip: "dc", guc: "50 kW",    birim: "TL/kWh" },
  { id: "trugo-dc-150", tip: "dc", guc: "150 kW",   birim: "TL/kWh" },
  { id: "trugo-dc-300", tip: "dc", guc: "300 kW",   birim: "TL/kWh" },
  { id: "zes-ac",       tip: "ac", guc: "7–22 kW",  birim: "TL/kWh" },
  { id: "zes-dc-50",    tip: "dc", guc: "50 kW",    birim: "TL/kWh" },
  { id: "zes-dc-120",   tip: "dc", guc: "120+ kW",  birim: "TL/kWh" },
  { id: "esarj-ac",     tip: "ac", guc: "7–22 kW",  birim: "TL/kWh" },
  { id: "esarj-dc-50",  tip: "dc", guc: "50 kW",    birim: "TL/kWh" },
  { id: "esarj-dc-150", tip: "dc", guc: "150 kW",   birim: "TL/kWh" },
  { id: "beefull-ac",   tip: "ac", guc: "7–22 kW",  birim: "TL/kWh" },
  { id: "beefull-dc",   tip: "dc", guc: "50–150 kW", birim: "TL/kWh" },
  { id: "voltrun-ac",   tip: "ac", guc: "7–22 kW",  birim: "TL/kWh" },
  { id: "voltrun-dc-50", tip: "dc", guc: "50 kW",   birim: "TL/kWh" },
  { id: "voltrun-dc-150", tip: "dc", guc: "150 kW", birim: "TL/kWh" },
  { id: "sharz-ac",     tip: "ac", guc: "7–22 kW",  birim: "TL/kWh" },
  { id: "sharz-dc",     tip: "dc", guc: "50–150 kW", birim: "TL/kWh" },
];

// Tarife id'sinden operator_id'yi çıkar
function operatorIdden(tarifeId: string): string {
  if (tarifeId.startsWith("trugo")) return "trugo";
  if (tarifeId.startsWith("zes")) return "zes";
  if (tarifeId.startsWith("esarj")) return "esarj";
  if (tarifeId.startsWith("beefull")) return "beefull";
  if (tarifeId.startsWith("voltrun")) return "voltrun";
  if (tarifeId.startsWith("sharz")) return "sharz";
  return tarifeId.split("-")[0];
}

export default async function SarjFiyatlariSayfasi() {
  // Supabase'den fiyatları çek
  const supabase = await createClient();
  const { data: fiyatRows } = await supabase.from("sarj_fiyatlari").select("*");

  const fiyatMap: Record<string, { fiyat: string; guc: string; not: string; son_guncelleme: string; gizli: boolean }> = {};
  for (const row of fiyatRows ?? []) {
    fiyatMap[row.id] = {
      fiyat: row.fiyat ?? "—",
      guc: row.guc ?? "",
      not: row.aciklama ?? "",
      son_guncelleme: row.son_guncelleme ?? "—",
      gizli: row.gizli ?? false,
    };
  }

  // Operatör listesini oluştur
  const operatorler: Operator[] = OPERATORLER_META.map((meta) => ({
    ...meta,
    tarifeler: TARIFELER_META
      .filter((t) => operatorIdden(t.id) === meta.id)
      .filter((t) => !fiyatMap[t.id]?.gizli)
      .map((t) => ({
        ...t,
        guc: fiyatMap[t.id]?.guc || t.guc,
        fiyat: fiyatMap[t.id]?.fiyat ?? "—",
        not: fiyatMap[t.id]?.not || undefined,
      })),
  }));

  // Son güncellemeler — en son güncellenen tarih
  const sonGuncelleme = fiyatRows
    ?.map((r) => r.son_guncelleme)
    .filter(Boolean)
    .sort()
    .at(-1) ?? "—";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-10">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-slate-200">Şarj Fiyatları</span>
        </nav>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Fiyat Rehberi
        </div>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Şarj İstasyonu Fiyatları</h1>
        <p className="mt-3 mb-2 text-slate-400">
          Türkiye'deki başlıca şarj ağlarının AC ve DC fiyat tarifeleri.
        </p>
        {sonGuncelleme !== "—" && (
          <p className="mb-2 text-xs text-slate-600">Son güncelleme: {sonGuncelleme}</p>
        )}

        {/* Güncelleme uyarısı */}
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3.5">
          <span className="mt-0.5 text-base">⚠️</span>
          <p className="text-sm text-yellow-200/80">
            Şarj fiyatları sık güncellenir. Bu sayfadaki rakamlar doğrulandıkça eklenmektedir.
            Güncel fiyat için her zaman operatör uygulamasını kontrol edin.
          </p>
        </div>

        {/* AC / DC açıklaması */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/8 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300">AC</span>
              <span className="text-sm font-semibold text-white">Normal Şarj</span>
            </div>
            <p className="text-sm text-slate-400">
              Evde veya normal istasyonlarda yapılır. 7–22 kW güç. Tam şarj 4–12 saat sürer.
              Günlük kullanım için idealdir, bataryaya nazik gelir.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--togg-red)]/20 bg-[var(--togg-red)]/8 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-[var(--togg-red)]/20 px-2.5 py-0.5 text-xs font-bold text-[var(--togg-red)]">DC</span>
              <span className="text-sm font-semibold text-white">Hızlı Şarj</span>
            </div>
            <p className="text-sm text-slate-400">
              Yolda gördüğünüz büyük istasyonlar. 50–300 kW güç. %20&apos;den %80&apos;e
              20–45 dakika. AC&apos;ye göre 1,5–3× daha pahalıdır.
            </p>
          </div>
        </div>

        {/* Filtre + Kart/Liste görünümü */}
        <SarjFiyatListesi operatorler={operatorler} />

        {/* Hesaplama notu */}
        <div className="mt-10 rounded-2xl border border-white/8 bg-slate-900/40 p-5">
          <p className="mb-2 font-semibold text-slate-300">Maliyet Hesaplama</p>
          <p className="text-sm text-slate-500">
            T10X bataryası 88 kWh, T10F bataryası 88 kWh (kullanılabilir).
            %20&apos;den %80&apos;e şarj etmek ≈ 53 kWh demek.
            DC hızlı şarjda bu işlemin maliyeti fiyat×53 TL olarak hesaplanabilir.
          </p>
          <div className="mt-3">
            <Link
              href="/sarj-hesaplayici"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--togg-red)] hover:text-red-400 transition-colors"
            >
              Menzil Hesaplayıcı →
            </Link>
          </div>
        </div>

        {/* Alt not */}
        <p className="mt-6 text-center text-xs text-slate-700">
          Fiyat güncellemesi için{" "}
          <Link href="/oner" className="underline hover:text-slate-500 transition-colors">
            öneri gönderebilirsiniz
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
