"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import type { AramaItem } from "./AramaButonu";

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

const TUR_STIL: Record<string, { bg: string; text: string }> = {
  haber:  { bg: "bg-blue-500/15",  text: "text-blue-400"  },
  ikaz:   { bg: "bg-red-500/15",   text: "text-red-400"   },
  rehber: { bg: "bg-white/10",     text: "text-slate-400" },
};

export default function HeroArama() {
  const [sorgu, setSorgu] = useState("");
  const [veri, setVeri] = useState<AramaItem[] | null>(cachedVeri);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [acik, setAcik] = useState(false);
  const [seciliIndex, setSeciliIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Veriyi ilk odaklanmada yükle
  function veriYukle() {
    if (cachedVeri) return;
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

  // Dışarı tıklanınca kapat
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const sonuclar = useMemo(() => {
    if (!veri || !sorgu.trim()) return [];
    return getFuse(veri).search(sorgu).map((r) => r.item).slice(0, 8);
  }, [veri, sorgu]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSeciliIndex((i) => Math.min(i + 1, sonuclar.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSeciliIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (seciliIndex >= 0 && sonuclar[seciliIndex]) {
        router.push(sonuclar[seciliIndex].href);
        setAcik(false);
        setSorgu("");
      } else if (sorgu.trim()) {
        router.push(`/arama?q=${encodeURIComponent(sorgu.trim())}`);
        setAcik(false);
      }
    } else if (e.key === "Escape") {
      setAcik(false);
    }
  }

  const goster = acik && (sorgu.trim() ? true : false);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Input kutusu */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/6 px-5 py-4 backdrop-blur-sm transition-all focus-within:border-white/30 focus-within:bg-white/10">
        {yukleniyor ? (
          <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        ) : (
          <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={sorgu}
          onChange={(e) => { setSorgu(e.target.value); setSeciliIndex(-1); setAcik(true); }}
          onFocus={() => { setAcik(true); veriYukle(); }}
          onKeyDown={onKeyDown}
          placeholder="Şarj, OTA güncellemesi, ikaz lambası..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          autoComplete="off"
        />
        {sorgu && (
          <button onClick={() => { setSorgu(""); inputRef.current?.focus(); }} className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown sonuçlar */}
      {goster && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/12 bg-slate-900 shadow-2xl shadow-black/60">
          {sonuclar.length > 0 ? (
            <ul className="py-1.5 max-h-[60vh] overflow-y-auto">
              {sonuclar.map((item, i) => {
                const stil = TUR_STIL[item.tur] ?? TUR_STIL.rehber;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => { setAcik(false); setSorgu(""); }}
                      onMouseEnter={() => setSeciliIndex(i)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${i === seciliIndex ? "bg-white/8" : "hover:bg-white/5"}`}
                    >
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${stil.bg} ${stil.text}`}>
                        {item.tur === "ikaz" ? "ikaz" : item.tur === "haber" ? "haber" : item.kategori}
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
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-slate-600">
              &ldquo;{sorgu}&rdquo; için sonuç bulunamadı
            </p>
          )}
          <div className="border-t border-white/8 px-4 py-2 text-[11px] text-slate-700">
            <kbd className="font-mono">↑↓</kbd> gezin &nbsp;·&nbsp; <kbd className="font-mono">↵</kbd> git &nbsp;·&nbsp; <kbd className="font-mono">esc</kbd> kapat
          </div>
        </div>
      )}
    </div>
  );
}
