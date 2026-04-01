"use client";

/**
 * TOGGREHBERI — Yol Arkadaşı Hero Section
 * Dinamik saat tabanlı selamlama + Ekranı Okut CTA + inline arama.
 * Rehber MDX + ikaz sembolleri birlikte aranır.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { RehberMeta } from "@/lib/content/rehber";
import { searchRehberler } from "@/lib/search/fuse";
import { TUM_IKAZ_SEMBOLLERI } from "@/lib/ikaz-sembolleri";

// ─── Saat tabanlı selamlama ──────────────────────────────────────────────────

function selamlamaMetni(): { ana: string; alt: string } {
  const s = new Date().getHours();
  if (s >= 6  && s < 12) return { ana: "Günaydın.",      alt: "Yolculuğunuzda yalnız değilsiniz." };
  if (s >= 12 && s < 18) return { ana: "İyi Günler.",    alt: "Yolculuğunuzda yalnız değilsiniz." };
  if (s >= 18 && s < 24) return { ana: "İyi Akşamlar.",  alt: "Yolculuğunuzda yalnız değilsiniz." };
  return                        { ana: "İyi Geceler.",   alt: "Gece sürüşünüzde asistanınız yanınızda." };
}

// ─── İkaz Fuse instance (statik veri — bir kez oluşturulur) ─────────────────

const ikazFuse = new Fuse(TUM_IKAZ_SEMBOLLERI, {
  keys: [
    { name: "ad",                  weight: 0.5 },
    { name: "anahtar_kelimeler",   weight: 0.3 },
    { name: "anlami",              weight: 0.15 },
    { name: "kitapcik_aciklama",   weight: 0.05 },
  ],
  threshold: 0.4,
  includeScore: true,
});

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export default function YolArkadasiHero({ rehberler }: { rehberler: RehberMeta[] }) {
  const [metin, setMetin] = useState<{ ana: string; alt: string } | null>(null);
  useEffect(() => { setMetin(selamlamaMetni()); }, []);

  const [sorgu, setSorgu] = useState("");
  const [acik, setAcik] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { rehberSonuclar, ikazSonuclar } = useMemo(() => {
    if (!sorgu.trim()) return { rehberSonuclar: [], ikazSonuclar: [] };
    return {
      rehberSonuclar: searchRehberler(rehberler, sorgu).slice(0, 3),
      ikazSonuclar: ikazFuse.search(sorgu).slice(0, 3).map((r) => r.item),
    };
  }, [rehberler, sorgu]);

  const toplamSonuc = rehberSonuclar.length + ikazSonuclar.length;

  // Dışarı tıklanınca dropdown kapat
  useEffect(() => {
    function kapat(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    document.addEventListener("mousedown", kapat);
    return () => document.removeEventListener("mousedown", kapat);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sorgu.trim()) return;
    setAcik(false);
    router.push(`/arama?q=${encodeURIComponent(sorgu.trim())}`);
  }

  return (
    <section
      aria-label="Togg Yol Arkadaşı Karşılama"
      className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-5 pb-10 pt-16 text-center"
    >
      {/* Ambient arka plan parlaması */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--togg-red)]/6 blur-[120px]"
      />

      {/* Üst etiket */}
      <div className="relative mb-6 flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden />
        <span className="text-xs font-semibold tracking-wide text-slate-300">
          Togg Asistanınız Aktif
        </span>
      </div>

      {/* Selamlama */}
      <div className="relative mb-4 space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
          {metin?.ana ?? <span className="invisible">Merhaba.</span>}
        </h1>
        <p className="text-xl font-medium text-slate-300 md:text-2xl">
          {metin?.alt ?? <span className="invisible">Yolculuğunuzda yalnız değilsiniz.</span>}
        </p>
      </div>

      {/* Mikrocopy */}
      <p className="relative mb-10 max-w-sm text-base leading-relaxed text-slate-400 md:text-lg">
        Togg asistanınız hazır.{" "}
        <span className="text-white">Ekrandaki mesajı okutun</span> veya{" "}
        <span className="text-white">arayın.</span>
      </p>

      {/* ── CTA Butonları ── */}
      <div className="relative w-full max-w-md space-y-3">

        {/* Kamera — birincil eylem */}
        <Link
          href="/ekranim?kamera=ac"
          className="group flex w-full items-center justify-center gap-4 rounded-2xl bg-[var(--togg-red)] px-6 py-6 shadow-lg shadow-[var(--togg-red)]/20 transition-all active:scale-[0.98] hover:opacity-92 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--togg-red)]/50"
          aria-label="Kamerayı açarak ekrandaki mesajı okut"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15" aria-hidden>
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <div className="text-left">
            <p className="text-xl font-bold text-white">Ekranı Okut</p>
            <p className="text-sm font-medium text-white/70">Kamera ile fotoğraf çek</p>
          </div>
        </Link>

        {/* Arama kutusu */}
        <div ref={containerRef} className="relative w-full">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-slate-800/70 px-5 py-4 backdrop-blur-sm transition-colors focus-within:border-white/25 focus-within:bg-slate-800">
              <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Şarj, ABS, OTA güncelleme, park freni…"
                value={sorgu}
                onChange={(e) => { setSorgu(e.target.value); setAcik(true); }}
                onFocus={() => { if (sorgu.trim()) setAcik(true); }}
                className="flex-1 bg-transparent text-base text-white placeholder:text-slate-500 outline-none"
                aria-label="Rehberlerde ve uyarı lambalarında ara"
                autoComplete="off"
              />
              {sorgu && (
                <button
                  type="button"
                  onClick={() => { setSorgu(""); setAcik(false); }}
                  className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Aramayı temizle"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Live dropdown */}
          {acik && sorgu.trim() && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
              {toplamSonuc > 0 ? (
                <>
                  {/* Rehber sonuçları */}
                  {rehberSonuclar.length > 0 && (
                    <>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                        Rehberler
                      </p>
                      {rehberSonuclar.map((r) => (
                        <Link
                          key={`${r.kategori}/${r.slug}`}
                          href={`/rehber/${r.kategori}/${r.slug}`}
                          onClick={() => { setAcik(false); setSorgu(""); }}
                          className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-slate-800 border-b border-white/5 last:border-0"
                        >
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-medium text-white">{r.baslik}</p>
                            <p className="truncate text-xs capitalize text-slate-500">{r.kategori}</p>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}

                  {/* İkaz sembolü sonuçları */}
                  {ikazSonuclar.length > 0 && (
                    <>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                        Uyarı Lambaları
                      </p>
                      {ikazSonuclar.map((s) => (
                        <Link
                          key={s.id}
                          href={`/ikaz/${s.id}`}
                          onClick={() => { setAcik(false); setSorgu(""); }}
                          className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-slate-800 border-b border-white/5 last:border-0"
                        >
                          <span
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ${
                              s.renk === "kirmizi" ? "bg-red-500" :
                              s.renk === "sari"    ? "bg-amber-400" :
                              s.renk === "yesil"   ? "bg-green-500" :
                              s.renk === "mavi"    ? "bg-blue-500"  : "bg-neutral-400"
                            }`}
                            aria-hidden
                          />
                          <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-medium text-white">{s.ad}</p>
                            <p className="truncate text-xs text-slate-500 capitalize">{s.renk} · {s.aciliyet.replace(/_/g, " ")}</p>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}

                  <Link
                    href={`/arama?q=${encodeURIComponent(sorgu.trim())}`}
                    onClick={() => setAcik(false)}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-[var(--togg-red)] hover:bg-slate-800 transition-colors"
                  >
                    Tüm sonuçları gör →
                  </Link>
                </>
              ) : (
                <p className="px-4 py-4 text-center text-sm text-slate-600">
                  &quot;{sorgu}&quot; için sonuç bulunamadı
                </p>
              )}
            </div>
          )}
        </div>

        {/* Acil hat — kompakt */}
        <p className="pt-2 text-center text-xs text-slate-600">
          Acil destek için{" "}
          <a href="tel:08502228644" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-300 transition-colors">
            Togg Care: 0 850 222 86 44
          </a>
        </p>
      </div>
    </section>
  );
}
