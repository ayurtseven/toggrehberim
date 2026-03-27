"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { Istasyon, Baglanti, Filtreler } from "@/lib/sarj-types";

// ─── Operatör renk & bilgi tablosu ───────────────────────────────────────────
const OPERATOR: Record<
  string,
  { renk: string; yazi: string; url?: string; fiyatUrl?: string }
> = {
  trugo:   { renk: "#e8002d", yazi: "Trugo",   url: "https://www.trugo.com.tr", fiyatUrl: "https://www.trugo.com.tr/tarifeler" },
  zes:     { renk: "#1d6eff", yazi: "ZES",      url: "https://zes.net",          fiyatUrl: "https://zes.net/tarifeler" },
  esarj:   { renk: "#00c853", yazi: "Eşarj",   url: "https://esarj.com" },
  beefull: { renk: "#ff6600", yazi: "Beefull",  url: "https://beefull.com" },
  voltrun: { renk: "#8b5cf6", yazi: "Voltrun",  url: "https://voltrun.com" },
  sharz:   { renk: "#06b6d4", yazi: "Sharz",    url: "https://sharz.net" },
  tesla:   { renk: "#cc0000", yazi: "Tesla",    url: "https://www.tesla.com/tr_TR/findus/list/superchargers/Turkey" },
  diger:   { renk: "#6b7280", yazi: "Diğer" },
};

// Togg T10X/T10F ile uyumlu bağlantı tipleri
const TOGG_UYUMLU = ["CCS", "Type 2", "IEC 62196", "Mennekes", "Combo"];

function toggUyumluMu(tip: string): boolean {
  return TOGG_UYUMLU.some((t) => tip.includes(t));
}

function durumRenk(durum: "acik" | "kapali" | "bilinmiyor") {
  if (durum === "acik") return { bg: "bg-emerald-500", text: "text-emerald-400", label: "Aktif" };
  if (durum === "kapali") return { bg: "bg-red-500", text: "text-red-400", label: "Pasif" };
  return { bg: "bg-yellow-500", text: "text-yellow-400", label: "Bilinmiyor" };
}

