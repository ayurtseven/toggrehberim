"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  TUM_IKAZ_SEMBOLLERI,
  RENK_SINIF,
  ACILIYET_ETIKETLER,
  type IkazSembolu,
} from "@/lib/ikaz-sembolleri";

// ─── Tipler ──────────────────────────────────────────────────────────────────

interface IkazOverride {
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
}

interface FormVeri {
  ad: string;
  renk: string;
  aciliyet: string;
  model: string;
  kitapcik_aciklama: string;
  anlami: string;
  nedenler: string[];
  yapilacaklar: string[];
  not_metni: string;
  servis_gerekli: boolean;
  anahtar_kelimeler: string;
  gorsel_url: string;
}

const BOSH_FORM: FormVeri = {
  ad: "",
  renk: "sari",
  aciliyet: "dikkat",
  model: "hepsi",
  kitapcik_aciklama: "",
  anlami: "",
  nedenler: [""],
  yapilacaklar: [""],
  not_metni: "",
  servis_gerekli: false,
  anahtar_kelimeler: "",
  gorsel_url: "",
};

// ─── Liste Düzenleyici ────────────────────────────────────────────────────────

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/25"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-950/30"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="w-full rounded-lg border border-dashed border-white/15 py-1.5 text-xs text-slate-500 hover:border-white/30 hover:text-slate-400"
      >
        + Ekle
      </button>
    </div>
  );
}

// ─── Sembol Formu ─────────────────────────────────────────────────────────────

