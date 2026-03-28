"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { useModelSecim } from "@/lib/model-secim";
import type { RehberOzet } from "./RehberFiltreli";

// ── Hızlı Çözüm Kartları (Bento) ──────────────────────────────────────────────
const HIZLI_COZUMLER = [
  {
    baslik: "Araç Şarj Olmuyor",
    aciklama: "AC/DC şarj sorunları, adaptör hataları",
    ikon: "⚡",
    href: "/rehber/sarj",
    renk: "blue",
    boyut: "large",
  },
  {
    baslik: "İkaz Lambası Yandı",
    aciklama: "AI ile fotoğraftan tanı",
    ikon: "🚨",
    href: "/ikaz-arama",
    renk: "red",
    boyut: "large",
  },
  {
    baslik: "Ekran Dondu",
    aciklama: "Sıfırlama ve yazılım çözümleri",
    ikon: "📱",
    href: "/rehber/yazilim",
    renk: "purple",
    boyut: "small",
  },
  {
    baslik: "Menzil Düşük",
    aciklama: "Batarya optimizasyonu",
    ikon: "🔋",
    href: "/rehber/sarj",
    renk: "amber",
    boyut: "small",
  },
  {
    baslik: "Bakım Zamanı",
    aciklama: "Servis ve bakım rehberi",
    ikon: "🔧",
    href: "/rehber/bakim",
    renk: "green",
    boyut: "small",
  },
] as const;

// ── Senaryo Grupları ──────────────────────────────────────────────────────────
const SENARYOLAR = [
  { slug: "sarj",      label: "Şarj & Batarya Sorunları",  ikon: "⚡", renk: "blue"   },
  { slug: "yazilim",   label: "Ekran & Yazılım Çözümleri", ikon: "💻", renk: "purple" },
  { slug: "bakim",     label: "Bakım & Servis",             ikon: "🔧", renk: "orange" },
  { slug: "suruculuk", label: "Sürüş & Performans",         ikon: "🚗", renk: "green"  },
  { slug: "sss",       label: "Sık Sorulan Sorular",        ikon: "❓", renk: "slate"  },
];

const RENK: Record<string, { border: string; bg: string; text: string; badge: string; glow: string }> = {
  blue:   { border: "border-blue-500/20",   bg: "bg-blue-500/8",   text: "text-blue-400",   badge: "bg-blue-500/15 text-blue-300",   glow: "hover:shadow-blue-500/10"   },
  purple: { border: "border-purple-500/20", bg: "bg-purple-500/8", text: "text-purple-400", badge: "bg-purple-500/15 text-purple-300", glow: "hover:shadow-purple-500/10" },
  red:    { border: "border-red-500/20",    bg: "bg-red-500/8",    text: "text-red-400",    badge: "bg-red-500/15 text-red-300",    glow: "hover:shadow-red-500/10"    },
  amber:  { border: "border-amber-500/20",  bg: "bg-amber-500/8",  text: "text-amber-400",  badge: "bg-amber-500/15 text-amber-300",  glow: "hover:shadow-amber-500/10"  },
  green:  { border: "border-emerald-500/20",bg: "bg-emerald-500/8",text: "text-emerald-400",badge: "bg-emerald-500/15 text-emerald-300",glow:"hover:shadow-emerald-500/10"},
  orange: { border: "border-orange-500/20", bg: "bg-orange-500/8", text: "text-orange-400", badge: "bg-orange-500/15 text-orange-300", glow: "hover:shadow-orange-500/10" },
  slate:  { border: "border-slate-500/20",  bg: "bg-slate-500/8",  text: "text-slate-400",  badge: "bg-slate-500/15 text-slate-300",  glow: "hover:shadow-slate-500/10"  },
};

type ModelFiltre = "hepsi" | "t10x" | "t10f";

