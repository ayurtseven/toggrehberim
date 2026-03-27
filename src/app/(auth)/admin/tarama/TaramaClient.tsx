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

interface AramaSonucu {
  baslik: string;
  url: string;
  ozet: string;
  icerik: string;
  kaynak: string;
  dil: "tr" | "en";
  puan: number;
  konu: string;
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

type Sekme = "ai-arama" | "youtube" | "rss" | "manuel" | "gecmis";

export default function TaramaClient({ gecmis: ilkGecmis }: { gecmis: TaramaListeSatiri[] }) {
  const [sekme, setSekme] = useState<Sekme>("ai-arama");

  // AI Arama state
  const [aramaKonu, setAramaKonu] = useState("");
  const [aramaYukleniyor, setAramaYukleniyor] = useState(false);
  const [aramaHata, setAramaHata] = useState("");
  const [aramaListesi, setAramaListesi] = useState<AramaSonucu[]>([]);
  const [aramaYapildi, setAramaYapildi] = useState(false);

  // YouTube state
  const [ytUrl, setYtUrl] = useState("");
  const [ytYukleniyor, setYtYukleniyor] = useState(false);
  const [ytHata, setYtHata] = useState("");

  // RSS state
  const [rssHaberler, setRssHaberler] = useState<{ baslik: string; url: string; ozet: string; tarih: string; kaynak_adi: string; kaynak_tur: string }[]>([]);
  const [rssYukleniyor, setRssYukleniyor] = useState(false);
  const [rssYapildi, setRssYapildi] = useState(false);

  // Manuel state
  const [manuelTur, setManuelTur] = useState<"url" | "metin">("url");
  const [manuelUrl, setManuelUrl] = useState("");
  const [manuelMetin, setManuelMetin] = useState("");
  const [manuelKaynakAdi, setManuelKaynakAdi] = useState("");

  // Ortak taslak üretme state
  const [yukleniyor, setYukleniyor] = useState(false);
  const [aktifUrl, setAktifUrl] = useState<string | null>(null);
  const [hata, setHata] = useState("");
  const [sonuc, setSonuc] = useState<TaramaSonucu | null>(null);
  const [gecmis, setGecmis] = useState(ilkGecmis);
  const [dosyaAdi, setDosyaAdi] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kaydetMesaj, setKaydetMesaj] = useState("");

