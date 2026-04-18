"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import IkazDeneyimler from "@/app/(public)/ikaz/[id]/IkazDeneyimler";
import {
  TUM_IKAZ_SEMBOLLERI,
  RENK_SINIF,
  ACILIYET_ETIKETLER,
  ACILIYET_RENK,
  type IkazSembolu,
} from "@/lib/ikaz-sembolleri";
import { IKAZ_IKONU } from "@/lib/ikaz-ikonlar";
import type { IkazTanimaYaniti } from "@/app/api/ikaz-tanima/route";
import AracDurumu from "./AracDurumu";
import TriajSonuc from "./TriajSonuc";
import ManuelTriaj from "./ManuelTriaj";
import { DEFAULT_VEHICLE_STATE } from "@/lib/triage-types";
import type { VehicleState, TriageResult } from "@/lib/triage-types";
import { runRuleEngineById } from "@/lib/rule-engine";
import { logTriageCompleted, logTriageFallback } from "@/lib/analytics";

// ─── Tipler ─────────────────────────────────────────────────────────────────

type IkazOverride = {
  sembol_id: string;
  kitapcik_aciklama?: string;
  anlami?: string;
  nedenler?: string[];
  yapilacaklar?: string[];
  not_metni?: string;
  // Genişletilmiş alanlar
  ad?: string;
  renk?: string;
  aciliyet?: string;
  model?: string;
  servis_gerekli?: boolean;
  gorsel_url?: string;
  anahtar_kelimeler?: string[];
  is_custom?: boolean;
};

type EditVeri = {
  kitapcik_aciklama: string;
  anlami: string;
  nedenler: string[];
  yapilacaklar: string[];
  not_metni: string;
};

// ─── Alt bileşenler ─────────────────────────────────────────────────────────

