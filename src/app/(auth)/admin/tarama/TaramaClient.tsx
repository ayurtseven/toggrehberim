"use client";

import { useState } from "react";

interface TaramaSonucu {
  id: number;
  kaynak_url: string | null;
  kaynak_tur: string;
  kaynak_adi: string | null;
  baslik: string;
  ozet: string;
  mdx_taslak: string;
  kategori: string;
  model: string;
  durum: string;
  created_at: string;
}

interface TaramaListeSatiri {
  id: number;
  kaynak_url: string | null;
  kaynak_tur: string;
  kaynak_adi: string | null;
  baslik: string;
  ozet: string;
  kategori: string;
  model: string;
  durum: string;
  created_at: string;
}

const KAYNAKLAR = [
  { tur: "web", ad: "Web Makalesi", ikon: "🌐", placeholder: "https://..." },
  { tur: "sosyal_medya", ad: "Sosyal Medya", ikon: "📱", placeholder: "Tweet, post veya paylaşım metnini yapıştır" },
  { tur: "forum", ad: "Forum / Reddit", ikon: "💬", placeholder: "https://forum.togg.com.tr/..." },
  { tur: "manuel", ad: "Manuel Metin", ikon: "✍️", placeholder: "Analiz edilmesini istediğin metni buraya yapıştır..." },
];

const DURUM_RENK: Record<string, string> = {
  taslak: "bg-yellow-500/15 text-yellow-400",
  kaydedildi: "bg-emerald-500/15 text-emerald-400",
  reddedildi: "bg-red-500/15 text-red-400",
};

const KAT_RENK: Record<string, string> = {
  sarj: "bg-blue-500/15 text-blue-400",
  yazilim: "bg-purple-500/15 text-purple-400",
  bakim: "bg-orange-500/15 text-orange-400",
  suruculuk: "bg-green-500/15 text-green-400",
  sss: "bg-slate-500/15 text-slate-400",
  haber: "bg-red-500/15 text-red-400",
};

