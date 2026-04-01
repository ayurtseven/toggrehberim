"use client";

/**
 * TOGGREHBERI — Yol Arkadaşı Hero Section
 * Dinamik saat tabanlı selamlama + iki büyük CTA butonu.
 * Tamamen client-side; çevrimdışı (PWA) sorunsuz çalışır.
 * Negatif kelime YOK: "sorun / arıza / hata / ikaz" kullanılmaz.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Saat tabanlı selamlama (Date objesi — offline / sıfır gecikme) ───────────

function selamlamaMetni(): { ana: string; alt: string } {
  const s = new Date().getHours();
  if (s >= 6  && s < 12) return { ana: "Günaydın.",      alt: "Yolculuğunuzda yalnız değilsiniz." };
  if (s >= 12 && s < 18) return { ana: "İyi Günler.",    alt: "Yolculuğunuzda yalnız değilsiniz." };
  if (s >= 18 && s < 24) return { ana: "İyi Akşamlar.",  alt: "Yolculuğunuzda yalnız değilsiniz." };
  return                        { ana: "İyi Geceler.",   alt: "Gece sürüşünüzde asistanınız yanınızda." };
}

// ─── Sesli Sor — Web Speech API ───────────────────────────────────────────────

type SesliDurum = "bosta" | "dinliyor" | "desteklenmiyor";

function useSesliArama() {
  const [durum, setDurum] = useState<SesliDurum>("bosta");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const API = (window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
      .SpeechRecognition ?? (window as typeof window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!API) setDurum("desteklenmiyor");
  }, []);

  function sesliBaslat() {
    if (durum === "desteklenmiyor") {
      router.push("/arama");
      return;
    }
    const API = (window as typeof window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition })
      .SpeechRecognition ?? (window as typeof window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!API) return;

    const tanici = new API();
    tanici.lang = "tr-TR";
    tanici.interimResults = false;
    tanici.maxAlternatives = 1;

    setDurum("dinliyor");

    tanici.onresult = (e: SpeechRecognitionEvent) => {
      const metin = e.results[0][0].transcript;
      setDurum("bosta");
      router.push(`/arama?q=${encodeURIComponent(metin)}`);
    };

    tanici.onerror = () => setDurum("bosta");
    tanici.onend = () => setDurum((d) => d === "dinliyor" ? "bosta" : d);

    tanici.start();
  }

  return { durum, sesliBaslat };
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export default function YolArkadasiHero() {
  // SSR uyumu: selamlama sadece client'ta hesaplanır
  const [metin, setMetin] = useState<{ ana: string; alt: string } | null>(null);
  useEffect(() => { setMetin(selamlamaMetni()); }, []);

  const { durum, sesliBaslat } = useSesliArama();

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
        <span className="text-white">bize sorun.</span>
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

        {/* Sesli sor — ikincil eylem */}
        <button
          onClick={sesliBaslat}
          disabled={durum === "dinliyor"}
          aria-label={durum === "dinliyor" ? "Dinleniyor, konuşun" : "Sesli soru sor"}
          aria-live="polite"
          className="group flex w-full items-center justify-center gap-4 rounded-2xl border border-white/12 bg-slate-800/70 px-6 py-6 backdrop-blur-sm transition-all active:scale-[0.98] hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 disabled:cursor-default"
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
              durum === "dinliyor" ? "bg-emerald-500/20" : "bg-white/8"
            }`}
            aria-hidden
          >
            {durum === "dinliyor" ? (
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-emerald-400"
                    style={{
                      height: "28px",
                      animation: `soundbar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                    }}
                  />
                ))}
              </span>
            ) : (
              <svg className="h-7 w-7 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </span>
          <div className="text-left">
            <p className="text-xl font-bold text-white">
              {durum === "dinliyor" ? "Dinliyorum…" : "Sesli Sor"}
            </p>
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
              {durum === "desteklenmiyor"
                ? "Arama sayfasına git"
                : durum === "dinliyor"
                ? "Sorunuzu söyleyin"
                : "Mikrofon ile konuşun"}
            </p>
          </div>
        </button>

        {/* Acil hat — kompakt */}
        <p className="pt-2 text-center text-xs text-slate-600">
          Acil destek için{" "}
          <a href="tel:08502228644" className="font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-300 transition-colors">
            Togg Care: 0 850 222 86 44
          </a>
        </p>
      </div>

      {/* Soundbar animasyonu */}
      <style>{`
        @keyframes soundbar {
          from { transform: scaleY(0.3); opacity: 0.6; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </section>
  );
}
