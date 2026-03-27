import type { Metadata } from "next";
import Link from "next/link";
import {
  TUM_IKAZ_SEMBOLLERI,
  ACILIYET_ETIKETLER,
  type IkazSembolu,
} from "@/lib/ikaz-sembolleri";

export const metadata: Metadata = {
  title: "Togg İkaz Lambaları Sözlüğü — Tüm Uyarı Sembolleri",
  description: `Togg T10X ve T10F'in tüm ${TUM_IKAZ_SEMBOLLERI.length} ikaz sembolü. Kırmızı, sarı ve mavi uyarı lambalarının anlamları ve çözümleri.`,
  keywords: ["togg ikaz lambaları", "togg uyarı sembolleri", "togg dashboard ikaz", "t10x t10f uyarı"],
};

const ACILIYET_SIRASI: IkazSembolu["aciliyet"][] = [
  "hemen_dur",
  "yakin_servis",
  "dikkat",
  "bilgi",
];

const ACILIYET_STILLER: Record<IkazSembolu["aciliyet"], { border: string; bg: string; badge: string; baslik: string }> = {
  hemen_dur:    { border: "border-red-500/25",    bg: "bg-red-500/5",    badge: "bg-red-600 text-white",                   baslik: "🚨 Kırmızı İkazlar — Hemen Dur" },
  yakin_servis: { border: "border-orange-500/25", bg: "bg-orange-500/5", badge: "bg-orange-500 text-white",                 baslik: "⚠️ Kırmızı/Sarı İkazlar — Yakın Servis" },
  dikkat:       { border: "border-yellow-500/25", bg: "bg-yellow-500/5", badge: "bg-yellow-500/20 text-yellow-400",         baslik: "⚡ Sarı İkazlar — Dikkat" },
  bilgi:        { border: "border-blue-500/20",   bg: "bg-blue-500/4",   badge: "bg-blue-500/15 text-blue-400",             baslik: "ℹ️ Mavi/Yeşil İkazlar — Bilgi" },
};

export default function IkazSozlukSayfasi() {
  const gruplar = ACILIYET_SIRASI.map((aciliyet) => ({
    aciliyet,
    stil: ACILIYET_STILLER[aciliyet],
    etiket: ACILIYET_ETIKETLER[aciliyet],
    semboller: TUM_IKAZ_SEMBOLLERI.filter((s) => s.aciliyet === aciliyet),
  })).filter((g) => g.semboller.length > 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Başlık */}
        <div className="mb-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-200 transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-neutral-300">İkaz Lambaları</span>
          </nav>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[var(--togg-red)]">El Kitabı 6.2.2</p>
          <h1 className="text-3xl font-bold">Togg İkaz Lambaları Sözlüğü</h1>
          <p className="mt-2 text-neutral-400">
            T10X ve T10F&apos;in tüm {TUM_IKAZ_SEMBOLLERI.length} ikaz sembolü — anlamları ve çözümleri.
          </p>
          <Link
            href="/ikaz-arama"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--togg-red)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            AI ile Fotoğraftan Tanı
          </Link>
        </div>

        {/* Gruplar */}
        <div className="space-y-8">
          {gruplar.map(({ aciliyet, stil, semboller }) => (
            <section key={aciliyet}>
              <h2 className="mb-4 text-base font-bold">{stil.baslik}</h2>
              <div className="space-y-2">
                {semboller.map((s) => (
                  <Link
                    key={s.id}
                    href={`/ikaz/${s.id}`}
                    className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${stil.border} ${stil.bg} hover:border-opacity-50`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stil.badge}`}>
                          {ACILIYET_ETIKETLER[aciliyet]}
                        </span>
                        {s.model !== "hepsi" && (
                          <span className="rounded-full bg-[var(--togg-red)]/10 px-2 py-0.5 text-[10px] uppercase text-[var(--togg-red)]">
                            {s.model}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white">{s.ad}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{s.anlami}</p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
