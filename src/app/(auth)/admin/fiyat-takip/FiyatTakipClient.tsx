"use client";

import { useState } from "react";

interface TarifeSatiri {
  id: string;
  fiyat: string | null;
  tarife_url: string | null;
  css_selector: string | null;
  son_otomatik_kontrol: string | null;
  otomatik_kontrol_sonucu: string | null;
  son_guncelleme: string | null;
}

interface GecmisKayit {
  id: number;
  tarife_id: string;
  eski_fiyat: string | null;
  yeni_fiyat: string;
  degisim_tarihi: string;
  kaynak: string;
}

const SONUC_ETIKET: Record<string, { label: string; renk: string }> = {
  guncellendi:          { label: "Güncellendi",          renk: "text-emerald-400 bg-emerald-500/10" },
  degismedi:            { label: "Değişmedi",            renk: "text-slate-400 bg-white/5" },
  hata:                 { label: "Hata",                 renk: "text-red-400 bg-red-500/10" },
  selector_bulunamadi:  { label: "Selector Bulunamadı",  renk: "text-yellow-400 bg-yellow-500/10" },
  url_yok:              { label: "URL Yok",              renk: "text-slate-600 bg-white/3" },
};

function durumBadge(sonuc: string | null) {
  if (!sonuc) return <span className="text-xs text-slate-700">—</span>;
  const s = SONUC_ETIKET[sonuc] ?? { label: sonuc, renk: "text-slate-500 bg-white/5" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.renk}`}>
      {s.label}
    </span>
  );
}

function tarihFormat(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

// ─── Satır düzenleme formu ────────────────────────────────────────────────────
function SatirForm({
  satir,
  onKaydet,
}: {
  satir: TarifeSatiri;
  onKaydet: (id: string, url: string, selector: string) => Promise<void>;
}) {
  const [url, setUrl] = useState(satir.tarife_url ?? "");
  const [selector, setSelector] = useState(satir.css_selector ?? "");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kaydet() {
    setYukleniyor(true);
    await onKaydet(satir.id, url, selector);
    setYukleniyor(false);
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/8 bg-slate-900 p-3">
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Tarife URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://operator.com/tarifeler"
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-white/25 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          CSS Selector (fiyat elementi)
        </label>
        <input
          type="text"
          value={selector}
          onChange={(e) => setSelector(e.target.value)}
          placeholder=".price-value, span.tarife-fiyat, ..."
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 font-mono text-xs text-white placeholder-slate-600 focus:border-white/25 focus:outline-none"
        />
        <p className="mt-1 text-[10px] text-slate-700">
          Tarayıcı DevTools → Inspect → elementi sağ tık → Copy selector
        </p>
      </div>
      <button
        onClick={kaydet}
        disabled={yukleniyor}
        className="w-full rounded-lg bg-white/8 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/12 disabled:opacity-50"
      >
        {yukleniyor ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function FiyatTakipClient({
  satirlar,
  gecmis,
}: {
  satirlar: TarifeSatiri[];
  gecmis: GecmisKayit[];
}) {
  const [liste, setListe] = useState<TarifeSatiri[]>(satirlar);
  const [gec, setGec] = useState<GecmisKayit[]>(gecmis);
  const [acikSatir, setAcikSatir] = useState<string | null>(null);
  const [cronCalisıyor, setCronCalisıyor] = useState(false);
  const [cronSonuc, setCronSonuc] = useState<string | null>(null);

  // URL + Selector kaydet
  async function kaydet(id: string, url: string, selector: string) {
    const res = await fetch("/api/admin/sarj-fiyatlari", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, tarife_url: url || null, css_selector: selector || null }),
    });
    if (res.ok) {
      setListe((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, tarife_url: url || null, css_selector: selector || null } : s
        )
      );
      setAcikSatir(null);
    }
  }

  // Manuel cron tetikle
  async function cronTetikle() {
    setCronCalisıyor(true);
    setCronSonuc(null);
    try {
      const res = await fetch("/api/admin/fiyat-kontrol", { method: "POST" });
      const json = await res.json();
      setCronSonuc(JSON.stringify(json, null, 2));

      // Tabloyu yenile
      const r2 = await fetch("/api/admin/sarj-fiyatlari");
      const yeni = await r2.json();
      setListe(yeni);

      // Geçmişi yenile
      const r3 = await fetch("/api/admin/fiyat-gecmisi");
      const yeniGec = await r3.json();
      setGec(yeniGec);
    } catch (e) {
      setCronSonuc(String(e));
    } finally {
      setCronCalisıyor(false);
    }
  }

  const urllu = liste.filter((s) => s.tarife_url).length;
  const selectorlu = liste.filter((s) => s.css_selector).length;

  return (
    <div className="space-y-8">
      {/* İstatistik bar */}
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-white/8 bg-slate-900 px-4 py-3 text-center">
          <p className="text-xl font-bold text-white">{liste.length}</p>
          <p className="text-[10px] text-slate-600">Toplam Satır</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-900 px-4 py-3 text-center">
          <p className="text-xl font-bold text-emerald-400">{urllu}</p>
          <p className="text-[10px] text-slate-600">URL Tanımlı</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-900 px-4 py-3 text-center">
          <p className="text-xl font-bold text-blue-400">{selectorlu}</p>
          <p className="text-[10px] text-slate-600">Selector Tanımlı</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-900 px-4 py-3 text-center">
          <p className="text-xl font-bold text-yellow-400">{gec.length}</p>
          <p className="text-[10px] text-slate-600">Geçmiş Değişim</p>
        </div>

        {/* Manuel tetikle */}
        <button
          onClick={cronTetikle}
          disabled={cronCalisıyor}
          className="ml-auto flex items-center gap-2 rounded-xl border border-[var(--togg-red)]/30 bg-[var(--togg-red)]/10 px-5 py-3 text-sm font-semibold text-[var(--togg-red)] transition hover:bg-[var(--togg-red)]/20 disabled:opacity-50"
        >
          {cronCalisıyor ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Kontrol Ediliyor…
            </>
          ) : (
            "Şimdi Kontrol Et"
          )}
        </button>
      </div>

      {/* Cron sonucu */}
      {cronSonuc && (
        <pre className="overflow-x-auto rounded-xl border border-white/8 bg-slate-900 p-4 text-xs text-slate-300">
          {cronSonuc}
        </pre>
      )}

      {/* Tarife satırları tablosu */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-600">
          Tarife Satırları
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[10px] uppercase tracking-widest text-slate-600">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Mevcut Fiyat</th>
                <th className="px-4 py-3 text-left">Son Kontrol</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3 text-left">Ayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {liste.map((s) => (
                <>
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{s.id}</td>
                    <td className="px-4 py-3 font-bold text-white">
                      {s.fiyat ?? "—"} <span className="text-xs font-normal text-slate-600">TL/kWh</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {tarihFormat(s.son_otomatik_kontrol)}
                    </td>
                    <td className="px-4 py-3">
                      {durumBadge(s.otomatik_kontrol_sonucu)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setAcikSatir(acikSatir === s.id ? null : s.id)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                          s.tarife_url && s.css_selector
                            ? "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "border border-white/10 text-slate-500 hover:text-white"
                        }`}
                      >
                        {s.tarife_url ? "Düzenle" : "Ayarla"}
                      </button>
                    </td>
                  </tr>
                  {acikSatir === s.id && (
                    <tr key={`form-${s.id}`}>
                      <td colSpan={5} className="px-4 pb-4 pt-1">
                        <SatirForm satir={s} onKaydet={kaydet} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Değişim geçmişi */}
      {gec.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-600">
            Değişim Geçmişi
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[10px] uppercase tracking-widest text-slate-600">
                  <th className="px-4 py-3 text-left">Tarih</th>
                  <th className="px-4 py-3 text-left">Tarife</th>
                  <th className="px-4 py-3 text-left">Eski</th>
                  <th className="px-4 py-3 text-left">Yeni</th>
                  <th className="px-4 py-3 text-left">Kaynak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {gec.map((g) => (
                  <tr key={g.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-slate-500">{tarihFormat(g.degisim_tarihi)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{g.tarife_id}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{g.eski_fiyat ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-400">{g.yeni_fiyat}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        g.kaynak === "otomatik"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-white/8 text-slate-400"
                      }`}>
                        {g.kaynak}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Açıklama */}
      <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-5 text-xs text-slate-600">
        <p className="mb-2 font-semibold text-slate-500">Nasıl çalışır?</p>
        <ol className="space-y-1.5 list-decimal list-inside">
          <li>Her tarife satırı için <strong className="text-slate-400">Ayarla</strong> butonuna tıkla → URL ve CSS Selector gir.</li>
          <li>CSS Selector: Tarayıcıda operatörün tarife sayfasını aç → Fiyat rakamına sağ tık → "İncele" → elementi kopyala.</li>
          <li>Cron her gün 08:00 (TR) saatinde otomatik çalışır, değişim varsa kayıt altına alır.</li>
          <li>Site JavaScript ile fiyat yüklüyorsa (SPA) Selector Bulunamadı hatası alırsın — o operatörü manuel takip etmen gerekir.</li>
          <li><strong className="text-slate-400">Şimdi Kontrol Et</strong> ile anında test edebilirsin.</li>
        </ol>
      </div>
    </div>
  );
}
