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
    <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${RENK_DOT[renk]}`} />
      {RENK_AD[renk]}
    </span>
  );
}

// ─── Liste Düzenleyici (nedenler / yapılacaklar için) ────────────────────────

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
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
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder={placeholder}
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="w-full rounded-lg border border-dashed border-neutral-300 py-1.5 text-xs text-neutral-400 hover:border-neutral-400 hover:text-neutral-500 dark:border-neutral-700"
      >
        + Ekle
      </button>
    </div>
  );
}

// ─── Edit Formu ──────────────────────────────────────────────────────────────

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

  return (
    <div className="space-y-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/20">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-blue-700 dark:text-blue-300">✏️ Sembol Düzenle</h3>
        <span className="text-xs text-blue-500">{sembol.id}</span>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          Kılavuz Açıklaması
        </label>
        <input
          value={veri.kitapcik_aciklama}
          onChange={(e) => setVeri({ ...veri, kitapcik_aciklama: e.target.value })}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          Anlam (detaylı)
        </label>
        <textarea
          value={veri.anlami}
          onChange={(e) => setVeri({ ...veri, anlami: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          Neden Yanar?
        </label>
        <ListEditor
          items={veri.nedenler}
          onChange={(items) => setVeri({ ...veri, nedenler: items })}
          placeholder="Neden..."
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          Ne Yapmalısın?
        </label>
        <ListEditor
          items={veri.yapilacaklar}
          onChange={(items) => setVeri({ ...veri, yapilacaklar: items })}
          placeholder="Yapılacak adım..."
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          Not (isteğe bağlı)
        </label>
        <textarea
          value={veri.not_metni}
          onChange={(e) => setVeri({ ...veri, not_metni: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Özel not..."
        />
      </div>

      {hata && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">⚠️ {hata}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={kaydet}
          disabled={yukleniyor}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "💾 Kaydet"}
        </button>
        <button
          onClick={onIptal}
          className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          İptal
        </button>
      </div>
    </div>
  );
}

// ─── Detay Kartı ─────────────────────────────────────────────────────────────

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

  const renkSinif = RENK_SINIF[renk] ?? RENK_SINIF["sari"];
  const aciliyetEtiket = ACILIYET_ETIKETLER[aciliyet] ?? "Dikkat";
  const aciliyetRenk = ACILIYET_RENK[aciliyet] ?? ACILIYET_RENK["dikkat"];

  return (
    <div className={`rounded-2xl border-2 p-6 ${renkSinif.bg} ${renkSinif.border}`}>
      {/* Sembol görseli */}
      {gorsel && (
        <div className="mb-5 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-950 p-3">
            <img src={`/ikaz/${gorsel}`} alt={ad} className="h-full w-full object-contain" />
          </div>
        </div>
      )}

      {/* Başlık */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <RenkBadge renk={renk} />
          <h2 className={`mt-1 text-xl font-bold ${renkSinif.text}`}>{ad}</h2>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`rounded-lg px-3 py-1 text-xs font-bold ${aciliyetRenk}`}>
            {aciliyetEtiket}
          </span>
          {guven && (
            <span className="text-xs text-neutral-400">
              Güven:{" "}
              {guven === "yuksek" ? "Yüksek ✓" : guven === "orta" ? "Orta" : "Düşük"}
            </span>
          )}
          {/* Düzenle butonu — sadece DB sembolleri için */}
          {isDbSembol && onDuzenle && (
            <button
              onClick={() => onDuzenle((sembol as IkazSembolu).id)}
              className="mt-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 hover:border-blue-300 hover:text-blue-600 dark:border-neutral-700 dark:hover:border-blue-700 dark:hover:text-blue-400"
            >
              ✏️ Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Kılavuz açıklaması + detaylı anlam */}
      <div className="mb-5 space-y-2">
        {kitapcik_aciklama && (
          <p className="text-sm font-semibold italic text-neutral-500 dark:text-neutral-400">
            📖 {kitapcik_aciklama}
          </p>
        )}
        <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">{anlami}</p>
      </div>

      {/* Nedenler + Yapılacaklar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400">
            <span>❓</span> Neden yanar?
          </h3>
          <ul className="space-y-1.5">
            {nedenler.map((neden, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="mt-0.5 shrink-0 text-neutral-400">•</span>
                {neden}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-neutral-600 dark:text-neutral-400">
            <span>✅</span> Ne yapmalısın?
          </h3>
          <ul className="space-y-1.5">
            {yapilacaklar.map((adim, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 shrink-0 font-bold ${renkSinif.text}`}>{i + 1}.</span>
                <span className="text-neutral-700 dark:text-neutral-300">{adim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Servis gerekli */}
      {servis_gerekli && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 dark:border-orange-800 dark:bg-orange-950/20">
          <span>🔧</span>
          <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
            Yetkili Togg servisi ziyareti gereklidir.
          </span>
        </div>
      )}

      {/* Not */}
      {not && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 dark:border-neutral-700 dark:bg-neutral-900/60">
          <span className="mt-0.5 shrink-0">💡</span>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{not}</p>
        </div>
      )}

      {/* Acil arama */}
      {aciliyet === "hemen_dur" && (
        <div className="mt-4 rounded-xl bg-red-600 px-4 py-3 text-white">
          <p className="text-sm font-bold">Togg Care Yol Yardım: 0 850 222 86 44</p>
          <p className="text-xs text-red-200">7/24 — ücretsiz yol yardımı</p>
        </div>
      )}

      {/* Kullanıcı deneyimleri */}
      {ikazId && <IkazDeneyimler ikazId={ikazId} />}
    </div>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────────

