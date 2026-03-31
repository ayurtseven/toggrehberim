"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

export interface AramaItem {
  tur: "rehber" | "haber" | "ikaz";
  baslik: string;
  ozet: string;
  kategori: string;
  model?: string;
  etiketler?: string[];
  href: string;
}

// Module-level cache — survives re-renders
let cachedVeri: AramaItem[] | null = null;
let fuseInstance: Fuse<AramaItem> | null = null;

function getFuse(veri: AramaItem[]) {
  if (!fuseInstance) {
    fuseInstance = new Fuse(veri, {
      keys: [
        { name: "baslik", weight: 0.6 },
        { name: "ozet", weight: 0.3 },
        { name: "etiketler", weight: 0.1 },
      ],
      threshold: 0.38,
      includeScore: true,
    });
  }
  return fuseInstance;
}

const HIZLI_LINKLER = [
  { label: "İkaz Lambası Tanı", href: "/ikaz-arama", renk: "text-red-400" },
  { label: "Şarj İstasyonları", href: "/sarj-haritasi", renk: "text-yellow-400" },
  { label: "Şarj Rehberi", href: "/rehber/sarj", renk: "text-blue-400" },
  { label: "OTA Güncelleme", href: "/rehber/yazilim", renk: "text-purple-400" },
  { label: "Bakım & Servis", href: "/rehber/bakim", renk: "text-orange-400" },
];

export default function AramaButonu() {
  const [acik, setAcik] = useState(false);
  const [sorgu, setSorgu] = useState("");
  const [veri, setVeri] = useState<AramaItem[] | null>(cachedVeri);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [seciliIndex, setSeciliIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  // Cmd+K kısayolu + hero'dan gelen event
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setAcik((v) => !v);
      }
    }
    function onHeroClick() { setAcik(true); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("togg:open-search", onHeroClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("togg:open-search", onHeroClick);
    };
  }, []);

  // Modal açıldığında
  useEffect(() => {
    if (!acik) return;
    setSorgu("");
    setSeciliIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 30);

    if (!cachedVeri) {
      setYukleniyor(true);
      fetch("/api/arama-index")
        .then((r) => r.json())
        .then((data: AramaItem[]) => {
          cachedVeri = data;
          fuseInstance = null;
          setVeri(data);
        })
        .catch(() => {})
        .finally(() => setYukleniyor(false));
    }
  }, [acik]);

  // Body scroll kilidi
  useEffect(() => {
    document.body.style.overflow = acik ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [acik]);

  const kapat = () => setAcik(false);

  const sonuclar = useMemo(() => {
    if (!veri) return [];
    if (!sorgu.trim()) return [];
    return getFuse(veri).search(sorgu).map((r) => r.item).slice(0, 10);
  }, [veri, sorgu]);

  function logArama(query: string, count: number) {
    if (!query.trim() || query.length < 2) return;
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tip: "search", query, type: "genel", result_count: count }),
    }).catch(() => {});
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSeciliIndex((i) => Math.min(i + 1, sonuclar.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSeciliIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (seciliIndex >= 0 && sonuclar[seciliIndex]) {
        logArama(sorgu, sonuclar.length);
        router.push(sonuclar[seciliIndex].href);
        kapat();
      }
    } else if (e.key === "Escape") {
      kapat();
    }
  }

  // Seçili item'ı görünür tut
  useEffect(() => {
    if (seciliIndex >= 0 && listRef.current) {
      const el = listRef.current.children[seciliIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [seciliIndex]);

  return (
    <>
      {/* Trigger butonu */}
      <button
        onClick={() => setAcik(true)}
        className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-white/40 hover:text-neutral-200"
        aria-label="Ara"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline text-sm">Ara</span>
      </button>

      {/* Modal overlay */}
      {acik && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]"
          onMouseDown={(e) => { if (e.target === e.currentTarget) kapat(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

          {/* Modal kutusu */}
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-2xl shadow-black/60">

            {/* Input satırı */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              {yukleniyor ? (
                <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <input
                ref={inputRef}
                type="text"
                placeholder="Şarj, OTA, batarya, ikaz lambası..."
                value={sorgu}
                onChange={(e) => { setSorgu(e.target.value); setSeciliIndex(-1); }}
                onKeyDown={onKeyDown}
                className="flex-1 bg-transparent text-base text-white placeholder:text-slate-600 outline-none"
              />
              <button onClick={kapat} className="shrink-0">
                <kbd className="rounded border border-white/15 bg-white/8 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 cursor-pointer hover:bg-white/15">
                  ESC
                </kbd>
              </button>
            </div>

            {/* Sonuçlar */}
            <div className="max-h-[55vh] overflow-y-auto">
              {sorgu && sonuclar.length > 0 ? (
                <ul ref={listRef} className="py-1.5">
                  {sonuclar.map((item, i) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => { logArama(sorgu, sonuclar.length); kapat(); }}
                        onMouseEnter={() => setSeciliIndex(i)}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          i === seciliIndex ? "bg-white/8" : "hover:bg-white/5"
                        }`}
                      >
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            item.tur === "haber"
                              ? "bg-blue-500/15 text-blue-400"
                              : item.tur === "ikaz"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-white/10 text-slate-400"
                          }`}
                        >
                          {item.tur === "haber" ? "haber" : item.tur === "ikaz" ? "ikaz" : item.kategori}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{item.baslik}</p>
                          <p className="truncate text-xs text-slate-500">{item.ozet}</p>
                        </div>
                        {item.model && item.model !== "hepsi" && (
                          <span className="shrink-0 rounded-full bg-[var(--togg-red)]/10 px-2 py-0.5 text-[10px] uppercase text-[var(--togg-red)]">
                            {item.model}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : sorgu && veri ? (
                <p className="px-4 py-10 text-center text-sm text-slate-600">
                  &ldquo;{sorgu}&rdquo; için sonuç bulunamadı
                </p>
              ) : (
                /* Hızlı linkler — sorgu yokken */
                <div className="px-4 py-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    Hızlı Erişim
                  </p>
                  <div className="space-y-1">
                    {HIZLI_LINKLER.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={kapat}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                      >
                        <svg className={`h-4 w-4 shrink-0 ${link.renk}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-sm text-slate-300">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 border-t border-white/8 px-4 py-2.5 text-[11px] text-slate-700">
              <span><kbd className="font-mono text-slate-600">↑↓</kbd> gezin</span>
              <span><kbd className="font-mono text-slate-600">↵</kbd> git</span>
              <span><kbd className="font-mono text-slate-600">esc</kbd> kapat</span>
              {veri && (
                <span className="ml-auto">{veri.length} içerik indekslendi</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