function RenkBadge({ renk }: { renk: IkazSembolu["renk"] }) {
  const RENK_AD: Record<IkazSembolu["renk"], string> = {
    kirmizi: "Kırmızı",
    sari: "Sarı",
    yesil: "Yeşil",
    mavi: "Mavi",
    beyaz: "Beyaz",
  };
  const RENK_DOT: Record<IkazSembolu["renk"], string> = {
    kirmizi: "bg-red-500",
    sari: "bg-amber-400",
    yesil: "bg-green-500",
    mavi: "bg-blue-500",
    beyaz: "bg-neutral-300",
  };
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${RENK_DOT[renk]}`} />
      {RENK_AD[renk]}
    </span>
  );
}


// ─── Edit Formu ──────────────────────────────────────────────────────────────

/** textarea'yı içeriğe göre otomatik uzatır */
function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

/** Numbered list editör — yapılacaklar adımları için */
function SiralanmisListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
            {i + 1}
          </span>
          <textarea
            value={item}
            rows={1}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
              autoResize(e.target);
            }}
            onInput={(e) => autoResize(e.currentTarget)}
            className="flex-1 resize-none overflow-hidden rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none"
            placeholder={placeholder}
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-1.5 shrink-0 rounded-lg border border-red-500/20 p-1.5 text-red-500/70 hover:border-red-500/40 hover:text-red-400"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/15 py-2 text-xs text-slate-500 transition-colors hover:border-white/30 hover:text-slate-400"
      >
        <span className="mx-auto flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          Adım Ekle
        </span>
      </button>
    </div>
  );
}

/** Bullet list editör — nedenler için */
function BulletListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
          <textarea
            value={item}
            rows={1}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
              autoResize(e.target);
            }}
            onInput={(e) => autoResize(e.currentTarget)}
            className="flex-1 resize-none overflow-hidden rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none"
            placeholder={placeholder}
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="mt-1.5 shrink-0 rounded-lg border border-red-500/20 p-1.5 text-red-500/70 hover:border-red-500/40 hover:text-red-400"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/15 py-2 text-xs text-slate-500 transition-colors hover:border-white/30 hover:text-slate-400"
      >
        <span className="mx-auto flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          Neden Ekle
        </span>
      </button>
    </div>
  );
}

function IkazEditFormu({
  sembol,
  onKaydet,
  onIptal,
}: {
  sembol: IkazSembolu;
  onKaydet: (veri: EditVeri) => Promise<void>;
  onIptal: () => void;
}) {
  const [veri, setVeri] = useState<EditVeri>({
    kitapcik_aciklama: sembol.kitapcik_aciklama,
    anlami: sembol.anlami,
    nedenler: [...sembol.nedenler],
    yapilacaklar: [...sembol.yapilacaklar],
    not_metni: sembol.not ?? "",
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [aktifBolum, setAktifBolum] = useState<"aciklama" | "nedenler" | "yapilacaklar" | "not">("aciklama");

  const kaydet = async () => {
    setYukleniyor(true);
    setHata(null);
    try {
      await onKaydet(veri);
    } catch (e: unknown) {
      setHata(e instanceof Error ? e.message : "Kayıt hatası");
    } finally {
      setYukleniyor(false);
    }
  };

  const sekmeler: { id: typeof aktifBolum; label: string; count?: number }[] = [
    { id: "aciklama", label: "Açıklama" },
    { id: "nedenler", label: "Nedenler", count: veri.nedenler.length },
    { id: "yapilacaklar", label: "Yapılacaklar", count: veri.yapilacaklar.length },
    { id: "not", label: "Not" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-blue-500/20 bg-[#0a0f1e]">
      {/* Başlık */}
      <div className="flex items-center justify-between border-b border-white/8 bg-blue-950/30 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-sm">✏️</span>
          <div>
            <p className="text-sm font-bold text-blue-300">{sembol.ad}</p>
            <p className="font-mono text-[10px] text-blue-500/70">{sembol.id}</p>
          </div>
        </div>
        <button
          onClick={onIptal}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-500 transition-colors hover:border-white/25 hover:text-white"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>
      </div>

      {/* Sekme navigasyon */}
      <div className="flex border-b border-white/8 bg-slate-900/50">
        {sekmeler.map((s) => (
          <button
            key={s.id}
            onClick={() => setAktifBolum(s.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
              aktifBolum === s.id
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {s.label}
            {s.count !== undefined && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                aktifBolum === s.id ? "bg-blue-500/20 text-blue-300" : "bg-white/8 text-slate-500"
              }`}>
                {s.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* İçerik */}
      <div className="p-4">
        {aktifBolum === "aciklama" && (
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">📖 Kılavuz Açıklaması</label>
                <span className="text-[10px] text-slate-600">{veri.kitapcik_aciklama.length} karakter</span>
              </div>
              <textarea
                value={veri.kitapcik_aciklama}
                rows={2}
                onChange={(e) => { setVeri({ ...veri, kitapcik_aciklama: e.target.value }); autoResize(e.target); }}
                onInput={(e) => autoResize(e.currentTarget)}
                className="w-full resize-none overflow-hidden rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                placeholder="Togg kullanıcı el kitabındaki resmi açıklama..."
              />
              <p className="mt-1 text-[11px] text-slate-600">Togg el kitabındaki orijinal kısa tanım</p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">💬 Detaylı Anlam</label>
                <span className="text-[10px] text-slate-600">{veri.anlami.length} karakter</span>
              </div>
              <textarea
                value={veri.anlami}
                rows={6}
                onChange={(e) => { setVeri({ ...veri, anlami: e.target.value }); autoResize(e.target); }}
                onInput={(e) => autoResize(e.currentTarget)}
                className="w-full resize-none overflow-hidden rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm leading-relaxed text-white focus:border-blue-500/50 focus:outline-none"
                placeholder="Sembolün detaylı açıklaması..."
              />
              <p className="mt-1 text-[11px] text-slate-600">Paragraf için boş satır bırak (Enter × 2)</p>
            </div>
          </div>
        )}

        {aktifBolum === "nedenler" && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">⚡ Olası Nedenler</label>
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-slate-500">{veri.nedenler.length} madde</span>
            </div>
            <BulletListEditor
              items={veri.nedenler}
              onChange={(items) => setVeri({ ...veri, nedenler: items })}
              placeholder="Bu lambanın yanma nedeni..."
            />
          </div>
        )}

        {aktifBolum === "yapilacaklar" && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">✅ Yapılacaklar (sıralı)</label>
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-slate-500">{veri.yapilacaklar.length} adım</span>
            </div>
            <SiralanmisListEditor
              items={veri.yapilacaklar}
              onChange={(items) => setVeri({ ...veri, yapilacaklar: items })}
              placeholder="Kullanıcının yapması gereken adım..."
            />
          </div>
        )}

        {aktifBolum === "not" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">📌 Ek Not</label>
              <span className="text-[10px] text-slate-600">{veri.not_metni.length} karakter</span>
            </div>
            <textarea
              value={veri.not_metni}
              rows={4}
              onChange={(e) => { setVeri({ ...veri, not_metni: e.target.value }); autoResize(e.target); }}
              onInput={(e) => autoResize(e.currentTarget)}
              className="w-full resize-none overflow-hidden rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
              placeholder="Özel uyarı, istisna veya ek bilgi..."
            />
            <p className="mt-1 text-[11px] text-slate-600">Sarı kutuda gösterilir. Boş bırakılabilir.</p>
          </div>
        )}

        {hata && (
          <div className="mt-3 rounded-xl border border-red-500/20 bg-red-950/20 px-3 py-2">
            <p className="text-sm text-red-300">⚠️ {hata}</p>
          </div>
        )}
      </div>

      {/* Footer — kaydet / iptal */}
      <div className="flex gap-2 border-t border-white/8 bg-slate-900/50 px-4 py-3">
        <button
          onClick={kaydet}
          disabled={yukleniyor}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "💾 Kaydet"}
        </button>
        <button
          onClick={onIptal}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          İptal
        </button>
      </div>
    </div>
  );
}

