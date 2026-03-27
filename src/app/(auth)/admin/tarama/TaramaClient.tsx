"use client";

import { useState, useEffect } from "react";
import type { RssHaber } from "@/app/api/admin/tarama/kaynaklar/route";

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

type Sekme = "otomatik" | "manuel" | "gecmis";

export default function TaramaClient({ gecmis: ilkGecmis }: { gecmis: TaramaListeSatiri[] }) {
  const [sekme, setSekme] = useState<Sekme>("otomatik");

  // Otomatik tarama state
  const [haberler, setHaberler] = useState<RssHaber[]>([]);
  const [rssYukleniyor, setRssYukleniyor] = useState(false);
  const [rssHata, setRssHata] = useState("");
  const [aramaQ, setAramaQ] = useState("");
  const [aramaTimeout, setAramaTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Manuel giriş state
  const [manuelTur, setManuelTur] = useState<"url" | "metin">("url");
  const [url, setUrl] = useState("");
  const [metin, setMetin] = useState("");
  const [kaynak_adi, setKaynak_adi] = useState("");

  // Taslak üretme state
  const [taranacak, setTaranacak] = useState<{ url?: string; metin?: string; kaynak_adi?: string; kaynak_tur: string } | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [sonuc, setSonuc] = useState<TaramaSonucu | null>(null);
  const [gecmis, setGecmis] = useState(ilkGecmis);
  const [dosyaAdi, setDosyaAdi] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kaydetMesaj, setKaydetMesaj] = useState("");

  // İlk yüklemede RSS çek
  useEffect(() => {
    rssGetir("");
  }, []);

  async function rssGetir(q: string) {
    setRssYukleniyor(true);
    setRssHata("");
    try {
      const res = await fetch(`/api/admin/tarama/kaynaklar${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      setHaberler(Array.isArray(data) ? data : []);
    } catch {
      setRssHata("Kaynaklar yüklenemedi.");
    } finally {
      setRssYukleniyor(false);
    }
  }

  function aramaGuncelle(val: string) {
    setAramaQ(val);
    if (aramaTimeout) clearTimeout(aramaTimeout);
    setAramaTimeout(setTimeout(() => rssGetir(val), 500));
  }

  async function taslakOlustur(input: typeof taranacak) {
    if (!input) return;
    setTaranacak(input);
    setHata("");
    setSonuc(null);
    setKaydetMesaj("");
    setYukleniyor(true);

    try {
      const res = await fetch("/api/admin/tarama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) { setHata(data.hata || "Hata oluştu"); return; }
      setSonuc(data);
      setDosyaAdi(slugify(data.baslik));
      setGecmis((prev) => [{ ...data }, ...prev]);
    } finally {
      setYukleniyor(false);
    }
  }

  async function manuelTara(e: React.FormEvent) {
    e.preventDefault();
    if (manuelTur === "url" && !url.trim()) { setHata("URL gerekli"); return; }
    if (manuelTur === "metin" && !metin.trim()) { setHata("Metin gerekli"); return; }
    await taslakOlustur({
      url: manuelTur === "url" ? url.trim() : undefined,
      metin: manuelTur === "metin" ? metin.trim() : undefined,
      kaynak_adi: kaynak_adi.trim() || undefined,
      kaynak_tur: manuelTur === "url" ? "web" : "manuel",
    });
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

      {/* ── Sol panel ── */}
      <div className="space-y-4">

        {/* Sekmeler */}
        <div className="flex rounded-xl border border-white/10 bg-white/3 p-1 gap-1">
          {([
            { id: "otomatik", label: "🔍 Otomatik Tara" },
            { id: "manuel", label: "✍️ Manuel Giriş" },
            { id: "gecmis", label: `📋 Geçmiş (${gecmis.length})` },
          ] as { id: Sekme; label: string }[]).map((s) => (
            <button
              key={s.id}
              onClick={() => setSekme(s.id)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                sekme === s.id
                  ? "bg-white/10 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Otomatik Tara ── */}
        {sekme === "otomatik" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
            <div>
              <p className="mb-3 text-sm text-slate-400">
                Togg haberlerini otomatik tarıyorum — ShiftDelete, Webtekno, Chip, DonanımHaber ve resmi Togg blogundan.
              </p>
              <input
                type="search"
                value={aramaQ}
                onChange={(e) => aramaGuncelle(e.target.value)}
                placeholder="Konu filtrele... (ör: şarj, güncelleme, bakım)"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
              />
            </div>

            {rssYukleniyor ? (
              <div className="flex items-center gap-3 py-8 justify-center text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Kaynaklar yükleniyor...
              </div>
            ) : rssHata ? (
              <p className="text-sm text-red-400">{rssHata}</p>
            ) : haberler.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-600">Sonuç bulunamadı.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {haberler.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-200 leading-snug line-clamp-2">{h.baslik}</p>
                      <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-slate-500">
                        {h.kaynak_adi}
                      </span>
                    </div>
                    {h.ozet && (
                      <p className="text-xs text-slate-500 line-clamp-2">{h.ozet}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">
                        {h.tarih ? new Date(h.tarih).toLocaleDateString("tr-TR") : ""}
                      </span>
                      <button
                        onClick={() => {
                          setSekme("otomatik");
                          taslakOlustur({ url: h.url, kaynak_adi: h.kaynak_adi, kaynak_tur: h.kaynak_tur });
                        }}
                        disabled={yukleniyor}
                        className="rounded-lg bg-[var(--togg-red)]/80 px-3 py-1 text-xs font-bold text-white transition hover:bg-[var(--togg-red)] disabled:opacity-40"
                      >
                        {yukleniyor && taranacak?.url === h.url ? "Tarıyor..." : "Taslak Oluştur"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Manuel Giriş ── */}
        {sekme === "manuel" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
            <div className="flex rounded-xl border border-white/10 bg-white/3 p-1 gap-1">
              {([
                { id: "url", label: "🌐 URL" },
                { id: "metin", label: "📋 Metin Yapıştır" },
              ] as { id: "url" | "metin"; label: string }[]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setManuelTur(t.id)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    manuelTur === t.id ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={manuelTara} className="space-y-3">
              {manuelTur === "url" ? (
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
                />
              ) : (
                <textarea
                  value={metin}
                  onChange={(e) => setMetin(e.target.value)}
                  placeholder="Tweet, forum yazısı veya haber metnini buraya yapıştır..."
                  rows={6}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
                />
              )}

              <input
                type="text"
                value={kaynak_adi}
                onChange={(e) => setKaynak_adi(e.target.value)}
                placeholder="Kaynak adı (ör: @togg_life, forum.togg.com.tr)"
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
                ) : "Taslak Oluştur"}
              </button>
            </form>
          </div>
        )}

        {/* ── Geçmiş ── */}
        {sekme === "gecmis" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            {gecmis.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-600">Henüz tarama yapılmamış.</p>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {gecmis.map((g) => (
                  <div key={g.id} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
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
        )}
      </div>

      {/* ── Sağ: Taslak Önizleme ── */}
      <div>
        {yukleniyor ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-slate-900">
            <div className="text-center">
              <span className="mx-auto mb-4 block h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--togg-red)]" />
              <p className="text-sm text-slate-400">AI içeriği analiz ediyor ve taslak oluşturuyor...</p>
            </div>
          </div>
        ) : sonuc ? (
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
              {sonuc.kaynak_url && (
                <a
                  href={sonuc.kaynak_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-500 hover:text-white"
                >
                  Kaynağa git ↗
                </a>
              )}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">MDX Taslak</p>
              <pre className="max-h-80 overflow-y-auto rounded-xl border border-white/8 bg-slate-950 p-4 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {sonuc.mdx_taslak}
              </pre>
            </div>

            {sonuc.durum === "taslak" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={dosyaAdi}
                  onChange={(e) => setDosyaAdi(e.target.value)}
                  placeholder="dosya-adi (slug)"
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
                {kaydetMesaj && <p className="text-sm text-emerald-400">{kaydetMesaj}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 text-slate-600">
            <div className="text-center">
              <p className="text-4xl mb-3">🤖</p>
              <p className="text-sm">Sol taraftan bir haber seç</p>
              <p className="text-xs mt-1">"Taslak Oluştur" butonuna tıkla</p>
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