  // ── AI Arama ──────────────────────────────────────────────────────────────
  async function aiAra() {
    setAramaYukleniyor(true);
    setAramaHata("");
    setAramaYapildi(false);
    try {
      const res = await fetch("/api/admin/tarama/ara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konu: aramaKonu.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setAramaHata(data.hata || "Arama başarısız"); return; }
      setAramaListesi(Array.isArray(data) ? data : []);
      setAramaYapildi(true);
    } finally {
      setAramaYukleniyor(false);
    }
  }

  // ── RSS Kaynakları ────────────────────────────────────────────────────────
  async function rssGetir() {
    setRssYukleniyor(true);
    try {
      const res = await fetch("/api/admin/tarama/kaynaklar");
      const data = await res.json();
      setRssHaberler(Array.isArray(data) ? data : []);
      setRssYapildi(true);
    } finally {
      setRssYukleniyor(false);
    }
  }

  // ── YouTube Analiz ────────────────────────────────────────────────────────
  async function ytAnaliz(e: React.FormEvent) {
    e.preventDefault();
    setYtHata("");
    setYtYukleniyor(true);
    setHata("");
    setSonuc(null);
    setKaydetMesaj("");
    try {
      const ytRes = await fetch("/api/admin/tarama/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl.trim() }),
      });
      const ytData = await ytRes.json();
      if (!ytRes.ok) { setYtHata(ytData.hata || "Hata"); return; }

      // DB'ye kaydet
      const taramaRes = await fetch("/api/admin/tarama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: ytData.video_url,
          metin: `BAŞLIK: ${ytData.baslik}\n\nMDX:\n${ytData.mdx}`,
          kaynak_tur: "youtube",
          kaynak_adi: "YouTube",
        }),
      });
      const taramaData = await taramaRes.json();
      if (taramaRes.ok) {
        setSonuc({ ...taramaData, mdx_taslak: ytData.mdx });
        setDosyaAdi(slugify(ytData.baslik));
        setGecmis((prev) => [{ ...taramaData }, ...prev]);
      } else {
        // DB kaydı başarısız olsa bile önizle
        setSonuc({
          id: 0,
          kaynak_url: ytData.video_url,
          kaynak_tur: "youtube",
          kaynak_adi: "YouTube",
          baslik: ytData.baslik,
          ozet: ytData.ozet,
          mdx_taslak: ytData.mdx,
          kategori: ytData.kategori,
          model: ytData.model,
          durum: "taslak",
          created_at: new Date().toISOString(),
        });
        setDosyaAdi(slugify(ytData.baslik));
      }
    } finally {
      setYtYukleniyor(false);
    }
  }

  // ── Manuel Tara ───────────────────────────────────────────────────────────
  async function manuelTara(e: React.FormEvent) {
    e.preventDefault();
    if (manuelTur === "url" && !manuelUrl.trim()) { setHata("URL gerekli"); return; }
    if (manuelTur === "metin" && !manuelMetin.trim()) { setHata("Metin gerekli"); return; }
    await taslakOlustur({
      url: manuelTur === "url" ? manuelUrl.trim() : undefined,
      metin: manuelTur === "metin" ? manuelMetin.trim() : undefined,
      kaynak_adi: manuelKaynakAdi.trim() || undefined,
      kaynak_tur: manuelTur === "url" ? "web" : "manuel",
    });
  }

  // ── Taslak Oluştur (URL/metin → DB) ─────────────────────────────────────
  async function taslakOlustur(input: { url?: string; metin?: string; kaynak_adi?: string; kaynak_tur: string }) {
    setHata("");
    setSonuc(null);
    setKaydetMesaj("");
    setYukleniyor(true);
    setAktifUrl(input.url || null);
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
      setAktifUrl(null);
    }
  }

  // ── Kaydet / Reddet ───────────────────────────────────────────────────────
  async function kaydet() {
    if (!sonuc || !sonuc.id) return;
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
    if (!id) return;
    await fetch(`/api/admin/tarama/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eylem: "reddet" }),
    });
    setGecmis((prev) => prev.map((g) => g.id === id ? { ...g, durum: "reddedildi" } : g));
    if (sonuc?.id === id) setSonuc((s) => s ? { ...s, durum: "reddedildi" } : s);
  }

  const SEKMELER: { id: Sekme; label: string }[] = [
    { id: "ai-arama", label: "🤖 AI Arama" },
    { id: "youtube", label: "▶️ YouTube" },
    { id: "rss", label: "📰 RSS" },
    { id: "manuel", label: "✍️ Manuel" },
    { id: "gecmis", label: `📋 Geçmiş (${gecmis.length})` },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

      {/* ── Sol panel ── */}
      <div className="space-y-4">
        {/* Sekmeler */}
        <div className="flex flex-wrap rounded-xl border border-white/10 bg-white/3 p-1 gap-1">
          {SEKMELER.map((s) => (
            <button
              key={s.id}
              onClick={() => setSekme(s.id)}
              className={`flex-1 min-w-[80px] rounded-lg py-2 text-xs font-semibold transition-all ${
                sekme === s.id ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── AI Arama ── */}
        {sekme === "ai-arama" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-white">AI Destekli Genel Arama</p>
              <p className="mb-3 text-xs text-slate-500">
                Togg haberleri, EV dünyası ve batarya teknolojileri — Türkçe + İngilizce kaynaklardan.
                Boş bırakırsan geniş tarama yapar, konu girerek daraltabilirsin.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aramaKonu}
                  onChange={(e) => setAramaKonu(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && aiAra()}
                  placeholder="Konu (ör: katı hal batarya, OTA güncelleme) — boş = genel tarama"
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
                />
                <button
                  onClick={aiAra}
                  disabled={aramaYukleniyor}
                  className="rounded-xl bg-[var(--togg-red)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                >
                  {aramaYukleniyor ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Tarıyor...
                    </span>
                  ) : "Tara"}
                </button>
              </div>
            </div>

            {aramaHata && <p className="text-sm text-red-400">{aramaHata}</p>}

            {aramaYapildi && aramaListesi.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-600">Uygun içerik bulunamadı.</p>
            )}

            {aramaListesi.length > 0 && (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {aramaListesi.map((h, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 leading-snug line-clamp-2">{h.baslik}</p>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{h.ozet}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${h.puan >= 7 ? "bg-emerald-500/15 text-emerald-400" : h.puan >= 5 ? "bg-yellow-500/15 text-yellow-400" : "bg-white/8 text-slate-500"}`}>
                          {h.puan}/10
                        </span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${h.dil === "en" ? "bg-blue-500/15 text-blue-400" : "bg-white/8 text-slate-500"}`}>
                          {h.dil === "en" ? "EN" : "TR"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">{h.kaynak} · {h.konu}</span>
                      <button
                        onClick={() => taslakOlustur({ url: h.url, kaynak_adi: h.kaynak, kaynak_tur: "web" })}
                        disabled={yukleniyor}
                        className="rounded-lg bg-[var(--togg-red)]/80 px-3 py-1 text-xs font-bold text-white transition hover:bg-[var(--togg-red)] disabled:opacity-40"
                      >
                        {yukleniyor && aktifUrl === h.url ? "Oluşturuyor..." : "Taslak Oluştur"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── YouTube ── */}
        {sekme === "youtube" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-white">YouTube Video Analizi</p>
              <p className="mb-3 text-xs text-slate-500">
                Video transkriptini çekip Claude ile özgün Türkçe içeriğe dönüştürür.
                Altyazısı olan videolarda çalışır (Togg, EV incelemeleri, batarya videoları).
              </p>
            </div>
            <form onSubmit={ytAnaliz} className="space-y-3">
              <input
                type="url"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25"
              />
              {ytHata && <p className="text-sm text-red-400">{ytHata}</p>}
              <button
                type="submit"
                disabled={ytYukleniyor || !ytUrl.trim()}
                className="w-full rounded-xl bg-[var(--togg-red)] py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {ytYukleniyor ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Transkript analiz ediliyor...
                  </span>
                ) : "Videoyu Analiz Et & Taslak Oluştur"}
              </button>
            </form>
          </div>
        )}

        {/* ── RSS ── */}
        {sekme === "rss" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-white">RSS Kaynak Taraması</p>
              <p className="mb-3 text-xs text-slate-500">
                ShiftDelete, Webtekno, Chip, DonanımHaber ve resmi Togg blogundaki son haberleri getirir.
              </p>
              {!rssYapildi && (
                <button
                  onClick={rssGetir}
                  disabled={rssYukleniyor}
                  className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  {rssYukleniyor ? "Yükleniyor..." : "Son Haberleri Getir"}
                </button>
              )}
            </div>
            {rssHaberler.length > 0 && (
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {rssHaberler.map((h, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug">{h.baslik}</p>
                      <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-slate-500">{h.kaynak_adi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">{h.tarih ? new Date(h.tarih).toLocaleDateString("tr-TR") : ""}</span>
                      <button
                        onClick={() => taslakOlustur({ url: h.url, kaynak_adi: h.kaynak_adi, kaynak_tur: h.kaynak_tur })}
                        disabled={yukleniyor}
                        className="rounded-lg bg-[var(--togg-red)]/80 px-3 py-1 text-xs font-bold text-white transition hover:bg-[var(--togg-red)] disabled:opacity-40"
                      >
                        {yukleniyor && aktifUrl === h.url ? "Oluşturuyor..." : "Taslak Oluştur"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Manuel ── */}
        {sekme === "manuel" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4">
            <div className="flex rounded-xl border border-white/10 bg-white/3 p-1 gap-1">
              {(["url", "metin"] as const).map((t) => (
                <button key={t} onClick={() => setManuelTur(t)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${manuelTur === t ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                  {t === "url" ? "🌐 URL" : "📋 Metin Yapıştır"}
                </button>
              ))}
            </div>
            <form onSubmit={manuelTara} className="space-y-3">
              {manuelTur === "url" ? (
                <input type="url" value={manuelUrl} onChange={(e) => setManuelUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25" />
              ) : (
                <textarea value={manuelMetin} onChange={(e) => setManuelMetin(e.target.value)}
                  placeholder="Tweet, forum yazısı, haber metni..."
                  rows={6}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25" />
              )}
              <input type="text" value={manuelKaynakAdi} onChange={(e) => setManuelKaynakAdi(e.target.value)}
                placeholder="Kaynak adı (ör: @togg_life, forum.togg.com.tr)"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25" />
              {hata && <p className="text-sm text-red-400">{hata}</p>}
              <button type="submit" disabled={yukleniyor}
                className="w-full rounded-xl bg-[var(--togg-red)] py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
                {yukleniyor ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Oluşturuyor...</span> : "Taslak Oluştur"}
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
                      <p className="text-sm font-medium text-slate-200 line-clamp-1">{g.baslik}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${DURUM_RENK[g.durum] ?? "bg-white/10 text-white"}`}>{g.durum}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${KAT_RENK[g.kategori] ?? "bg-white/8 text-slate-400"}`}>{g.kategori}</span>
                      <span className="text-[10px] text-slate-600">{g.kaynak_adi || g.kaynak_tur} · {new Date(g.created_at).toLocaleDateString("tr-TR")}</span>
                      {g.durum === "taslak" && (
                        <button onClick={() => reddet(g.id)} className="ml-auto text-[10px] text-slate-600 hover:text-red-400">Reddet</button>
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
        {yukleniyor || ytYukleniyor ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-slate-900">
            <div className="text-center">
              <span className="mx-auto mb-4 block h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--togg-red)]" />
              <p className="text-sm text-slate-400">AI içeriği analiz ediyor...</p>
            </div>
          </div>
        ) : sonuc ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 space-y-4 sticky top-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-white leading-snug">{sonuc.baslik}</h2>
                <p className="mt-1 text-sm text-slate-400">{sonuc.ozet}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${DURUM_RENK[sonuc.durum]}`}>{sonuc.durum}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${KAT_RENK[sonuc.kategori] ?? "bg-white/8 text-slate-400"}`}>{sonuc.kategori}</span>
              <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-400">{sonuc.model}</span>
              {sonuc.kaynak_adi && <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-500">{sonuc.kaynak_adi}</span>}
              {sonuc.kaynak_url && (
                <a href={sonuc.kaynak_url} target="_blank" rel="noopener noreferrer"
                  className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-500 hover:text-white">
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
            {sonuc.durum === "taslak" && sonuc.id > 0 && (
              <div className="space-y-2">
                <input type="text" value={dosyaAdi} onChange={(e) => setDosyaAdi(e.target.value)}
                  placeholder="dosya-adi (slug)"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/25 font-mono" />
                <div className="flex gap-2">
                  <button onClick={kaydet} disabled={kaydediliyor}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50">
                    {kaydediliyor ? "Kaydediliyor..." : "Taslak Olarak Kaydet"}
                  </button>
                  <button onClick={() => reddet(sonuc.id)}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400">
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
              <p className="text-sm">Taslak burada görünecek</p>
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
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