export default function TaramaClient({ gecmis: ilkGecmis }: { gecmis: TaramaListeSatiri[] }) {
  const [seciliKaynak, setSeciliKaynak] = useState(KAYNAKLAR[0]);
  const [url, setUrl] = useState("");
  const [metin, setMetin] = useState("");
  const [kaynak_adi, setKaynak_adi] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [sonuc, setSonuc] = useState<TaramaSonucu | null>(null);
  const [gecmis, setGecmis] = useState(ilkGecmis);
  const [dosyaAdi, setDosyaAdi] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kaydetMesaj, setKaydetMesaj] = useState("");

  const urlTabanli = seciliKaynak.tur === "web" || seciliKaynak.tur === "forum";

  async function tara(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setSonuc(null);
    setKaydetMesaj("");

    if (urlTabanli && !url.trim()) { setHata("URL gerekli"); return; }
    if (!urlTabanli && !metin.trim()) { setHata("Metin gerekli"); return; }

    setYukleniyor(true);
    try {
      const res = await fetch("/api/admin/tarama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlTabanli ? url.trim() : undefined,
          metin: !urlTabanli ? metin.trim() : undefined,
          kaynak_tur: seciliKaynak.tur,
          kaynak_adi: kaynak_adi.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setHata(data.hata || "Hata oluştu"); return; }
      setSonuc(data);
      setDosyaAdi(slugify(data.baslik));
      // Geçmişe ekle
      setGecmis((prev) => [
        { ...data, mdx_taslak: undefined },
        ...prev,
      ]);
    } finally {
      setYukleniyor(false);
    }
  }

  async function kaydet() {
    if (!sonuc) return;
    setKaydediliyor(true);
    setKaydetMesaj("");
    const res = await fetch(`/api/admin/tarama/${sonuc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eylem: "kaydet", dosya_adi: dosyaAdi }),
    });
    const data = await res.json();
    if (res.ok) {
      setKaydetMesaj(`✓ Kaydedildi: ${data.dosya}`);
      setSonuc((s) => s ? { ...s, durum: "kaydedildi" } : s);
      setGecmis((prev) => prev.map((g) => g.id === sonuc.id ? { ...g, durum: "kaydedildi" } : g));
    } else {
      setKaydetMesaj(`⚠ ${data.hata}`);
    }
    setKaydediliyor(false);
  }

  async function reddet(id: number) {
    await fetch(`/api/admin/tarama/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eylem: "reddet" }),
    });
    setGecmis((prev) => prev.map((g) => g.id === id ? { ...g, durum: "reddedildi" } : g));
    if (sonuc?.id === id) setSonuc((s) => s ? { ...s, durum: "reddedildi" } : s);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

      {/* ── Sol: Form + Geçmiş ── */}
      <div className="space-y-6">

        {/* Kaynak seçici */}
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <h2 className="mb-4 font-semibold text-white">Kaynak Türü</h2>
          <div className="grid grid-cols-2 gap-2">
            {KAYNAKLAR.map((k) => (
              <button
                key={k.tur}
                onClick={() => { setSeciliKaynak(k); setUrl(""); setMetin(""); setHata(""); }}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                  seciliKaynak.tur === k.tur
                    ? "border-[var(--togg-red)]/40 bg-[var(--togg-red)]/10 text-white"
                    : "border-white/8 bg-white/3 text-slate-400 hover:border-white/15 hover:text-white"
                }`}
              >
                <span className="mr-2">{k.ikon}</span>
                {k.ad}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={tara} className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
          <h2 className="font-semibold text-white">{seciliKaynak.ikon} {seciliKaynak.ad} Tara</h2>

          {urlTabanli ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={seciliKaynak.placeholder}
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
            />
          ) : (
            <textarea
              value={metin}
              onChange={(e) => setMetin(e.target.value)}
              placeholder={seciliKaynak.placeholder}
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
            />
          )}

          <input
            type="text"
            value={kaynak_adi}
            onChange={(e) => setKaynak_adi(e.target.value)}
            placeholder="Kaynak adı (opsiyonel — ör: ShiftDelete, @togg_life)"
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
          />

          {hata && <p className="text-sm text-red-400">{hata}</p>}

          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full rounded-xl bg-[var(--togg-red)] py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {yukleniyor ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                AI taslak oluşturuyor...
              </span>
            ) : "Tara & Taslak Oluştur"}
          </button>
        </form>

        {/* Geçmiş */}
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <h2 className="mb-4 font-semibold text-white">Tarama Geçmişi ({gecmis.length})</h2>
          {gecmis.length === 0 ? (
            <p className="text-sm text-slate-600">Henüz tarama yapılmamış.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {gecmis.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-200 leading-snug line-clamp-1">{g.baslik}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${DURUM_RENK[g.durum] ?? "bg-white/10 text-white"}`}>
                      {g.durum}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${KAT_RENK[g.kategori] ?? "bg-white/8 text-slate-400"}`}>
                      {g.kategori}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {g.kaynak_adi || g.kaynak_tur} · {new Date(g.created_at).toLocaleDateString("tr-TR")}
                    </span>
                    {g.durum === "taslak" && (
                      <button
                        onClick={() => reddet(g.id)}
                        className="ml-auto text-[10px] text-slate-600 hover:text-red-400"
                      >
                        Reddet
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sağ: Taslak Önizleme ── */}
      <div>
        {sonuc ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4 sticky top-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-white leading-snug">{sonuc.baslik}</h2>
                <p className="mt-1 text-sm text-slate-400">{sonuc.ozet}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${DURUM_RENK[sonuc.durum]}`}>
                {sonuc.durum}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${KAT_RENK[sonuc.kategori] ?? "bg-white/8 text-slate-400"}`}>
                {sonuc.kategori}
              </span>
              <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-400">
                {sonuc.model}
              </span>
              {sonuc.kaynak_adi && (
                <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-500">
                  {sonuc.kaynak_adi}
                </span>
              )}
            </div>

            {/* MDX İçerik */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">MDX Taslak</p>
              <pre className="max-h-80 overflow-y-auto rounded-xl border border-white/8 bg-slate-950 p-4 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {sonuc.mdx_taslak}
              </pre>
            </div>

            {/* Kaydet */}
            {sonuc.durum === "taslak" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={dosyaAdi}
                  onChange={(e) => setDosyaAdi(e.target.value)}
                  placeholder="dosya-adi (slug formatında)"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25 font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={kaydet}
                    disabled={kaydediliyor}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {kaydediliyor ? "Kaydediliyor..." : "Taslak Olarak Kaydet"}
                  </button>
                  <button
                    onClick={() => reddet(sonuc.id)}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400"
                  >
                    Reddet
                  </button>
                </div>
                {kaydetMesaj && (
                  <p className="text-sm text-emerald-400">{kaydetMesaj}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 text-slate-600">
            <div className="text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">Tarama yap, burada önizle</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
