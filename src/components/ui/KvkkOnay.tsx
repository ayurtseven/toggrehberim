"use client";

/**
 * TOGGREHBERI — KVKK Consent Modal
 * Blueprint §Data Safety: First-load consent.
 * Stores only: { givenAt, version } in localStorage.
 * No personal data collected.
 */

import { useState, useEffect } from "react";

const KVKK_KEY = "toggrehberi_kvkk_v1";
const KVKK_VERSION = "1.0";

export function useKvkkConsent() {
  const [onaylandi, setOnaylandi] = useState(true); // SSR: assume ok to avoid flash

  useEffect(() => {
    const kayit = localStorage.getItem(KVKK_KEY);
    if (!kayit) setOnaylandi(false);
  }, []);

  function onayla() {
    localStorage.setItem(
      KVKK_KEY,
      JSON.stringify({ givenAt: new Date().toISOString(), version: KVKK_VERSION })
    );
    setOnaylandi(true);
  }

  return { onaylandi, onayla };
}

export default function KvkkOnay() {
  const { onaylandi, onayla } = useKvkkConsent();

  if (onaylandi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--togg-red)]/15 text-[var(--togg-red)]">
            🛡️
          </div>
          <div>
            <h2 className="font-bold text-white">Gizlilik & KVKK</h2>
            <p className="text-xs text-slate-500">Toggrehberim.com</p>
          </div>
        </div>

        {/* Body */}
        <div className="mb-5 space-y-3 text-sm text-slate-400">
          <p>
            Bu uygulama araç dashboard uyarı lambalarını tanımlamanıza yardımcı olur.
          </p>
          <ul className="space-y-1.5">
            {[
              "📸 Yüklediğin fotoğraflar analiz sonrası hemen silinir — depolanmaz",
              "📍 Konum bilgisi yalnızca en yakın servisi bulmak için kullanılır",
              "📊 Yalnızca anonim kullanım istatistikleri toplanır (kişisel veri yok)",
              "🔒 Veriler 3. taraflarla paylaşılmaz",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span>{item.slice(0, 2)}</span>
                <span>{item.slice(3)}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-600">
            KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu) kapsamında işlem yapılmaktadır.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onayla}
            className="flex-1 rounded-xl bg-[var(--togg-red)] py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Anladım, Devam Et
          </button>
          <a
            href="/gizlilik"
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-400 transition hover:border-white/20 hover:text-slate-300"
          >
            Detaylar
          </a>
        </div>
      </div>
    </div>
  );
}