export default function IkazArama() {
  const [aktifSekme, setAktifSekme] = useState<"foto" | "liste">("liste");
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<IkazTanimaYaniti["sonuc"] | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [aramaMetni, setAramaMetni] = useState("");
  const [secilenSembol, setSecilenSembol] = useState<IkazSembolu | null>(null);
  const [editSembolId, setEditSembolId] = useState<string | null>(null);

  // Override sistemi
  const [semboller, setSemboller] = useState<IkazSembolu[]>(TUM_IKAZ_SEMBOLLERI);

  const dosyaInputRef = useRef<HTMLInputElement>(null);
  const kameraInputRef = useRef<HTMLInputElement>(null);

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
    } catch {
      setHata("Ağ hatası. İnternet bağlantınızı kontrol edin.");
    } finally {
      setYukleniyor(false);
    }
  }, []);

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
      <div className="mb-6 flex rounded-2xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={() => setAktifSekme("foto")}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            aktifSekme === "foto"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          📸 Fotoğrafla Tanı
        </button>
        <button
          onClick={() => setAktifSekme("liste")}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            aktifSekme === "liste"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
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
              <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--togg-red)] text-3xl text-white">
                  🔍
                </div>
                <h2 className="mb-2 text-lg font-bold">İkaz Lambasını Tanı</h2>
                <p className="mb-6 text-sm text-neutral-500">
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
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 bg-white px-6 py-3.5 text-sm font-bold transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
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

                <p className="mt-4 text-xs text-neutral-400">
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
                    className="rounded-xl border border-neutral-200 p-3 text-center dark:border-neutral-800"
                  >
                    <div className="text-xl">{t.ikon}</div>
                    <p className="mt-1 text-xs text-neutral-500">{t.ipucu}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                <img
                  src={onizleme}
                  alt="Yüklenen görsel"
                  className="h-20 w-20 rounded-lg bg-black object-contain"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {yukleniyor ? "AI analiz ediyor..." : sonuc ? "Tanımlama tamamlandı" : "Beklenmedik durum"}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {yukleniyor ? "Bu birkaç saniye sürebilir" : "Claude Haiku ile analiz edildi"}
                  </p>
                </div>
                <button
                  onClick={handleSifirla}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Yeni Ara
                </button>
              </div>

              {yukleniyor && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 py-12 dark:border-neutral-800 dark:bg-neutral-900/50">
                  <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[var(--togg-red)]" />
                  <p className="text-sm font-medium">AI sembolü analiz ediyor...</p>
                  <p className="mt-1 text-xs text-neutral-400">Togg el kitabı bilgileriyle karşılaştırıyor</p>
                </div>
              )}

              {hata && !yukleniyor && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/20">
                  <p className="font-semibold text-red-700 dark:text-red-300">⚠️ {hata}</p>
                  <button
                    onClick={handleSifirla}
                    className="mt-3 text-sm text-red-600 underline dark:text-red-400"
                  >
                    Tekrar dene
                  </button>
                </div>
              )}

              {sonuc && !yukleniyor && (
                <>
                  {!sonuc.tanindi ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
                      <p className="font-semibold text-amber-700 dark:text-amber-300">
                        🤔 Sembol tanımlanamadı
                      </p>
                      <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                        Görsel bir dashboard uyarı sembolü içermiyor olabilir veya görüntü kalitesi yetersiz.
                        Daha yakın ve net bir fotoğraf dene ya da listeden ara.
                      </p>
                      <button
                        onClick={() => setAktifSekme("liste")}
                        className="mt-3 text-sm font-semibold text-amber-700 underline dark:text-amber-300"
                      >
                        Listeden ara →
                      </button>
                    </div>
                  ) : (
                    <IkazDetayKarti sembol={sonuc} guven={sonuc.guven} />
                  )}
                </>
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
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-[var(--togg-red)] focus:ring-2 focus:ring-[var(--togg-red)]/20 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          {/* Sembol listesi */}
          {aramaFiltrelenmis.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">
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
    baslikSinif: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300",
    dot: "bg-red-500",
  },
  {
    renk: "sari",
    baslik: "Sarı Uyarılar — Dikkat",
    baslikSinif: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  {
    renk: "yesil",
    baslik: "Yeşil — Bilgi",
    baslikSinif: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300",
    dot: "bg-green-500",
  },
  {
    renk: "mavi",
    baslik: "Mavi — Bilgi / Aktif Sistem",
    baslikSinif: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  {
    renk: "beyaz",
    baslik: "Beyaz — Bekleme / Standby",
    baslikSinif: "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
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
          : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950 dark:border-neutral-600">
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
            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{sembol.kitapcik_aciklama}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${aciliyetRenk}`}>
          {ACILIYET_ETIKETLER[sembol.aciliyet]}
        </span>
      </div>
    </button>
  );
}