// ── Ana Bileşen ───────────────────────────────────────────────────────────────
export default function RehberSayfasi({ rehberler }: { rehberler: RehberOzet[] }) {
  const { secili } = useModelSecim();
  const [aramaMetni, setAramaMetni] = useState("");
  const [aramaAcik, setAramaAcik] = useState(false);
  const [filtre, setFiltre] = useState<ModelFiltre>("hepsi");
  const aramaRef = useRef<HTMLInputElement>(null);

  // Kayıtlı model varsa oto-seç
  useEffect(() => {
    if (secili) setFiltre(secili.startsWith("t10x") ? "t10x" : "t10f");
  }, [secili]);

  // Fuse.js kurulumu
  const fuse = useMemo(
    () =>
      new Fuse(rehberler, {
        keys: [
          { name: "baslik", weight: 0.6 },
          { name: "ozet", weight: 0.25 },
          { name: "etiketler", weight: 0.15 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [rehberler]
  );

  const aramaKaynak = aramaMetni.trim()
    ? fuse.search(aramaMetni.trim()).map((r) => r.item)
    : [];

  // Model filtresi
  const filtrelenmis = filtre === "hepsi"
    ? rehberler
    : rehberler.filter((r) => r.model === filtre || r.model === "hepsi");

  // Senaryo bazlı gruplama
  const senaryolar = SENARYOLAR.map((s) => ({
    ...s,
    rehberler: filtrelenmis.filter((r) => r.kategori === s.slug),
  }));

  const aramaGoster = aramaAcik && aramaMetni.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">

        {/* ── Başlık + Arama ── */}
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Çözüm Merkezi
            </p>
            <h1 className="text-3xl font-bold text-slate-100">
              Togg Rehberi
            </h1>
            <p className="mt-2 text-slate-500">
              T10X ve T10F sahipleri için adım adım çözüm kılavuzları
            </p>
          </div>

          {/* Arama */}
          <div className="relative">
            <div
              className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 transition-all ${
                aramaAcik
                  ? "border-slate-600 bg-slate-900 shadow-lg shadow-black/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={aramaRef}
                type="text"
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                onFocus={() => setAramaAcik(true)}
                onBlur={() => setTimeout(() => setAramaAcik(false), 150)}
                placeholder="Rehberlerde ara... (ör: OTA güncelleme, kış şarjı)"
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
              />
              {aramaMetni && (
                <button
                  onClick={() => { setAramaMetni(""); aramaRef.current?.focus(); }}
                  className="shrink-0 text-slate-600 hover:text-slate-400"
                >
                  ✕
                </button>
              )}
              <kbd className="hidden shrink-0 rounded border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-600 sm:block">
                /
              </kbd>
            </div>

            {/* Arama Sonuçları */}
            {aramaGoster && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden">
                {aramaKaynak.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-slate-500">Sonuç bulunamadı.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {aramaKaynak.slice(0, 8).map((r) => {
                      const kat = SENARYOLAR.find((s) => s.slug === r.kategori);
                      return (
                        <Link
                          key={r.slug}
                          href={`/rehber/${r.kategori}/${r.slug}`}
                          className="flex items-start gap-3 border-b border-slate-800/60 px-5 py-3 last:border-0 hover:bg-slate-800/60 transition-colors"
                        >
                          <span className="mt-0.5 text-base">{kat?.ikon}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{r.baslik}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{r.ozet}</p>
                          </div>
                          {r.model !== "hepsi" && (
                            <span className={`shrink-0 self-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.model === "t10x" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"}`}>
                              {r.model.toUpperCase()}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Bento Grid: Hızlı Çözümler ── */}
        {!aramaMetni && (
          <section>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Hızlı Çözüm
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {HIZLI_COZUMLER.map((k) => {
                const r = RENK[k.renk];
                return (
                  <Link
                    key={k.href + k.baslik}
                    href={k.href}
                    className={`group relative rounded-2xl border p-4 transition-all hover:shadow-lg ${r.border} ${r.bg} ${r.glow} ${k.boyut === "large" ? "sm:col-span-1" : ""}`}
                  >
                    <div className={`mb-3 text-2xl`}>{k.ikon}</div>
                    <p className={`text-sm font-semibold leading-snug ${r.text}`}>
                      {k.baslik}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 leading-snug">
                      {k.aciklama}
                    </p>
                    <div className={`absolute bottom-3 right-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity ${r.text}`}>
                      →
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Model Filtresi ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl border border-slate-800 bg-slate-900/60 p-1 gap-1">
            {(["hepsi", "t10x", "t10f"] as ModelFiltre[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                  filtre === f
                    ? f === "t10x"
                      ? "bg-blue-500/20 text-blue-300 shadow-sm"
                      : f === "t10f"
                      ? "bg-purple-500/20 text-purple-300 shadow-sm"
                      : "bg-slate-700/60 text-slate-100 shadow-sm"
                    : "text-slate-600 hover:text-slate-400"
                }`}
              >
                {f === "hepsi" ? "Tümü" : f.toUpperCase()}
              </button>
            ))}
          </div>
          {filtre !== "hepsi" && (
            <span className="text-xs text-slate-600">
              {filtrelenmis.length} rehber
            </span>
          )}
          {secili && (
            <span className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs text-slate-500">
              {secili.startsWith("t10x") ? "T10X" : "T10F"} için kişiselleştirildi
            </span>
          )}
        </div>

        {/* ── Senaryo Bazlı İçerik ── */}
        <div className="space-y-12">
          {senaryolar.map((senaryo) => {
            if (senaryo.rehberler.length === 0) return null;
            const r = RENK[senaryo.renk];
            return (
              <section key={senaryo.slug}>
                {/* Senaryo başlığı */}
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl border text-sm ${r.border} ${r.bg}`}>
                      {senaryo.ikon}
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">
                      {senaryo.label}
                    </h2>
                    <span className="rounded-full border border-slate-800 px-2 py-0.5 text-xs text-slate-600">
                      {senaryo.rehberler.length}
                    </span>
                  </div>
                  <Link
                    href={`/rehber/${senaryo.slug}`}
                    className={`text-xs font-semibold transition-colors ${r.text} hover:opacity-80`}
                  >
                    Tümünü gör →
                  </Link>
                </div>

                {/* Kartlar */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {senaryo.rehberler.slice(0, 3).map((rehber) => (
                    <RehberKarti
                      key={rehber.slug}
                      rehber={rehber}
                      seciliModel={secili?.startsWith("t10x") ? "t10x" : secili ? "t10f" : null}
                      kategoriRenk={senaryo.renk}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Tüm kategoriler boşsa */}
        {filtrelenmis.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400 font-medium">Bu model için henüz içerik yok.</p>
            <button onClick={() => setFiltre("hepsi")} className="mt-3 text-sm text-slate-600 underline">
              Tüm içerikleri göster
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Rehber Kartı ──────────────────────────────────────────────────────────────
function RehberKarti({
  rehber,
  seciliModel,
  kategoriRenk,
}: {
  rehber: RehberOzet;
  seciliModel: "t10x" | "t10f" | null;
  kategoriRenk: string;
}) {
  const uyumlu = seciliModel && (rehber.model === "hepsi" || rehber.model === seciliModel);
  const r = RENK[kategoriRenk];

  return (
    <Link
      href={`/rehber/${rehber.kategori}/${rehber.slug}`}
      className={`group relative flex flex-col rounded-2xl border p-5 transition-all hover:shadow-lg ${
        uyumlu
          ? `${r.border} bg-slate-900/70 ${r.glow}`
          : "border-slate-800/60 bg-slate-900/30 hover:border-slate-700/60"
      }`}
    >
      {/* "Senin için" işareti */}
      {uyumlu && rehber.model !== "hepsi" && (
        <span className="absolute right-3 top-3 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          senin için ✓
        </span>
      )}

      {/* Başlık */}
      <h3 className="mb-2 text-sm font-semibold leading-snug text-slate-100 group-hover:text-white transition-colors">
        {rehber.baslik}
      </h3>

      {/* Özet */}
      <p className="flex-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
        {rehber.ozet}
      </p>

      {/* Alt bilgi */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {rehber.model !== "hepsi" && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${rehber.model === "t10x" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"}`}>
              {rehber.model}
            </span>
          )}
          {rehber.sure && (
            <span className="rounded-full border border-slate-800 px-2 py-0.5 text-[10px] text-slate-600">
              {rehber.sure} dk
            </span>
          )}
        </div>
        <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${r.text}`}>
          Oku →
        </span>
      </div>
    </Link>
  );
}