// ─── Karşılaştırma Paneli ────────────────────────────────────────────────────

function KarsilastirmaPanel({
  onizleme,
  sonuc,
  semboller,
  onYanlis,
}: {
  onizleme: string;
  sonuc: NonNullable<IkazTanimaYaniti["sonuc"]>;
  semboller: IkazSembolu[];
  onYanlis: () => void;
}) {
  const eslesenSembol = sonuc.sembol_id
    ? semboller.find((s) => s.id === sonuc.sembol_id)
    : null;
  const IkonBileseni = eslesenSembol ? IKAZ_IKONU[eslesenSembol.id] : null;

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900 p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Görsel Karşılaştırma
      </p>
      <div className="flex items-start gap-3">
        {/* Kullanıcının fotoğrafı */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <p className="text-[11px] text-slate-500">Çektiğiniz Fotoğraf</p>
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black">
            <img
              src={onizleme}
              alt="Yüklenen görsel"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Ok */}
        <div className="mt-7 shrink-0 text-lg text-slate-600">→</div>

        {/* Eşleşen sembol */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <p className="text-[11px] text-slate-500">Eşleşen Sembol</p>
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-slate-950 p-2">
            {eslesenSembol?.gorsel ? (
              <img
                src={`/ikaz/${eslesenSembol.gorsel}`}
                alt={eslesenSembol.ad}
                className="h-full w-full object-contain"
              />
            ) : IkonBileseni ? (
              <IkonBileseni className="h-12 w-12 text-white/60" />
            ) : (
              <span className="text-xs text-slate-600">—</span>
            )}
          </div>
          {eslesenSembol && (
            <p className="text-center text-[11px] font-medium text-slate-400">
              {eslesenSembol.ad}
            </p>
          )}
        </div>
      </div>

      {/* Yanlış tespit butonu */}
      <button
        onClick={onYanlis}
        className="mt-3 w-full rounded-xl border border-white/10 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-white/25 hover:text-white"
      >
        🔄 Yanlış sembol — Manuel seç
      </button>
    </div>
  );
}

// ─── Detay Kartı ─────────────────────────────────────────────────────────────

// /ikaz/[id] sayfasıyla aynı dark-tema renk haritaları
const RENK_DARK_KART: Record<IkazSembolu["renk"], { border: string; bg: string; badge: string; text: string }> = {
  kirmizi: { border: "border-red-500/30",    bg: "bg-red-500/8",     badge: "bg-red-500/15 text-red-400",       text: "text-red-400"    },
  sari:    { border: "border-yellow-500/30", bg: "bg-yellow-500/8",  badge: "bg-yellow-500/15 text-yellow-400", text: "text-yellow-400" },
  mavi:    { border: "border-blue-500/30",   bg: "bg-blue-500/8",    badge: "bg-blue-500/15 text-blue-400",     text: "text-blue-400"   },
  yesil:   { border: "border-emerald-500/30",bg: "bg-emerald-500/8", badge: "bg-emerald-500/15 text-emerald-400",text: "text-emerald-400"},
  beyaz:   { border: "border-white/20",      bg: "bg-white/5",       badge: "bg-white/10 text-slate-300",       text: "text-white"      },
};

const ACILIYET_DARK_KART: Record<IkazSembolu["aciliyet"], { cls: string; label: string }> = {
  hemen_dur:    { cls: "bg-red-600 text-white",              label: "🚨 Hemen Dur!" },
  yakin_servis: { cls: "bg-orange-500 text-white",           label: "⚠️ Yakın Servise Git" },
  dikkat:       { cls: "bg-yellow-500/20 text-yellow-400",   label: "⚡ Dikkat Et" },
  bilgi:        { cls: "bg-blue-500/15 text-blue-400",       label: "ℹ️ Bilgi" },
};

