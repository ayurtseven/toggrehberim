"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { FavoriIstasyon } from "@/app/api/favori-istasyonlar/route";

const MODEL_BILGI = {
  t10x: { ad: "T10X", wltp: 523, tanim: "Tek Motor · RWD" },
  t10f: { ad: "T10F", wltp: 623, tanim: "Çift Motor · AWD" },
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type IstasyonMesafeli = FavoriIstasyon & { mesafe?: number };

const DURUM_RENK: Record<FavoriIstasyon["durum"], { cls: string; label: string }> = {
  musait:     { cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", label: "Müsait" },
  kismi:      { cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",    label: "Kısmi" },
  megul:      { cls: "bg-red-500/15 text-red-400 border-red-500/25",             label: "Meşgul" },
  kapali:     { cls: "bg-neutral-700/40 text-neutral-400 border-neutral-600/25", label: "Kapalı" },
  bilinmiyor: { cls: "bg-white/5 text-neutral-500 border-white/10",              label: "Bilinmiyor" },
};

export default function SarjHesaplayici({ istasyonlar }: { istasyonlar: FavoriIstasyon[] }) {
  const [model, setModel] = useState<"t10x" | "t10f">("t10x");
  const [batarya, setBatarya] = useState(72);
  const [soguk, setSoguk] = useState(false);
  const [eko, setEko] = useState(false);
  const [konum, setKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [konumHata, setKonumHata] = useState(false);
  const [konumYukleniyor, setKonumYukleniyor] = useState(false);

  const wltp = MODEL_BILGI[model].wltp;
  const sogukKatsayi = soguk ? 0.75 : 1.0;
  const ekoKatsayi = eko ? 1.08 : 1.0;
  const menzil = Math.round((batarya / 100) * wltp * sogukKatsayi * ekoKatsayi);
  const sarj20deMesafe = batarya > 20
    ? Math.round(((batarya - 20) / 100) * wltp * sogukKatsayi * ekoKatsayi)
    : 0;

  // Renk coding
  const menzilRenk =
    menzil > 150 ? "text-emerald-400" :
    menzil > 80  ? "text-yellow-400" :
                   "text-red-400";
  const barRenk =
    menzil > 150 ? "bg-emerald-500" :
    menzil > 80  ? "bg-yellow-400" :
                   "bg-red-500";
  const bataryaYuzde = batarya;

  // Nearest stations
  const istasyonlarSirali = useMemo<IstasyonMesafeli[]>(() => {
    if (!konum) return istasyonlar.slice(0, 4);
    return [...istasyonlar]
      .map((ist) => ({
        ...ist,
        mesafe: haversine(konum.lat, konum.lng, ist.lat, ist.lng),
      }))
      .sort((a, b) => (a.mesafe ?? 999) - (b.mesafe ?? 999))
      .slice(0, 4);
  }, [konum, istasyonlar]);

  function konumAl() {
    if (!navigator.geolocation) { setKonumHata(true); return; }
    setKonumYukleniyor(true);
    setKonumHata(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setKonum({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setKonumYukleniyor(false);
      },
      () => {
        setKonumHata(true);
        setKonumYukleniyor(false);
      },
      { timeout: 8000 }
    );
  }

  return (
    <div className="space-y-5">

      {/* Model seçimi */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Araç Modeli</p>
        <div className="grid grid-cols-2 gap-3">
          {(["t10x", "t10f"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                model === m
                  ? "border-[var(--togg-red)]/50 bg-[var(--togg-red)]/10"
                  : "border-white/10 bg-white/3 hover:bg-white/6"
              }`}
            >
              <p className={`text-lg font-bold ${model === m ? "text-[var(--togg-red)]" : "text-white"}`}>
                {MODEL_BILGI[m].ad}
              </p>
              <p className="text-xs text-neutral-500">{MODEL_BILGI[m].tanim}</p>
              <p className="mt-1 text-xs font-medium text-neutral-400">{MODEL_BILGI[m].wltp} km WLTP</p>
            </button>
          ))}
        </div>
      </div>

      {/* Batarya seviyesi */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Mevcut Batarya</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={batarya}
              onChange={(e) => setBatarya(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-16 rounded-lg border border-white/15 bg-neutral-800 px-2 py-1 text-center text-sm font-bold text-white focus:outline-none focus:border-white/30"
            />
            <span className="text-sm text-neutral-400">%</span>
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={1}
          max={100}
          value={batarya}
          onChange={(e) => setBatarya(Number(e.target.value))}
          className="w-full accent-[var(--togg-red)]"
          style={{ accentColor: "var(--togg-red)" }}
        />

        {/* Battery bar visualization */}
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barRenk}`}
            style={{ width: `${bataryaYuzde}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-neutral-700">
          <span>0%</span>
          <span className="text-neutral-500">Optimal şarj: %20–80</span>
          <span>100%</span>
        </div>
      </div>

      {/* Koşullar */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Sürüş Koşulları</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Hava */}
          <button
            onClick={() => setSoguk((v) => !v)}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left transition-all ${
              soguk
                ? "border-blue-500/40 bg-blue-500/10"
                : "border-white/10 bg-white/3 hover:bg-white/6"
            }`}
          >
            <span className="text-2xl">{soguk ? "❄️" : "☀️"}</span>
            <div>
              <p className={`text-sm font-semibold ${soguk ? "text-blue-400" : "text-white"}`}>
                {soguk ? "Soğuk Hava" : "Normal Hava"}
              </p>
              <p className="text-xs text-neutral-600">{soguk ? "−%25 menzil" : "WLTP koşulları"}</p>
            </div>
          </button>

          {/* Sürüş modu */}
          <button
            onClick={() => setEko((v) => !v)}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left transition-all ${
              eko
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-white/10 bg-white/3 hover:bg-white/6"
            }`}
          >
            <span className="text-2xl">{eko ? "🍃" : "🚗"}</span>
            <div>
              <p className={`text-sm font-semibold ${eko ? "text-emerald-400" : "text-white"}`}>
                {eko ? "Ekonomik" : "Normal Sürüş"}
              </p>
              <p className="text-xs text-neutral-600">{eko ? "+%8 menzil" : "Standart"}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Sonuç */}
      <div className={`rounded-2xl border p-6 ${
        menzil > 150 ? "border-emerald-500/25 bg-emerald-500/5" :
        menzil > 80  ? "border-yellow-500/25 bg-yellow-500/5" :
                       "border-red-500/25 bg-red-500/5"
      }`}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Tahmini Menzil</p>
        <div className="mb-4 flex items-end gap-2">
          <span className={`text-6xl font-extrabold tabular-nums ${menzilRenk}`}>{menzil}</span>
          <span className="mb-2 text-xl font-semibold text-neutral-400">km</span>
        </div>

        {/* Menzil çubuğu */}
        <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barRenk}`}
            style={{ width: `${Math.min(100, (menzil / wltp) * 100)}%` }}
          />
        </div>

        {/* Bilgi satırları */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span>WLTP tam menzil</span>
            <span className="font-semibold text-white">{wltp} km</span>
          </div>
          {soguk && (
            <div className="flex items-center justify-between text-blue-400">
              <span>❄️ Soğuk hava etkisi</span>
              <span className="font-semibold">−%25</span>
            </div>
          )}
          {eko && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>🍃 Ekonomik sürüş</span>
              <span className="font-semibold">+%8</span>
            </div>
          )}

          {batarya <= 20 ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2.5 text-red-400">
              <span>🚨</span>
              <span className="text-xs font-semibold">Batarya kritik seviyede! Hemen şarj et.</span>
            </div>
          ) : sarj20deMesafe > 0 ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-neutral-400">
              <span>💡</span>
              <span className="text-xs">
                <strong className="text-white">~{sarj20deMesafe} km</strong> sonra şarjı düşün (%20 eşiği)
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* İstasyonlar */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">
            {konum ? "Size En Yakın İstasyonlar" : "Favori İstasyonlar"}
          </p>
          {!konum && (
            <button
              onClick={konumAl}
              disabled={konumYukleniyor}
              className="flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              {konumYukleniyor ? (
                <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              Konumumu Kullan
            </button>
          )}
        </div>

        {konumHata && (
          <p className="mb-3 text-xs text-red-400">Konum alınamadı. İzin vermeniz gerekebilir.</p>
        )}

        {istasyonlarSirali.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-600">İstasyon bulunamadı.</p>
        ) : (
          <div className="space-y-2">
            {istasyonlarSirali.map((ist) => {
              const durum = DURUM_RENK[ist.durum];
              const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${ist.lat},${ist.lng}`;
              const mesafeIcindeMi = (ist as IstasyonMesafeli).mesafe !== undefined
                ? (ist as IstasyonMesafeli).mesafe! <= menzil
                : true;
              return (
                <div
                  key={ist.id}
                  className={`rounded-xl border p-3 transition ${mesafeIcindeMi ? "border-white/10" : "border-red-500/20 opacity-60"} bg-white/[0.02]`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${durum.cls}`}>
                          {durum.label}
                        </span>
                        {(ist as IstasyonMesafeli).mesafe !== undefined && (
                          <span className={`text-xs font-semibold ${mesafeIcindeMi ? "text-emerald-400" : "text-red-400"}`}>
                            {Math.round((ist as IstasyonMesafeli).mesafe!)} km uzakta
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm font-semibold text-white">{ist.ad}</p>
                      <p className="text-xs text-neutral-600">{ist.ilce && `${ist.ilce}, `}{ist.sehir}</p>
                    </div>
                    <a
                      href={gmaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      Rota
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/sarj-haritasi"
          className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-sm text-neutral-400 transition hover:text-white hover:border-white/20"
        >
          Tüm İstasyonları Gör →
        </Link>
      </div>
    </div>
  );
}
