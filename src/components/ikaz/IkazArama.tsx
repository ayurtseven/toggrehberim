"use client";

import { useState, useEffect, useMemo } from "react";
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

// ─── Tipler ─────────────────────────────────────────────────────────────────

type IkazOverride = {
  sembol_id: string;
  kitapcik_aciklama?: string;
  anlami?: string;
  nedenler?: string[];
  yapilacaklar?: string[];
  not_metni?: string;
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

// ─── Renk haritaları ─────────────────────────────────────────────────────────

const RENK_DARK_KART: Record<IkazSembolu["renk"], { border: string; bg: string; badge: string; text: string }> = {
  kirmizi: { border: "border-red-500/30",    bg: "bg-red-500/8",     badge: "bg-red-500/15 text-red-400",       text: "text-red-400"    },
  sari:    { border: "border-yellow-500/30", bg: "bg-yellow-500/8",  badge: "bg-yellow-500/15 text-yellow-400", text: "text-yellow-400" },
  mavi:    { border: "border-blue-500/30",   bg: "bg-blue-500/8",    badge: "bg-blue-500/15 text-blue-400",     text: "text-blue-400"   },
  yesil:   { border: "border-emerald-500/30",bg: "bg-emerald-500/8", badge: "bg-emerald-500/15 text-emerald-400",text: "text-emerald-400"},
  beyaz:   { border: "border-white/20",      bg: "bg-white/5",       badge: "bg-white/10 text-slate-300",       text: "text-white"      },
};

const ACILIYET_DARK_KART: Record<IkazSembolu["aciliyet"], { cls: string; label: string }> = {
  hemen_dur:    { cls: "bg-red-600 text-white",            label: "🚨 Hemen Dur!" },
  yakin_servis: { cls: "bg-orange-500 text-white",         label: "⚠️ Yakın Servise Git" },
  dikkat:       { cls: "bg-yellow-500/20 text-yellow-400", label: "⚡ Dikkat Et" },
  bilgi:        { cls: "bg-blue-500/15 text-blue-400",     label: "ℹ️ Bilgi" },
};

const RENK_GRUPLARI: { renk: IkazSembolu["renk"]; baslik: string; baslikSinif: string; dot: string }[] = [
  { renk: "kirmizi", baslik: "Kırmızı İkazlar — Acil",         baslikSinif: "border-red-500/20 bg-red-500/8 text-red-300",       dot: "bg-red-500"    },
  { renk: "sari",    baslik: "Sarı Uyarılar — Dikkat",          baslikSinif: "border-yellow-500/20 bg-yellow-500/8 text-yellow-300",dot: "bg-amber-400" },
  { renk: "yesil",   baslik: "Yeşil — Bilgi",                   baslikSinif: "border-green-500/20 bg-green-500/8 text-green-300",  dot: "bg-green-500"  },
  { renk: "mavi",    baslik: "Mavi — Bilgi / Aktif Sistem",      baslikSinif: "border-blue-500/20 bg-blue-500/8 text-blue-300",    dot: "bg-blue-500"   },
  { renk: "beyaz",   baslik: "Beyaz — Bekleme / Standby",        baslikSinif: "border-white/10 bg-white/5 text-slate-300",         dot: "bg-neutral-400"},
];

const RENK_DOT: Record<IkazSembolu["renk"], string> = {
  kirmizi: "bg-red-500",
  sari:    "bg-amber-400",
  yesil:   "bg-green-500",
  mavi:    "bg-blue-500",
  beyaz:   "bg-neutral-300",
};

// ─── Liste Düzenleyici ───────────────────────────────────────────────────────

function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
            className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder:text-slate-600"
            placeholder={placeholder}
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg border border-red-500/25 px-2 py-1 text-xs text-red-500 hover:bg-red-950/20"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="w-full rounded-lg border border-dashed border-white/15 py-1.5 text-xs text-slate-500 hover:border-white/25 hover:text-slate-400"
      >
        + Ekle
      </button>
    </div>
  );
}

// ─── Edit Formu ──────────────────────────────────────────────────────────────