function IkazDetayKarti({
  sembol,
  guven,
  ikazId,
  onDuzenle,
}: {
  sembol: IkazSembolu | IkazTanimaYaniti["sonuc"];
  guven?: "yuksek" | "orta" | "dusuk";
  ikazId?: string;
  onDuzenle?: (id: string) => void;
}) {
  const isDbSembol = sembol && "id" in sembol;

  const ad = isDbSembol ? (sembol as IkazSembolu).ad : (sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).ai_aciklama.ad;
  const renk = isDbSembol
    ? (sembol as IkazSembolu).renk
    : ((sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).ai_aciklama.renk as IkazSembolu["renk"]);
  const aciliyet = isDbSembol
    ? (sembol as IkazSembolu).aciliyet
    : ((sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).ai_aciklama.aciliyet as IkazSembolu["aciliyet"]);
  const anlami = isDbSembol
    ? (sembol as IkazSembolu).anlami
    : (sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).ai_aciklama.anlami;
  const nedenler = isDbSembol
    ? (sembol as IkazSembolu).nedenler
    : (sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).ai_aciklama.nedenler;
  const yapilacaklar = isDbSembol
    ? (sembol as IkazSembolu).yapilacaklar
    : (sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).ai_aciklama.yapilacaklar;
  const servis_gerekli = isDbSembol
    ? (sembol as IkazSembolu).servis_gerekli
    : (sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).ai_aciklama.servis_gerekli;
  const not = isDbSembol
    ? (sembol as IkazSembolu).not
    : (sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).ai_aciklama.not;
  const kitapcik_aciklama = isDbSembol
    ? (sembol as IkazSembolu).kitapcik_aciklama
    : undefined;
  const gorsel = isDbSembol
    ? (sembol as IkazSembolu).gorsel
    : (sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).sembol_id
      ? TUM_IKAZ_SEMBOLLERI.find((s) => s.id === (sembol as NonNullable<IkazTanimaYaniti["sonuc"]>).sembol_id)?.gorsel
      : undefined;

  const renkD = RENK_DARK_KART[renk] ?? RENK_DARK_KART["sari"];
  const aciliyetD = ACILIYET_DARK_KART[aciliyet] ?? ACILIYET_DARK_KART["dikkat"];

  return (
    <div className="space-y-4 text-white">
      {/* Başlık kartı — /ikaz/[id] ile aynı */}
      <div className={`rounded-2xl border p-6 ${renkD.border} ${renkD.bg}`}>
        {gorsel && (
          <div className="mb-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-3">
              <img src={`/ikaz/${gorsel}`} alt={ad} className="h-full w-full object-contain" />
            </div>
          </div>
        )}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${aciliyetD.cls}`}>
            {aciliyetD.label}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${renkD.badge}`}>
            {renk.charAt(0).toUpperCase() + renk.slice(1)} İkaz
          </span>
          {guven && (
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-400">
              Güven: {guven === "yuksek" ? "Yüksek ✓" : guven === "orta" ? "Orta" : "Düşük"}
            </span>
          )}
          {isDbSembol && onDuzenle && (
            <button
              onClick={() => onDuzenle((sembol as IkazSembolu).id)}
              className="ml-auto rounded-lg border border-white/15 px-2.5 py-1 text-xs font-medium text-slate-400 hover:border-white/30 hover:text-white transition-colors"
            >
              ✏️ Düzenle
            </button>
          )}
        </div>
        <h2 className={`text-2xl font-bold ${renkD.text}`}>{ad}</h2>
        {kitapcik_aciklama && (
          <div className="mt-2 rounded-lg border border-white/8 bg-black/20 px-3 py-2">
            <p className="text-xs font-semibold text-slate-500">📖 El Kitabı Tanımı</p>
            <p className="mt-0.5 text-sm italic text-slate-400">{kitapcik_aciklama}</p>
          </div>
        )}
        <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-300">{anlami}</p>
      </div>

      {/* Ne yapmalıyım */}
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
        <h3 className="mb-4 text-lg font-bold text-white">Ne Yapmalıyım?</h3>
        <ol className="space-y-3">
          {yapilacaklar.map((adim, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--togg-red)]/15 text-xs font-bold text-[var(--togg-red)]">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-slate-200">{adim}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Olası nedenler */}
      {nedenler.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <h3 className="mb-4 text-lg font-bold text-white">Olası Nedenler</h3>
          <ul className="space-y-2">
            {nedenler.map((neden, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                {neden}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Not */}
      {not && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-300">
            <span className="font-bold">Not: </span>{not}
          </p>
        </div>
      )}

      {/* Servis gerekli */}
      {servis_gerekli && (
        <div className="rounded-2xl border border-orange-500/25 bg-orange-500/8 p-4">
          <p className="text-sm font-semibold text-orange-400">
            🔧 Bu ikaz için yetkili Togg servisi gereklidir.
          </p>
        </div>
      )}

      {/* Acil bant */}
      {aciliyet === "hemen_dur" && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5">
          <span className="text-lg">🚨</span>
          <div>
            <p className="text-sm font-bold text-red-400">Acil durumda Togg Care&apos;i ara</p>
            <a href="tel:08502228644" className="text-sm font-bold text-white underline">
              0 850 222 86 44
            </a>
          </div>
        </div>
      )}

      {/* Kullanıcı deneyimleri */}
      {ikazId && <IkazDeneyimler ikazId={ikazId} />}
    </div>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────────

export default function IkazArama({ autoKamera = false }: { autoKamera?: boolean }) {
  const [aktifSekme, setAktifSekme] = useState<"foto" | "liste">("liste");
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<IkazTanimaYaniti["sonuc"] | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [aramaMetni, setAramaMetni] = useState("");
  const [secilenSembol, setSecilenSembol] = useState<IkazSembolu | null>(null);
  const [editSembolId, setEditSembolId] = useState<string | null>(null);
  const [vehicleState, setVehicleState] = useState<VehicleState>(DEFAULT_VEHICLE_STATE);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [manuelTriajAcik, setManuelTriajAcik] = useState(false);

  // Override sistemi
  const [semboller, setSemboller] = useState<IkazSembolu[]>(TUM_IKAZ_SEMBOLLERI);

  const dosyaInputRef = useRef<HTMLInputElement>(null);
  const kameraInputRef = useRef<HTMLInputElement>(null);

  // autoKamera: hero'dan ?kamera=ac ile gelince fotoğraf sekmesini aç ve kamerayı tetikle
  useEffect(() => {
    if (!autoKamera) return;
    setAktifSekme("foto");
    const timer = setTimeout(() => kameraInputRef.current?.click(), 400);
    return () => clearTimeout(timer);
  }, [autoKamera]);

  // Overrides + custom semboller yükle
  useEffect(() => {
    fetch("/api/ikaz-duzenle")
      .then((r) => r.json())
      .then((overrides: IkazOverride[]) => {
        if (!Array.isArray(overrides) || overrides.length === 0) return;
        const map = Object.fromEntries(overrides.map((o) => [o.sembol_id, o]));

        // Mevcut sembollere override uygula
        const temel = TUM_IKAZ_SEMBOLLERI.map((s) => {
          const o = map[s.id];
          if (!o || o.is_custom) return s;
          return {
            ...s,
            ...(o.kitapcik_aciklama !== undefined && { kitapcik_aciklama: o.kitapcik_aciklama }),
            ...(o.anlami !== undefined && { anlami: o.anlami }),
            ...(o.nedenler !== undefined && { nedenler: o.nedenler }),
            ...(o.yapilacaklar !== undefined && { yapilacaklar: o.yapilacaklar }),
            ...(o.not_metni !== undefined && { not: o.not_metni }),
            ...(o.gorsel_url !== undefined && { gorsel: o.gorsel_url }),
          };
        });

        // is_custom = true olan yeni girişleri ekle
        const customlar: IkazSembolu[] = overrides
          .filter((o) => o.is_custom)
          .map((o) => ({
            id: o.sembol_id,
            ad: o.ad ?? o.sembol_id,
            renk: (o.renk ?? "sari") as IkazSembolu["renk"],
            aciliyet: (o.aciliyet ?? "dikkat") as IkazSembolu["aciliyet"],
            model: (o.model ?? "hepsi") as IkazSembolu["model"],
            sembol_tanimi: "",
            gorsel: o.gorsel_url,
            kitapcik_aciklama: o.kitapcik_aciklama ?? "",
            anlami: o.anlami ?? "",
            nedenler: o.nedenler ?? [],
            yapilacaklar: o.yapilacaklar ?? [],
            servis_gerekli: o.servis_gerekli ?? false,
            not: o.not_metni,
            anahtar_kelimeler: o.anahtar_kelimeler ?? [],
          }));

        setSemboller([...temel, ...customlar]);
      })
      .catch(() => {
        // Tablo henüz oluşturulmamış olabilir, sessizce geç
      });
  }, []);

  // Fuse.js'i semboller güncellenince yeniden oluştur
  const fuse = useMemo(
    () =>
      new Fuse(semboller, {
        keys: [
          { name: "ad", weight: 0.5 },
          { name: "anahtar_kelimeler", weight: 0.35 },
          { name: "anlami", weight: 0.15 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [semboller]
  );

  const aramaFiltrelenmis = aramaMetni.trim()
    ? fuse.search(aramaMetni).map((r) => r.item)
    : semboller;

  const dosyaSec = useCallback((dosya: File) => {
    setSonuc(null);
    setHata(null);
    const url = URL.createObjectURL(dosya);
    setOnizleme(url);
  }, []);

  const gorselGonder = useCallback(async (dosya: File) => {
    setYukleniyor(true);
    setSonuc(null);
    setHata(null);

    try {
      const form = new FormData();
      form.append("gorsel", dosya);
      form.append("vehicleState", JSON.stringify(vehicleState));

      const res = await fetch("/api/ikaz-tanima", {
        method: "POST",
        body: form,
      });

      const veri: IkazTanimaYaniti = await res.json();

      if (!veri.basarili || !veri.sonuc) {
        setHata(veri.mesaj || "Bir hata oluştu.");
        return;
      }

      setSonuc(veri.sonuc);
      if (veri.triage) {
        setTriage(veri.triage);
        if (veri.triage.manualTriageRequired) {
          setManuelTriajAcik(true);
        }
        // Analytics
        if (veri.triage.manualTriageRequired) {
          logTriageFallback("CAMERA", false);
        } else {
          logTriageCompleted(
            "CAMERA",
            veri.triage.alertId ?? undefined,
            veri.triage.confidence,
            veri.triage.status,
            veri.triage.serviceRequired,
            false,
          );
        }
      }
    } catch {
      setHata("Ağ hatası. İnternet bağlantınızı kontrol edin.");
    } finally {
      setYukleniyor(false);
    }
  }, [vehicleState]);

  const handleDosyaDegisim = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const dosya = e.target.files?.[0];
      if (!dosya) return;
      dosyaSec(dosya);
      gorselGonder(dosya);
    },
    [dosyaSec, gorselGonder]
  );

  const handleSifirla = () => {
    setOnizleme(null);
    setSonuc(null);
    setHata(null);
    setTriage(null);
    setManuelTriajAcik(false);
    if (dosyaInputRef.current) dosyaInputRef.current.value = "";
    if (kameraInputRef.current) kameraInputRef.current.value = "";
  };

  // Edit: kaydet
  const handleKaydet = useCallback(
    async (sembolId: string, veri: EditVeri) => {
      const res = await fetch("/api/ikaz-duzenle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sembol_id: sembolId, ...veri }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.hata || "Kayıt hatası");
      }
      // Local state'i güncelle
      setSemboller((prev) =>
        prev.map((s) =>
          s.id === sembolId
            ? {
                ...s,
                kitapcik_aciklama: veri.kitapcik_aciklama,
                anlami: veri.anlami,
                nedenler: veri.nedenler,
                yapilacaklar: veri.yapilacaklar,
                not: veri.not_metni || undefined,
              }
            : s
        )
      );
      // secilenSembol'ü de güncelle
      setSecilenSembol((prev) =>
        prev?.id === sembolId
          ? {
              ...prev,
              kitapcik_aciklama: veri.kitapcik_aciklama,
              anlami: veri.anlami,
              nedenler: veri.nedenler,
              yapilacaklar: veri.yapilacaklar,
              not: veri.not_metni || undefined,
            }
          : prev
      );
      setEditSembolId(null);
    },
    []
  );

  const editSembol = editSembolId ? semboller.find((s) => s.id === editSembolId) : null;

  return (
    <div>
      {/* Sekme seçici */}
      <div className="mb-6 flex rounded-2xl border border-white/10 bg-slate-900 p-1">
        <button
          onClick={() => setAktifSekme("foto")}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            aktifSekme === "foto"
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          📸 Fotoğrafla Tanı
        </button>
        <button
          onClick={() => setAktifSekme("liste")}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            aktifSekme === "liste"
              ? "bg-slate-700 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          📋 Sembol Listesi
        </button>
      </div>

      {/* ── Fotoğrafla Tanıma Sekmesi ── */}
      {aktifSekme === "foto" && (
        <div>
          {!onizleme ? (
            <div className="mb-6">
              <AracDurumu value={vehicleState} onChange={setVehicleState} />
              <div className="rounded-2xl border-2 border-dashed border-white/15 bg-slate-900/50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--togg-red)] text-3xl text-white">
                  🔍
                </div>
                <h2 className="mb-2 text-lg font-bold">İkaz Lambasını Tanı</h2>
                <p className="mb-6 text-sm text-slate-500">
                  Dashboard'da gördüğün uyarı sembolünün fotoğrafını çek veya galerinden seç.
                  AI anında tanımlayıp açıklayacak.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => kameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--togg-red)] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    📷 Kamerayla Çek
                  </button>
                  <button
                    onClick={() => dosyaInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/15 bg-slate-900 px-6 py-3.5 text-sm font-bold transition-colors hover:bg-slate-800"
                  >
                    🖼️ Galeriden Seç
                  </button>
                </div>

                <input
                  ref={kameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleDosyaDegisim}
                />
                <input
                  ref={dosyaInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleDosyaDegisim}
                />

                <p className="mt-4 text-xs text-slate-500">
                  JPG, PNG veya WebP · Maks. 5 MB · Veriler sunucudan geçer, saklanmaz
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { ikon: "💡", ipucu: "Odaklanmış ve net fotoğraf çek" },
                  { ikon: "🌙", ipucu: "Karanlık gösterge paneli için flaş kullan" },
                  { ikon: "📐", ipucu: "Tek sembolü kareye al, tüm paneli çekme" },
                ].map((t) => (
                  <div
                    key={t.ipucu}
                    className="rounded-xl border border-white/10 p-3 text-center"
                  >
                    <div className="text-xl">{t.ikon}</div>
                    <p className="mt-1 text-xs text-slate-500">{t.ipucu}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900 p-3">
                <img
                  src={onizleme}
                  alt="Yüklenen görsel"
                  className="h-20 w-20 rounded-lg bg-black object-contain"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {yukleniyor ? "AI analiz ediyor..." : sonuc ? "Tanımlama tamamlandı" : "Beklenmedik durum"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {yukleniyor ? "Bu birkaç saniye sürebilir" : "Claude Haiku ile analiz edildi"}
                  </p>
                </div>
                <button
                  onClick={handleSifirla}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium hover:bg-slate-800"
                >
                  Yeni Ara
                </button>
              </div>

              {yukleniyor && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 py-12">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--togg-red)]" />
                  <p className="text-sm font-medium">AI sembolü analiz ediyor...</p>
                  <p className="mt-1 text-xs text-slate-500">Togg el kitabı bilgileriyle karşılaştırıyor</p>
                </div>
              )}

              {hata && !yukleniyor && (
                <div className="rounded-2xl border border-red-500/25 bg-red-950/20 p-5">
                  <p className="font-semibold text-red-300">⚠️ {hata}</p>
                  <button
                    onClick={handleSifirla}
                    className="mt-3 text-sm text-red-300 underline"
                  >
                    Tekrar dene
                  </button>
                </div>
              )}

              {sonuc && !yukleniyor && (
                <>
                  {!sonuc.tanindi ? (
                    <div className="rounded-2xl border border-yellow-500/20 bg-amber-950/20 p-5">
                      <p className="font-semibold text-amber-300">
                        🤔 Sembol tanımlanamadı
                      </p>
                      <p className="mt-1 text-sm text-amber-300">
                        Görsel bir dashboard uyarı sembolü içermiyor olabilir veya görüntü kalitesi yetersiz.
                        Daha yakın ve net bir fotoğraf dene ya da listeden ara.
                      </p>
                      <button
                        onClick={() => setAktifSekme("liste")}
                        className="mt-3 text-sm font-semibold text-amber-300 underline"
                      >
                        Listeden ara →
                      </button>
                    </div>
                  ) : (
                    <>
                      {onizleme && (
                        <KarsilastirmaPanel
                          onizleme={onizleme}
                          sonuc={sonuc}
                          semboller={semboller}
                          onYanlis={() => setManuelTriajAcik(true)}
                        />
                      )}
                      <IkazDetayKarti sembol={sonuc} guven={sonuc.guven} />
                    </>
                  )}
                </>
              )}

              {/* Blueprint triage output */}
              {triage && !yukleniyor && !manuelTriajAcik && (
                <div className="mt-4">
                  <TriajSonuc
                    triage={triage}
                    onReset={handleSifirla}
                    onManualTriage={() => setManuelTriajAcik(true)}
                  />
                </div>
              )}

              {/* Manuel triage pathway */}
              {manuelTriajAcik && (
                <div className="mt-4">
                  <ManuelTriaj
                    semboller={semboller}
                    vehicleState={vehicleState}
                    fallbackMesaj={triage?.summary}
                    onSembolSec={(sembol) => {
                      const result = runRuleEngineById(sembol.id, semboller, vehicleState);
                      if (result) {
                        setTriage(result);
                        setManuelTriajAcik(false);
                        logTriageCompleted("MANUAL", sembol.id, result.confidence, result.status, result.serviceRequired, false);
                      } else {
                        setSecilenSembol(sembol);
                        setManuelTriajAcik(false);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sembol Listesi Sekmesi ── */}
      {aktifSekme === "liste" && (
        <div>
          {/* Arama kutusu */}
          <div className="mb-4">
            <input
              type="search"
              value={aramaMetni}
              onChange={(e) => {
                setAramaMetni(e.target.value);
                setSecilenSembol(null);
                setEditSembolId(null);
              }}
              placeholder="Sembol adı, rengi veya anahtar kelime ile ara..."
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none ring-0 transition focus:border-[var(--togg-red)] focus:ring-2 focus:ring-[var(--togg-red)]/20"
            />
          </div>

          {/* Sembol listesi */}
          {aramaFiltrelenmis.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Eşleşen sembol bulunamadı
            </p>
          ) : aramaMetni.trim() ? (
            <div className="space-y-2">
              {aramaFiltrelenmis.map((sembol) => (
                <div key={sembol.id}>
                  <SembolSatiri
                    sembol={sembol}
                    isSecili={secilenSembol?.id === sembol.id}
                    onClick={() => {
                      setSecilenSembol(secilenSembol?.id === sembol.id ? null : sembol);
                      setEditSembolId(null);
                    }}
                  />
                  {secilenSembol?.id === sembol.id && (
                    <div className="mt-2 mb-2">
                      {editSembol && editSembolId === sembol.id ? (
                        <IkazEditFormu
                          sembol={editSembol}
                          onKaydet={(veri) => handleKaydet(editSembol.id, veri)}
                          onIptal={() => setEditSembolId(null)}
                        />
                      ) : (
                        <IkazDetayKarti
                          sembol={sembol}
                          ikazId={sembol.id}
                          onDuzenle={(id) => setEditSembolId(id)}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {RENK_GRUPLARI.map((grup) => {
                const grupSemboller = semboller.filter((s) => s.renk === grup.renk);
                return (
                  <div key={grup.renk}>
                    <div className={`mb-3 flex items-center gap-2 rounded-xl border px-4 py-2.5 ${grup.baslikSinif}`}>
                      <span className={`h-3 w-3 shrink-0 rounded-full ${grup.dot}`} />
                      <span className="text-sm font-bold">{grup.baslik}</span>
                      <span className="ml-auto text-xs opacity-70">{grupSemboller.length} sembol</span>
                    </div>
                    <div className="space-y-2">
                      {grupSemboller.map((sembol) => (
                        <div key={sembol.id}>
                          <SembolSatiri
                            sembol={sembol}
                            isSecili={secilenSembol?.id === sembol.id}
                            onClick={() => {
                              setSecilenSembol(secilenSembol?.id === sembol.id ? null : sembol);
                              setEditSembolId(null);
                            }}
                          />
                          {secilenSembol?.id === sembol.id && (
                            <div className="mt-2 mb-2">
                              {editSembol && editSembolId === sembol.id ? (
                                <IkazEditFormu
                                  sembol={editSembol}
                                  onKaydet={(veri) => handleKaydet(editSembol.id, veri)}
                                  onIptal={() => setEditSembolId(null)}
                                />
                              ) : (
                                <IkazDetayKarti
                                  sembol={sembol}
                                  ikazId={sembol.id}
                                  onDuzenle={(id) => setEditSembolId(id)}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Yardımcı sabitler ───────────────────────────────────────────────────────

const RENK_GRUPLARI: {
  renk: IkazSembolu["renk"];
  baslik: string;
  baslikSinif: string;
  dot: string;
}[] = [
  {
    renk: "kirmizi",
    baslik: "Kırmızı İkazlar — Acil",
    baslikSinif: "border-red-500/20 bg-red-500/8 text-red-300",
    dot: "bg-red-500",
  },
  {
    renk: "sari",
    baslik: "Sarı Uyarılar — Dikkat",
    baslikSinif: "border-yellow-500/20 bg-yellow-500/8 text-yellow-300",
    dot: "bg-amber-400",
  },
  {
    renk: "yesil",
    baslik: "Yeşil — Bilgi",
    baslikSinif: "border-green-500/20 bg-green-500/8 text-green-300",
    dot: "bg-green-500",
  },
  {
    renk: "mavi",
    baslik: "Mavi — Bilgi / Aktif Sistem",
    baslikSinif: "border-blue-500/20 bg-blue-500/8 text-blue-300",
    dot: "bg-blue-500",
  },
  {
    renk: "beyaz",
    baslik: "Beyaz — Bekleme / Standby",
    baslikSinif: "border-white/10 bg-white/5 text-slate-300",
    dot: "bg-neutral-400",
  },
];

const RENK_DOT: Record<IkazSembolu["renk"], string> = {
  kirmizi: "bg-red-500",
  sari: "bg-amber-400",
  yesil: "bg-green-500",
  mavi: "bg-blue-500",
  beyaz: "bg-neutral-300",
};

function SembolSatiri({
  sembol,
  isSecili,
  onClick,
}: {
  sembol: IkazSembolu;
  isSecili: boolean;
  onClick: () => void;
}) {
  const renkSinif = RENK_SINIF[sembol.renk];
  const aciliyetRenk = ACILIYET_RENK[sembol.aciliyet];
  const IkonBileseni = IKAZ_IKONU[sembol.id];

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition-all hover:shadow-sm ${
        isSecili
          ? `${renkSinif.bg} ${renkSinif.border} ring-2 ring-offset-1`
          : "border-white/8 bg-slate-900 hover:border-white/15 hover:bg-slate-800/80"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950">
            {sembol.gorsel ? (
              <img src={`/ikaz/${sembol.gorsel}`} alt={sembol.ad} className="h-9 w-9 object-contain" />
            ) : IkonBileseni ? (
              <IkonBileseni className={`h-7 w-7 ${renkSinif.text}`} />
            ) : (
              <span className={`h-3 w-3 rounded-full ${RENK_DOT[sembol.renk]}`} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{sembol.ad}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{sembol.kitapcik_aciklama}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${aciliyetRenk}`}>
          {ACILIYET_ETIKETLER[sembol.aciliyet]}
        </span>
      </div>
    </button>
  );
}
