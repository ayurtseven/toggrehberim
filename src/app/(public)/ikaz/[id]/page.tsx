import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TUM_IKAZ_SEMBOLLERI,
  ACILIYET_ETIKETLER,
  type IkazSembolu,
} from "@/lib/ikaz-sembolleri";
import IkazDeneyimler from "./IkazDeneyimler";

// Renk mapping (dark theme versions)
const RENK_DARK: Record<IkazSembolu["renk"], { border: string; bg: string; badge: string; text: string }> = {
  kirmizi: { border: "border-red-500/30",    bg: "bg-red-500/8",    badge: "bg-red-500/15 text-red-400",    text: "text-red-400"    },
  sari:    { border: "border-yellow-500/30", bg: "bg-yellow-500/8", badge: "bg-yellow-500/15 text-yellow-400", text: "text-yellow-400" },
  mavi:    { border: "border-blue-500/30",   bg: "bg-blue-500/8",   badge: "bg-blue-500/15 text-blue-400",   text: "text-blue-400"   },
  yesil:   { border: "border-emerald-500/30",bg: "bg-emerald-500/8",badge: "bg-emerald-500/15 text-emerald-400",text: "text-emerald-400"},
  beyaz:   { border: "border-white/20",      bg: "bg-white/5",      badge: "bg-white/10 text-neutral-300",   text: "text-white"      },
};

const ACILIYET_DARK: Record<IkazSembolu["aciliyet"], { cls: string; label: string }> = {
  hemen_dur:    { cls: "bg-red-600 text-white",                         label: "🚨 Hemen Dur!" },
  yakin_servis: { cls: "bg-orange-500 text-white",                      label: "⚠️ Yakın Servise Git" },
  dikkat:       { cls: "bg-yellow-500/20 text-yellow-400",              label: "⚡ Dikkat Et" },
  bilgi:        { cls: "bg-blue-500/15 text-blue-400",                  label: "ℹ️ Bilgi" },
};

export async function generateStaticParams() {
  return TUM_IKAZ_SEMBOLLERI.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const sembol = TUM_IKAZ_SEMBOLLERI.find((s) => s.id === id);
  if (!sembol) return {};
  return {
    title: `${sembol.ad} — Togg İkaz Lambası`,
    description: `${sembol.anlami} ${sembol.yapilacaklar[0] ?? ""}`.slice(0, 160),
    keywords: [
      ...sembol.anahtar_kelimeler,
      "togg ikaz lambası",
      "togg uyarı lambası",
      sembol.model !== "hepsi" ? `togg ${sembol.model}` : "togg t10x t10f",
    ],
  };
}

export default async function IkazDetaySayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sembol = TUM_IKAZ_SEMBOLLERI.find((s) => s.id === id);
  if (!sembol) notFound();

  const renk = RENK_DARK[sembol.renk];
  const aciliyet = ACILIYET_DARK[sembol.aciliyet];

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Togg'da ${sembol.ad} ne anlama gelir?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: sembol.anlami,
        },
      },
      {
        "@type": "Question",
        name: `Togg ${sembol.ad} ikazında ne yapmalıyım?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: sembol.yapilacaklar.join(" "),
        },
      },
      ...(sembol.nedenler.length > 0 ? [{
        "@type": "Question",
        name: `Togg ${sembol.ad} ikazı neden yanar?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: sembol.nedenler.join(" "),
        },
      }] : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-2xl px-4 py-10">

          {/* Breadcrumb */}
          <nav className="mb-6 overflow-hidden text-sm text-neutral-500 whitespace-nowrap">
            <Link href="/" className="hover:text-neutral-200 transition-colors">Ana Sayfa</Link>
            <span className="mx-2">/</span>
            <Link href="/ikaz-arama" className="hover:text-neutral-200 transition-colors">İkaz Lambası</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-300">{sembol.ad}</span>
          </nav>

          {/* Başlık kartı */}
          <div className={`mb-6 rounded-2xl border p-6 ${renk.border} ${renk.bg}`}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${aciliyet.cls}`}>
                {aciliyet.label}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${renk.badge}`}>
                {sembol.renk.charAt(0).toUpperCase() + sembol.renk.slice(1)} İkaz
              </span>
              {sembol.model !== "hepsi" && (
                <span className="rounded-full bg-[var(--togg-red)]/15 px-3 py-1 text-xs font-semibold uppercase text-[var(--togg-red)]">
                  {sembol.model}
                </span>
              )}
            </div>
            <h1 className={`text-2xl font-bold md:text-3xl ${renk.text}`}>{sembol.ad}</h1>
            <p className="mt-3 text-neutral-300">{sembol.anlami}</p>
          </div>

          {/* Ne yapmalıyım */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <h2 className="mb-4 text-lg font-bold">Ne Yapmalıyım?</h2>
            <ol className="space-y-3">
              {sembol.yapilacaklar.map((adim, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--togg-red)]/15 text-xs font-bold text-[var(--togg-red)]">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-neutral-200">{adim}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nedenler */}
          {sembol.nedenler.length > 0 && (
            <div className="mb-5 rounded-2xl border border-white/10 bg-neutral-900 p-5">
              <h2 className="mb-4 text-lg font-bold">Olası Nedenler</h2>
              <ul className="space-y-2">
                {sembol.nedenler.map((neden, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-600" />
                    {neden}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Not */}
          {sembol.not && (
            <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-sm text-yellow-300">
                <span className="font-bold">Not: </span>{sembol.not}
              </p>
            </div>
          )}

          {/* Servis gerekli uyarısı */}
          {sembol.servis_gerekli && (
            <div className="mb-5 rounded-2xl border border-orange-500/25 bg-orange-500/8 p-4">
              <p className="text-sm font-semibold text-orange-400">
                🔧 Bu ikaz için yetkili Togg servisi gereklidir.
              </p>
            </div>
          )}

          {/* Acil bant */}
          {sembol.aciliyet === "hemen_dur" && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5">
              <span className="text-lg">🚨</span>
              <div>
                <p className="text-sm font-bold text-red-400">Acil durumda Togg Care&apos;i ara</p>
                <a href="tel:08502228644" className="text-sm font-bold text-white underline">
                  0 850 222 86 44
                </a>
              </div>
            </div>
          )}

          {/* CTA butonları */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ikaz-arama"
              className="flex-1 rounded-xl bg-[var(--togg-red)] py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
            >
              AI ile Fotoğraftan Tanı
            </Link>
            <Link
              href="/ikaz"
              className="flex-1 rounded-xl border border-white/10 py-3 text-center text-sm font-semibold text-neutral-300 transition hover:border-white/20 hover:text-white"
            >
              Tüm İkazlar
            </Link>
          </div>

          {/* Kullanıcı deneyimleri */}
          <IkazDeneyimler ikazId={sembol.id} />
        </div>
      </div>
    </>
  );
}