function formatTarih(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

// ─── Filtre pill bileşeni ─────────────────────────────────────────────────────
function Pill({
  active,
  onClick,
  dot,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
        active
          ? "bg-white text-black"
          : "bg-white/8 text-neutral-400 hover:bg-white/12 hover:text-white"
      }`}
    >
      {dot && (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: dot }}
        />
      )}
      {children}
    </button>
  );
}

// ─── Bağlantı satırı ─────────────────────────────────────────────────────────
function BaglantiSatiri({ b }: { b: Baglanti }) {
  const durum = durumRenk(b.durum);
  const isDC = b.tipSinifi === "dc";
  const uyumlu = toggUyumluMu(b.tip);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.03] p-3">
      {/* Tip ikonu */}
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isDC ? "bg-[var(--togg-red)]/15 text-[var(--togg-red)]" : "bg-blue-500/15 text-blue-400"
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isDC ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
          )}
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold text-white truncate">{b.tip}</span>
          {uyumlu && (
            <span className="rounded-full bg-[var(--togg-red)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--togg-red)]">
              Togg ✓
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          {b.gucKW && <span className="font-medium text-white/70">{b.gucKW} kW</span>}
          <span>{b.adet} soket</span>
          <span className={`flex items-center gap-1 ${durum.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${durum.bg}`} />
            {durum.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── İstasyon detay paneli ────────────────────────────────────────────────────
function IstasyonDetay({
  ist,
  onKapat,
}: {
  ist: Istasyon;
  onKapat: () => void;
}) {
  const op = OPERATOR[ist.operatorKey] || OPERATOR.diger;
  const durum = durumRenk(ist.durum);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-neutral-950">
      {/* Başlık */}
      <div className="flex items-start gap-3 border-b border-white/8 p-4">
        <div
          className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
          style={{ background: op.renk, boxShadow: `0 0 8px ${op.renk}60` }}
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold leading-snug text-white">{ist.ad}</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {ist.operator}
            {ist.sehir && <> · {ist.sehir}</>}
          </p>
        </div>
        <button
          onClick={onKapat}
          className="shrink-0 rounded-full p-1 text-neutral-500 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Adres + durum */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            {ist.adres && (
              <p className="text-xs text-neutral-400 truncate">{ist.adres}</p>
            )}
          </div>
          <span
            className={`ml-3 shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              ist.durum === "acik"
                ? "bg-emerald-500/15 text-emerald-400"
                : ist.durum === "kapali"
                ? "bg-red-500/15 text-red-400"
                : "bg-yellow-500/15 text-yellow-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${durum.bg}`} />
            {durum.label}
          </span>
        </div>

        {/* Güç özeti */}
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/6 bg-white/[0.02] p-3">
          <div className="text-center">
            <p className="text-lg font-bold">{ist.maxKW > 0 ? `${ist.maxKW}` : "—"}</p>
            <p className="text-[10px] text-neutral-500">Maks. kW</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">
              {ist.baglantilar.reduce((s, b) => s + b.adet, 0)}
            </p>
            <p className="text-[10px] text-neutral-500">Soket</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">
              {ist.hasDC ? "DC" : "AC"}
            </p>
            <p className="text-[10px] text-neutral-500">Şarj Tipi</p>
          </div>
        </div>

        {/* Bağlantılar */}
        {ist.baglantilar.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Bağlantılar
            </p>
            <div className="space-y-2">
              {ist.baglantilar.map((b, i) => (
                <BaglantiSatiri key={i} b={b} />
              ))}
            </div>
          </div>
        )}

        {/* Bilgi notu */}
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200/60">
          <p className="font-semibold text-yellow-200/80">ℹ Veri Kaynağı: OpenStreetMap</p>
          <p className="mt-1">
            Konum ve soket bilgisi OSM gönüllüleri tarafından güncellenmektedir.
            Gerçek zamanlı müsaitlik ve güncel fiyat için operatör uygulamasını kullanın.
          </p>
        </div>

        {/* Operatör aksiyonları */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Anlık Durum & Fiyat
          </p>
          <div className="space-y-2">
            {op.url && (
              <a
                href={op.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition-all hover:border-white/15 hover:bg-white/[0.06]"
              >
                <span>{op.yazi} Uygulaması →</span>
                <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {op.fiyatUrl && (
              <a
                href={op.fiyatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium text-neutral-400 transition-all hover:border-white/15 hover:text-white"
              >
                <span>Tarife & Fiyatlar →</span>
                <svg className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ANA BİLEŞEN ─────────────────────────────────────────────────────────────
export default function SarjHaritasiClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapStateRef = useRef<{ map: any; L: any } | null>(null);
  const markersRef = useRef<any[]>([]);

  const [mapReady, setMapReady] = useState(false);
  const [istasyonlar, setIstasyonlar] = useState<Istasyon[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);
  const [secili, setSecili] = useState<Istasyon | null>(null);
  const [filtreler, setFiltreler] = useState<Filtreler>({
    operator: "tumu",
    tip: "tumu",
    sadecAktif: false,
  });

  // ─── Veri çekme ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/sarj-istasyonlari")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data: Istasyon[]) => {
        setIstasyonlar(data);
        setYukleniyor(false);
      })
      .catch(() => {
        setHata(true);
        setYukleniyor(false);
      });
  }, []);

  // ─── Harita başlatma ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let active = true;

    import("leaflet").then((mod) => {
      if (!active || !containerRef.current || mapStateRef.current) return;
      const L = mod.default;

      const map = L.map(containerRef.current, {
        center: [39.0, 35.5],
        zoom: 6,
        zoomControl: false,
        preferCanvas: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/">CARTO</a> · <a href="https://www.openstreetmap.org/">OSM</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapStateRef.current = { map, L };
      setMapReady(true);
    });

    return () => {
      active = false;
      mapStateRef.current?.map.remove();
      mapStateRef.current = null;
      setMapReady(false);
    };
  }, []);

  // ─── Filtrelenmiş istasyonlar ────────────────────────────────────────────
  const filtreliIstasyonlar = useMemo(() => {
    return istasyonlar.filter((ist) => {
      if (filtreler.operator !== "tumu" && ist.operatorKey !== filtreler.operator)
        return false;
      if (filtreler.tip === "dc" && !ist.hasDC) return false;
      if (
        filtreler.tip === "ac" &&
        ist.baglantilar.length > 0 &&
        ist.baglantilar.every((b) => b.tipSinifi === "dc")
      )
        return false;
      if (filtreler.sadecAktif && ist.durum !== "acik") return false;
      return true;
    });
  }, [istasyonlar, filtreler]);

  // ─── Marker güncelleme ──────────────────────────────────────────────────────
  const setSeciliCallback = useCallback(
    (ist: Istasyon) => setSecili(ist),
    []
  );

  useEffect(() => {
    if (!mapReady || !mapStateRef.current) return;
    const { map, L } = mapStateRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filtreliIstasyonlar.forEach((ist) => {
      const op = OPERATOR[ist.operatorKey] || OPERATOR.diger;
      const radius = ist.maxKW >= 100 ? 9 : ist.maxKW >= 22 ? 7 : 5;
      const opacity = ist.durum === "kapali" ? 0.3 : ist.durum === "bilinmiyor" ? 0.75 : 0.95;

      const marker = L.circleMarker([ist.lat, ist.lng], {
        radius,
        fillColor: op.renk,
        color: "#fff",
        weight: 1.5,
        opacity: 0.8,
        fillOpacity: opacity,
      });

      marker.on("click", () => setSeciliCallback(ist));
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [mapReady, filtreliIstasyonlar, setSeciliCallback]);

  // ─── İstatistikler ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const tumBaglantilar = filtreliIstasyonlar.flatMap((i) => i.baglantilar);
    return {
      toplam: filtreliIstasyonlar.length,
      aktif: filtreliIstasyonlar.filter((i) => i.durum === "acik").length,
      dcSoket: tumBaglantilar
        .filter((b) => b.tipSinifi === "dc")
        .reduce((s, b) => s + b.adet, 0),
      acSoket: tumBaglantilar
        .filter((b) => b.tipSinifi === "ac")
        .reduce((s, b) => s + b.adet, 0),
    };
  }, [filtreliIstasyonlar]);

  // ─── Mevcut operatörler ────────────────────────────────────────────────────
  const mevcutOperatorler = useMemo(() => {
    const keys = new Set(istasyonlar.map((i) => i.operatorKey));
    const oncelik = ["trugo", "zes", "esarj", "beefull", "voltrun", "sharz", "tesla"];
    return oncelik.filter((k) => keys.has(k));
  }, [istasyonlar]);

  const setFiltre = (partial: Partial<Filtreler>) =>
    setFiltreler((prev) => ({ ...prev, ...partial }));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-neutral-950 text-white">

      {/* ── Filtre çubuğu ── */}
      <div className="absolute left-0 right-0 top-0 z-[1000] border-b border-white/8 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide">
          {/* Operatör filtreleri */}
          <Pill active={filtreler.operator === "tumu"} onClick={() => setFiltre({ operator: "tumu" })}>
            Tümü
          </Pill>
          {mevcutOperatorler.map((key) => {
            const op = OPERATOR[key];
            return (
              <Pill
                key={key}
                active={filtreler.operator === key}
                dot={op.renk}
                onClick={() => setFiltre({ operator: filtreler.operator === key ? "tumu" : key })}
              >
                {op.yazi}
              </Pill>
            );
          })}

          <div className="mx-1 h-4 w-px shrink-0 bg-white/15" />

          {/* Bağlantı tipi */}
          <Pill active={filtreler.tip === "tumu"} onClick={() => setFiltre({ tip: "tumu" })}>
            AC + DC
          </Pill>
          <Pill active={filtreler.tip === "dc"} onClick={() => setFiltre({ tip: filtreler.tip === "dc" ? "tumu" : "dc" })}>
            ⚡ DC Hızlı
          </Pill>
          <Pill active={filtreler.tip === "ac"} onClick={() => setFiltre({ tip: filtreler.tip === "ac" ? "tumu" : "ac" })}>
            🔌 AC
          </Pill>

          <div className="mx-1 h-4 w-px shrink-0 bg-white/15" />

          {/* Sadece aktif toggle */}
          <button
            onClick={() => setFiltre({ sadecAktif: !filtreler.sadecAktif })}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              filtreler.sadecAktif
                ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                : "bg-white/8 text-neutral-400 hover:bg-white/12"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${filtreler.sadecAktif ? "bg-emerald-500" : "bg-neutral-600"}`} />
            Sadece Aktif
          </button>
        </div>
      </div>

      {/* ── Harita ── */}
      <div
        ref={containerRef}
        className="h-full w-full flex-1"
        style={{ zIndex: 0 }}
      />

      {/* Leaflet CSS override — dark tema uyumu */}
      <style>{`
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.85) !important;
          color: rgba(0,0,0,0.5) !important;
          font-size: 9px !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #333 !important;
          border-color: rgba(0,0,0,0.15) !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;
        }
        .leaflet-control-zoom a:hover { background: #f5f5f5 !important; }
        .leaflet-bar { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
      `}</style>

      {/* ── İstasyon detay paneli (sağ) ── */}
      <div
        className={`absolute right-0 top-[41px] z-[999] h-[calc(100%-41px)] w-full max-w-[340px] transform border-l border-white/8 transition-transform duration-300 ease-out md:relative md:top-0 md:h-full md:translate-x-0 ${
          secili ? "translate-x-0" : "translate-x-full md:hidden"
        }`}
      >
        {secili ? (
          <IstasyonDetay ist={secili} onKapat={() => setSecili(null)} />
        ) : null}
      </div>

      {/* ── Alt istatistik rozeti ── */}
      <div className="absolute bottom-8 left-1/2 z-[1000] -translate-x-1/2 flex items-center gap-3 rounded-full border border-white/12 bg-black/85 px-4 py-2 text-xs backdrop-blur-md">
        {yukleniyor ? (
          <span className="flex items-center gap-2 text-neutral-500">
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            İstasyonlar yükleniyor...
          </span>
        ) : hata ? (
          <span className="text-red-400">Veri alınamadı. Sayfayı yenileyin.</span>
        ) : (
          <>
            <span className="font-semibold text-white">{stats.toplam}</span>
            <span className="text-neutral-500">istasyon</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="font-semibold text-emerald-400">{stats.aktif}</span>
            <span className="text-neutral-500">aktif</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="font-semibold text-[var(--togg-red)]">{stats.dcSoket}</span>
            <span className="text-neutral-500">DC</span>
            <span className="font-semibold text-blue-400">{stats.acSoket}</span>
            <span className="text-neutral-500">AC soket</span>
          </>
        )}
      </div>

      {/* ── Mobil seçim ipucu ── */}
      {!secili && !yukleniyor && !hata && (
        <div className="absolute bottom-20 left-1/2 z-[1000] -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-4 py-1.5 text-xs text-neutral-500 backdrop-blur-sm md:hidden">
          İstasyona tıklayarak detay görüntüleyin
        </div>
      )}

      {/* ── Renk açıklaması (legend) ── */}
      <div className="absolute bottom-8 right-4 z-[1000] hidden rounded-xl border border-white/8 bg-black/85 p-3 backdrop-blur-md md:block">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
          Güç Seviyesi
        </p>
        <div className="space-y-1.5">
          {[
            { label: "100+ kW (DC)", size: "h-[18px] w-[18px]", color: "#e8002d" },
            { label: "22–99 kW",    size: "h-[14px] w-[14px]", color: "#6b7280" },
            { label: "3–22 kW (AC)",size: "h-[10px] w-[10px]", color: "#6b7280" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div
                className={`${l.size} shrink-0 rounded-full border border-white/20`}
                style={{ background: l.color, opacity: 0.85 }}
              />
              <span className="text-[11px] text-neutral-400">{l.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-white/8 pt-2 text-[10px] text-neutral-600">
          Koyu = pasif / Parlak = aktif
        </div>
      </div>
    </div>
  );
}