function IkazEditFormu({ sembol, onKaydet, onIptal }: { sembol: IkazSembolu; onKaydet: (veri: EditVeri) => Promise<void>; onIptal: () => void }) {
  const [veri, setVeri] = useState<EditVeri>({
    kitapcik_aciklama: sembol.kitapcik_aciklama,
    anlami: sembol.anlami,
    nedenler: [...sembol.nedenler],
    yapilacaklar: [...sembol.yapilacaklar],
    not_metni: sembol.not ?? "",
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const kaydet = async () => {
    setYukleniyor(true);
    setHata(null);
    try { await onKaydet(veri); }
    catch (e: unknown) { setHata(e instanceof Error ? e.message : "Kayıt hatası"); }
    finally { setYukleniyor(false); }
  };

  return (
    <div className="space-y-4 rounded-2xl border-2 border-blue-500/20 bg-blue-950/20 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-blue-300">✏️ Sembol Düzenle</h3>
        <span className="text-xs text-blue-500">{sembol.id}</span>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Kılavuz Açıklaması</label>
        <input value={veri.kitapcik_aciklama} onChange={(e) => setVeri({ ...veri, kitapcik_aciklama: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Anlam (detaylı)</label>
        <textarea value={veri.anlami} onChange={(e) => setVeri({ ...veri, anlami: e.target.value })} rows={3}
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Neden Yanar?</label>
        <ListEditor items={veri.nedenler} onChange={(items) => setVeri({ ...veri, nedenler: items })} placeholder="Neden..." />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Ne Yapmalısın?</label>
        <ListEditor items={veri.yapilacaklar} onChange={(items) => setVeri({ ...veri, yapilacaklar: items })} placeholder="Yapılacak adım..." />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Not (isteğe bağlı)</label>
        <textarea value={veri.not_metni} onChange={(e) => setVeri({ ...veri, not_metni: e.target.value })} rows={2}
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white" placeholder="Özel not..." />
      </div>
      {hata && <p className="text-sm font-medium text-red-300">⚠️ {hata}</p>}
      <div className="flex gap-2">
        <button onClick={kaydet} disabled={yukleniyor}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
          {yukleniyor ? "Kaydediliyor..." : "💾 Kaydet"}
        </button>
        <button onClick={onIptal} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-slate-800">
          İptal
        </button>
      </div>
    </div>
  );
}

// ─── Detay Kartı ─────────────────────────────────────────────────────────────

function IkazDetayKarti({ sembol, onDuzenle }: { sembol: IkazSembolu; onDuzenle?: (id: string) => void }) {
  const renkD = RENK_DARK_KART[sembol.renk] ?? RENK_DARK_KART["sari"];
  const aciliyetD = ACILIYET_DARK_KART[sembol.aciliyet] ?? ACILIYET_DARK_KART["dikkat"];

  return (
    <div className="space-y-4 text-white">
      <div className={`rounded-2xl border p-6 ${renkD.border} ${renkD.bg}`}>
        {sembol.gorsel && (
          <div className="mb-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-3">
              <img src={`/ikaz/${sembol.gorsel}`} alt={sembol.ad} className="h-full w-full object-contain" />
            </div>
          </div>
        )}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${aciliyetD.cls}`}>{aciliyetD.label}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${renkD.badge}`}>
            {sembol.renk.charAt(0).toUpperCase() + sembol.renk.slice(1)} İkaz
          </span>
          {onDuzenle && (
            <button onClick={() => onDuzenle(sembol.id)}
              className="ml-auto rounded-lg border border-white/15 px-2.5 py-1 text-xs font-medium text-slate-400 hover:border-white/30 hover:text-white transition-colors">
              ✏️ Düzenle
            </button>
          )}
        </div>
        <h2 className={`text-2xl font-bold ${renkD.text}`}>{sembol.ad}</h2>
        {sembol.kitapcik_aciklama && (
          <p className="mt-2 text-sm italic text-slate-500">📖 {sembol.kitapcik_aciklama}</p>
        )}
        <p className="mt-3 text-slate-300">{sembol.anlami}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
        <h3 className="mb-4 text-lg font-bold text-white">Ne Yapmalıyım?</h3>
        <ol className="space-y-3">
          {sembol.yapilacaklar.map((adim, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--togg-red)]/15 text-xs font-bold text-[var(--togg-red)]">{i + 1}</span>
              <span className="text-sm leading-relaxed text-slate-200">{adim}</span>
            </li>
          ))}
        </ol>
      </div>

      {sembol.nedenler.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <h3 className="mb-4 text-lg font-bold text-white">Olası Nedenler</h3>
          <ul className="space-y-2">
            {sembol.nedenler.map((neden, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                {neden}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sembol.not && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-300"><span className="font-bold">Not: </span>{sembol.not}</p>
        </div>
      )}

      {sembol.servis_gerekli && (
        <div className="rounded-2xl border border-orange-500/25 bg-orange-500/8 p-4">
          <p className="text-sm font-semibold text-orange-400">🔧 Bu ikaz için yetkili Togg servisi gereklidir.</p>
        </div>
      )}

      {sembol.aciliyet === "hemen_dur" && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3.5">
          <span className="text-lg">🚨</span>
          <div>
            <p className="text-sm font-bold text-red-400">Acil durumda Togg Care&apos;i ara</p>
            <a href="tel:08502228644" className="text-sm font-bold text-white underline">0 850 222 86 44</a>
          </div>
        </div>
      )}

      <IkazDeneyimler ikazId={sembol.id} />
    </div>
  );
}

// ─── Sembol Satırı ───────────────────────────────────────────────────────────

function SembolSatiri({ sembol, isSecili, onClick }: { sembol: IkazSembolu; isSecili: boolean; onClick: () => void }) {
  const renkSinif = RENK_SINIF[sembol.renk];
  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-xl border px-4 py-3 text-left transition-all ${
        isSecili ? `${renkSinif.border} ${renkSinif.bg}` : "border-white/8 bg-slate-900/60 hover:border-white/15 hover:bg-slate-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${RENK_DOT[sembol.renk]}`} />
        {sembol.gorsel ? (
          <img src={`/ikaz/${sembol.gorsel}`} alt="" className="h-7 w-7 shrink-0 object-contain opacity-90" />
        ) : (() => { const Ikon = IKAZ_IKONU[sembol.id]; return Ikon ? <Ikon className="h-7 w-7 shrink-0 text-slate-400" /> : <span className="text-base">⚠️</span>; })()}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${isSecili ? renkSinif.text : "text-slate-200 group-hover:text-white"}`}>
            {sembol.ad}
          </p>
          <p className="truncate text-xs text-slate-500">
            {ACILIYET_ETIKETLER[sembol.aciliyet]}
            {sembol.model !== "hepsi" && ` · ${sembol.model.toUpperCase()}`}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${ACILIYET_RENK[sembol.aciliyet]}`}>
          {ACILIYET_ETIKETLER[sembol.aciliyet]}
        </span>
        <svg className={`h-4 w-4 shrink-0 transition-transform ${isSecili ? "rotate-180 text-slate-400" : "text-slate-700 group-hover:text-slate-500"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function IkazArama() {
  const [aramaMetni, setAramaMetni] = useState("");
  const [secilenSembol, setSecilenSembol] = useState<IkazSembolu | null>(null);
  const [editSembolId, setEditSembolId] = useState<string | null>(null);
  const [semboller, setSemboller] = useState<IkazSembolu[]>(TUM_IKAZ_SEMBOLLERI);

  // Overrides + custom semboller yükle
  useEffect(() => {
    fetch("/api/ikaz-duzenle")
      .then((r) => r.json())
      .then((overrides: IkazOverride[]) => {
        if (!Array.isArray(overrides) || overrides.length === 0) return;
        const map = Object.fromEntries(overrides.map((o) => [o.sembol_id, o]));
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
        const customlar: IkazSembolu[] = overrides
          .filter((o) => o.is_custom)
          .map((o) => ({
            id: o.sembol_id, ad: o.ad ?? o.sembol_id,
            renk: (o.renk ?? "sari") as IkazSembolu["renk"],
            aciliyet: (o.aciliyet ?? "dikkat") as IkazSembolu["aciliyet"],
            model: (o.model ?? "hepsi") as IkazSembolu["model"],
            sembol_tanimi: "", gorsel: o.gorsel_url,
            kitapcik_aciklama: o.kitapcik_aciklama ?? "", anlami: o.anlami ?? "",
            nedenler: o.nedenler ?? [], yapilacaklar: o.yapilacaklar ?? [],
            servis_gerekli: o.servis_gerekli ?? false, not: o.not_metni,
            anahtar_kelimeler: o.anahtar_kelimeler ?? [],
          }));
        setSemboller([...temel, ...customlar]);
      })
      .catch(() => {});
  }, []);

  const fuse = useMemo(
    () => new Fuse(semboller, {
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

  const aramaFiltrelenmis = aramaMetni.trim() ? fuse.search(aramaMetni).map((r) => r.item) : semboller;

  const handleKaydet = async (sembolId: string, veri: EditVeri) => {
    const res = await fetch("/api/ikaz-duzenle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sembol_id: sembolId, ...veri }),
    });
    if (!res.ok) { const data = await res.json(); throw new Error(data.hata || "Kayıt hatası"); }
    setSemboller((prev) =>
      prev.map((s) => s.id === sembolId
        ? { ...s, kitapcik_aciklama: veri.kitapcik_aciklama, anlami: veri.anlami, nedenler: veri.nedenler, yapilacaklar: veri.yapilacaklar, not: veri.not_metni || undefined }
        : s)
    );
    setSecilenSembol((prev) =>
      prev?.id === sembolId
        ? { ...prev, kitapcik_aciklama: veri.kitapcik_aciklama, anlami: veri.anlami, nedenler: veri.nedenler, yapilacaklar: veri.yapilacaklar, not: veri.not_metni || undefined }
        : prev
    );
    setEditSembolId(null);
  };

  const editSembol = editSembolId ? semboller.find((s) => s.id === editSembolId) : null;

  return (
    <div>
      {/* Arama kutusu */}
      <div className="mb-6 relative">
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={aramaMetni}
          onChange={(e) => { setAramaMetni(e.target.value); setSecilenSembol(null); setEditSembolId(null); }}
          placeholder="Sembol adı, rengi veya anahtar kelime ile ara..."
          className="w-full rounded-xl border border-white/10 bg-slate-800 py-4 pl-12 pr-4 text-base text-white placeholder:text-slate-500 outline-none transition-colors focus:border-white/30"
          autoFocus
        />
      </div>

      {/* Sonuçlar */}
      {aramaFiltrelenmis.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Eşleşen sembol bulunamadı</p>
      ) : aramaMetni.trim() ? (
        <div className="space-y-2">
          <p className="mb-3 text-sm text-slate-500">{aramaFiltrelenmis.length} sonuç</p>
          {aramaFiltrelenmis.map((sembol) => (
            <div key={sembol.id}>
              <SembolSatiri
                sembol={sembol}
                isSecili={secilenSembol?.id === sembol.id}
                onClick={() => { setSecilenSembol(secilenSembol?.id === sembol.id ? null : sembol); setEditSembolId(null); }}
              />
              {secilenSembol?.id === sembol.id && (
                <div className="mt-2 mb-2">
                  {editSembol && editSembolId === sembol.id ? (
                    <IkazEditFormu sembol={editSembol} onKaydet={(veri) => handleKaydet(editSembol.id, veri)} onIptal={() => setEditSembolId(null)} />
                  ) : (
                    <IkazDetayKarti sembol={sembol} onDuzenle={(id) => setEditSembolId(id)} />
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
                        onClick={() => { setSecilenSembol(secilenSembol?.id === sembol.id ? null : sembol); setEditSembolId(null); }}
                      />
                      {secilenSembol?.id === sembol.id && (
                        <div className="mt-2 mb-2">
                          {editSembol && editSembolId === sembol.id ? (
                            <IkazEditFormu sembol={editSembol} onKaydet={(veri) => handleKaydet(editSembol.id, veri)} onIptal={() => setEditSembolId(null)} />
                          ) : (
                            <IkazDetayKarti sembol={sembol} onDuzenle={(id) => setEditSembolId(id)} />
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
  );
}