function SembolForm({
  sembolId,
  isCustom,
  baslangicVeri,
  onKaydet,
  onIptal,
  onSil,
}: {
  sembolId: string;
  isCustom: boolean;
  baslangicVeri: FormVeri;
  onKaydet: (sembolId: string, veri: FormVeri, isCustom: boolean) => Promise<void>;
  onIptal: () => void;
  onSil?: (sembolId: string) => Promise<void>;
}) {
  const [veri, setVeri] = useState<FormVeri>(baslangicVeri);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [gorselYukleniyor, setGorselYukleniyor] = useState(false);
  const gorselRef = useRef<HTMLInputElement>(null);

  const kaydet = async () => {
    setYukleniyor(true);
    setHata("");
    try {
      await onKaydet(sembolId, veri, isCustom);
    } catch (e: unknown) {
      setHata(e instanceof Error ? e.message : "Kayıt hatası");
    } finally {
      setYukleniyor(false);
    }
  };

  const gorselYukle = async (dosya: File) => {
    setGorselYukleniyor(true);
    const form = new FormData();
    form.append("gorsel", dosya);
    form.append("sembol_id", sembolId);
    const res = await fetch("/api/ikaz-gorsel", { method: "POST", body: form });
    const json = await res.json();
    if (json.url) {
      setVeri((v) => ({ ...v, gorsel_url: json.url }));
    } else {
      setHata(json.hata || "Görsel yüklenemedi");
    }
    setGorselYukleniyor(false);
  };

  return (
    <div className="rounded-2xl border border-blue-800/50 bg-blue-950/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-blue-300">
          {isCustom ? "✨ Yeni Sembol" : "✏️ Sembol Düzenle"}
        </h3>
        <span className="font-mono text-xs text-slate-500">{sembolId}</span>
      </div>

      {/* Sadece custom için: ad, renk, aciliyet, model */}
      {isCustom && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-400">Sembol Adı *</label>
            <input
              value={veri.ad}
              onChange={(e) => setVeri({ ...veri, ad: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              placeholder="ör. Ön Çarpışma Uyarısı"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">Renk *</label>
            <select
              value={veri.renk}
              onChange={(e) => setVeri({ ...veri, renk: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
            >
              {["kirmizi", "sari", "yesil", "mavi", "beyaz"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">Aciliyet *</label>
            <select
              value={veri.aciliyet}
              onChange={(e) => setVeri({ ...veri, aciliyet: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="hemen_dur">Hemen Dur</option>
              <option value="yakin_servis">Yakın Servis</option>
              <option value="dikkat">Dikkat</option>
              <option value="bilgi">Bilgi</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">Model</label>
            <select
              value={veri.model}
              onChange={(e) => setVeri({ ...veri, model: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="hepsi">Hepsi</option>
              <option value="t10x">T10X</option>
              <option value="t10f">T10F</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`servis-${sembolId}`}
              checked={veri.servis_gerekli}
              onChange={(e) => setVeri({ ...veri, servis_gerekli: e.target.checked })}
              className="h-4 w-4 accent-[var(--togg-red)]"
            />
            <label htmlFor={`servis-${sembolId}`} className="text-sm text-slate-300">
              Servis gerekli
            </label>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">Anahtar Kelimeler</label>
            <input
              value={veri.anahtar_kelimeler}
              onChange={(e) => setVeri({ ...veri, anahtar_kelimeler: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              placeholder="virgülle ayır: fren, abs, kayma"
            />
          </div>
        </div>
      )}

      {/* Görsel yükleme */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Sembol Görseli</label>
        <div className="flex items-center gap-3">
          {veri.gorsel_url && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900">
              <img src={veri.gorsel_url} alt="görsel" className="h-10 w-10 object-contain" />
            </div>
          )}
          <button
            type="button"
            onClick={() => gorselRef.current?.click()}
            disabled={gorselYukleniyor}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            {gorselYukleniyor ? "Yükleniyor..." : veri.gorsel_url ? "Değiştir" : "PNG/JPG Yükle"}
          </button>
          {veri.gorsel_url && (
            <input
              value={veri.gorsel_url}
              onChange={(e) => setVeri({ ...veri, gorsel_url: e.target.value })}
              className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 outline-none"
              placeholder="ya da URL yapıştır"
            />
          )}
          {!veri.gorsel_url && (
            <input
              value={veri.gorsel_url}
              onChange={(e) => setVeri({ ...veri, gorsel_url: e.target.value })}
              className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 outline-none"
              placeholder="veya URL yapıştır"
            />
          )}
        </div>
        <input
          ref={gorselRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) gorselYukle(f);
          }}
        />
      </div>

      {/* Kılavuz açıklaması */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">
          Kılavuz Açıklaması (resmi kısa metin)
        </label>
        <input
          value={veri.kitapcik_aciklama}
          onChange={(e) => setVeri({ ...veri, kitapcik_aciklama: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          placeholder="PDF'den alınan resmi kısa açıklama"
        />
      </div>

      {/* Detaylı anlam */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">
          Detaylı Açıklama *
        </label>
        <textarea
          value={veri.anlami}
          onChange={(e) => setVeri({ ...veri, anlami: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          placeholder="Sembolün ne anlama geldiği"
        />
      </div>

      {/* Nedenler */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Neden Yanar?</label>
        <ListEditor
          items={veri.nedenler}
          onChange={(items) => setVeri({ ...veri, nedenler: items })}
          placeholder="Neden..."
        />
      </div>

      {/* Yapılacaklar */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Ne Yapmalısın?</label>
        <ListEditor
          items={veri.yapilacaklar}
          onChange={(items) => setVeri({ ...veri, yapilacaklar: items })}
          placeholder="Adım..."
        />
      </div>

      {/* Not */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Not (isteğe bağlı)</label>
        <textarea
          value={veri.not_metni}
          onChange={(e) => setVeri({ ...veri, not_metni: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          placeholder="Özel uyarı veya ek bilgi..."
        />
      </div>

      {hata && <p className="text-sm text-red-400">⚠️ {hata}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={kaydet}
          disabled={yukleniyor}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "💾 Kaydet"}
        </button>
        <button
          type="button"
          onClick={onIptal}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
        >
          İptal
        </button>
        {onSil && (
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Bu override silinsin mi? Mevcut semboller için orijinal değerler geri döner.")) return;
              setYukleniyor(true);
              try { await onSil(sembolId); } finally { setYukleniyor(false); }
            }}
            className="rounded-xl border border-red-800 px-3 py-2.5 text-sm text-red-400 hover:bg-red-950/30"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function AdminIkazlarPage() {
  const [overrides, setOverrides] = useState<Record<string, IkazOverride>>({});
  const [yukleniyor, setYukleniyor] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [yeniForm, setYeniForm] = useState(false);
  const [yeniSembolId, setYeniSembolId] = useState("");
  const [filtre, setFiltre] = useState("");
  const [basari, setBasari] = useState<string | null>(null);

  const overrideYukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const data: IkazOverride[] = await fetch("/api/ikaz-duzenle").then((r) => r.json());
      const map: Record<string, IkazOverride> = {};
      for (const o of data) map[o.sembol_id] = o;
      setOverrides(map);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => { overrideYukle(); }, [overrideYukle]);

  const kaydet = useCallback(
    async (sembolId: string, veri: FormVeri, isCustom: boolean) => {
      const body = {
        sembol_id: sembolId,
        kitapcik_aciklama: veri.kitapcik_aciklama || undefined,
        anlami: veri.anlami || undefined,
        nedenler: veri.nedenler.filter(Boolean),
        yapilacaklar: veri.yapilacaklar.filter(Boolean),
        not_metni: veri.not_metni || undefined,
        ...(isCustom && {
          ad: veri.ad,
          renk: veri.renk,
          aciliyet: veri.aciliyet,
          model: veri.model,
          servis_gerekli: veri.servis_gerekli,
          gorsel_url: veri.gorsel_url || undefined,
          anahtar_kelimeler: veri.anahtar_kelimeler
            ? veri.anahtar_kelimeler.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          is_custom: true,
        }),
        ...(!isCustom && veri.gorsel_url && { gorsel_url: veri.gorsel_url }),
      };

      const res = await fetch("/api/ikaz-duzenle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.hata || "Kayıt hatası");
      }

      await overrideYukle();
      setEditId(null);
      setYeniForm(false);
      setYeniSembolId("");
      setBasari(`"${sembolId}" kaydedildi`);
      setTimeout(() => setBasari(null), 3000);
    },
    [overrideYukle]
  );

  const sil = useCallback(
    async (sembolId: string) => {
      const res = await fetch("/api/ikaz-duzenle", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sembol_id: sembolId }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.hata || "Silme hatası");
      }
      await overrideYukle();
      setEditId(null);
      setBasari(`"${sembolId}" override silindi`);
      setTimeout(() => setBasari(null), 3000);
    },
    [overrideYukle]
  );

  // Mevcut sembolleri + custom girişleri birleştir
  const customSemboller: IkazSembolu[] = Object.values(overrides)
    .filter((o) => o.is_custom)
    .map((o) => ({
      id: o.sembol_id,
      ad: o.ad ?? o.sembol_id,
      renk: (o.renk ?? "sari") as IkazSembolu["renk"],
      aciliyet: (o.aciliyet ?? "dikkat") as IkazSembolu["aciliyet"],
      model: (o.model ?? "hepsi") as IkazSembolu["model"],
      sembol_tanimi: "",
      gorsel: undefined,
      kitapcik_aciklama: o.kitapcik_aciklama ?? "",
      anlami: o.anlami ?? "",
      nedenler: o.nedenler ?? [],
      yapilacaklar: o.yapilacaklar ?? [],
      servis_gerekli: o.servis_gerekli ?? false,
      anahtar_kelimeler: o.anahtar_kelimeler ?? [],
    }));

  const tumSemboller = [...TUM_IKAZ_SEMBOLLERI, ...customSemboller];
  const filtrelenmis = filtre.trim()
    ? tumSemboller.filter(
        (s) =>
          s.ad.toLowerCase().includes(filtre.toLowerCase()) ||
          s.id.toLowerCase().includes(filtre.toLowerCase())
      )
    : tumSemboller;

  const formVeriOlustur = (sembol: IkazSembolu, override?: IkazOverride): FormVeri => ({
    ad: override?.ad ?? sembol.ad,
    renk: override?.renk ?? sembol.renk,
    aciliyet: override?.aciliyet ?? sembol.aciliyet,
    model: override?.model ?? sembol.model,
    kitapcik_aciklama: override?.kitapcik_aciklama ?? sembol.kitapcik_aciklama,
    anlami: override?.anlami ?? sembol.anlami,
    nedenler: override?.nedenler ?? sembol.nedenler,
    yapilacaklar: override?.yapilacaklar ?? sembol.yapilacaklar,
    not_metni: override?.not_metni ?? sembol.not ?? "",
    servis_gerekli: override?.servis_gerekli ?? sembol.servis_gerekli,
    anahtar_kelimeler: (override?.anahtar_kelimeler ?? sembol.anahtar_kelimeler ?? []).join(", "),
    gorsel_url: override?.gorsel_url ?? "",
  });

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">

        {/* Başlık */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-slate-500 hover:text-slate-300 text-sm">← Admin</Link>
              <span className="text-slate-700">/</span>
              <h1 className="text-2xl font-bold">İkaz Sembolleri</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {TUM_IKAZ_SEMBOLLERI.length} statik · {customSemboller.length} özel ·{" "}
              {Object.keys(overrides).filter((k) => !overrides[k].is_custom).length} override
            </p>
          </div>
          <button
            onClick={() => { setYeniForm(true); setEditId(null); }}
            className="rounded-xl bg-[var(--togg-red)] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
          >
            + Yeni Sembol Ekle
          </button>
        </div>

        {/* Başarı mesajı */}
        {basari && (
          <div className="mb-4 rounded-xl border border-emerald-700/50 bg-emerald-950/30 px-4 py-2.5 text-sm text-emerald-300">
            ✓ {basari}
          </div>
        )}

        {/* Yeni sembol formu */}
        {yeniForm && (
          <div className="mb-6">
            {!yeniSembolId ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                <h3 className="mb-3 font-bold">Yeni Sembol ID</h3>
                <p className="mb-3 text-sm text-slate-400">
                  Benzersiz bir slug gir (ör: <code className="text-slate-300">uc-nokta-sarlama</code>)
                </p>
                <div className="flex gap-2">
                  <input
                    value={yeniSembolId}
                    onChange={(e) => setYeniSembolId(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white font-mono outline-none focus:border-white/25"
                    placeholder="sembol-id-slug"
                    onKeyDown={(e) => e.key === "Enter" && yeniSembolId && setYeniSembolId(yeniSembolId)}
                  />
                  <button
                    onClick={() => { if (yeniSembolId) setYeniSembolId(yeniSembolId + "_confirm"); }}
                    disabled={!yeniSembolId || yeniSembolId.length < 3}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                  >
                    Devam →
                  </button>
                  <button
                    onClick={() => { setYeniForm(false); setYeniSembolId(""); }}
                    className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 hover:text-white"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <SembolForm
                sembolId={yeniSembolId.replace("_confirm", "")}
                isCustom={true}
                baslangicVeri={{ ...BOSH_FORM }}
                onKaydet={kaydet}
                onIptal={() => { setYeniForm(false); setYeniSembolId(""); }}
              />
            )}
          </div>
        )}

        {/* Arama */}
        <div className="mb-4">
          <input
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            placeholder="Sembol ara (ad veya ID)..."
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        {/* Sembol listesi */}
        {yukleniyor ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtrelenmis.map((sembol) => {
              const override = overrides[sembol.id];
              const isEditing = editId === sembol.id;
              const isCustomEntry = !!override?.is_custom;
              const hasOverride = !!override && !isCustomEntry;
              const renkSinif = RENK_SINIF[sembol.renk];
              const aciliyetEtiket = ACILIYET_ETIKETLER[sembol.aciliyet];

              return (
                <div key={sembol.id}>
                  {/* Satır */}
                  <div
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                      isEditing
                        ? "border-blue-700/50 bg-blue-950/20"
                        : "border-white/8 bg-white/3 hover:bg-white/5"
                    }`}
                  >
                    {/* Görsel veya renk noktası */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900">
                      {(override?.gorsel_url || sembol.gorsel) ? (
                        <img
                          src={override?.gorsel_url || `/ikaz/${sembol.gorsel}`}
                          alt={sembol.ad}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <span className={`h-3 w-3 rounded-full ${renkSinif.text.replace("text-", "bg-")}`} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-200">{sembol.ad}</span>
                        {hasOverride && (
                          <span className="shrink-0 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">override</span>
                        )}
                        {isCustomEntry && (
                          <span className="shrink-0 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">özel</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs text-slate-600">{sembol.id}</span>
                        <span className={`text-xs ${renkSinif.text}`}>{sembol.renk}</span>
                      </div>
                    </div>

                    <span className="shrink-0 text-xs text-slate-500">{aciliyetEtiket}</span>

                    <button
                      onClick={() => setEditId(isEditing ? null : sembol.id)}
                      className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/8"
                    >
                      {isEditing ? "Kapat" : "Düzenle"}
                    </button>
                  </div>

                  {/* Edit formu */}
                  {isEditing && (
                    <div className="mt-1 ml-0">
                      <SembolForm
                        sembolId={sembol.id}
                        isCustom={isCustomEntry}
                        baslangicVeri={formVeriOlustur(sembol, override)}
                        onKaydet={kaydet}
                        onIptal={() => setEditId(null)}
                        onSil={override ? sil : undefined}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filtrelenmis.length === 0 && !yukleniyor && (
          <p className="py-12 text-center text-sm text-slate-500">Eşleşen sembol yok</p>
        )}
      </div>
    </div>
  );
}
