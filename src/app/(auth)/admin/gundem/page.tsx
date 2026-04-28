"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Tipler ──────────────────────────────────────────────────────────────────

interface GundemItem {
  id: string;
  title: string;
  platform: string;
  summary: string;
  link: string;
  severity: "low" | "medium" | "high";
  hafta_basi: string;
  aktif: boolean;
}

const BOSH_FORM = {
  title: "",
  platform: "Haber" as string,
  summary: "",
  link: "",
  severity: "medium" as "low" | "medium" | "high",
  hafta_basi: buHaftaninPazartesisi(),
  aktif: true,
};

function buHaftaninPazartesisi(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  return mon.toISOString().split("T")[0];
}

const SEVERITY_LABEL: Record<string, string> = {
  high: "🚨 Kritik",
  medium: "⚡ Önemli",
  low: "📌 Bilgi",
};

const SEVERITY_CLS: Record<string, string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-cyan-500/15 text-cyan-300",
  low: "bg-white/8 text-slate-400",
};

const PLATFORM_SECENEKLER = ["Haber", "Resmi", "Şikayet", "Forum", "Pazar"];

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function GundemAdminPage() {
  const [items, setItems] = useState<GundemItem[]>([]);
  const [hafta, setHafta] = useState(buHaftaninPazartesisi());
  const [yukleniyor, setYukleniyor] = useState(true);
  const [formAcik, setFormAcik] = useState(false);
  const [duzenleItem, setDuzenleItem] = useState<GundemItem | null>(null);
  const [form, setForm] = useState({ ...BOSH_FORM });
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    const res = await fetch(`/api/gundem?hafta=${hafta}`);
    const data = await res.json();
    // Severity sıralama: high > medium > low
    const sira: Record<string, number> = { high: 0, medium: 1, low: 2 };
    setItems((data as GundemItem[]).sort((a, b) => sira[a.severity] - sira[b.severity]));
    setYukleniyor(false);
  }, [hafta]);

  useEffect(() => { yukle(); }, [yukle]);

  function yeniForm() {
    setDuzenleItem(null);
    setForm({ ...BOSH_FORM, hafta_basi: hafta });
    setFormAcik(true);
  }

  function duzenleAc(item: GundemItem) {
    setDuzenleItem(item);
    setForm({
      title: item.title,
      platform: item.platform,
      summary: item.summary,
      link: item.link,
      severity: item.severity,
      hafta_basi: item.hafta_basi,
      aktif: item.aktif,
    });
    setFormAcik(true);
  }

  async function kaydet() {
    if (!form.title || !form.summary || !form.link || !form.hafta_basi) {
      setMesaj({ tip: "hata", metin: "Başlık, özet, link ve hafta zorunlu." });
      return;
    }
    setKaydediliyor(true);
    const body = duzenleItem ? { ...form, id: duzenleItem.id } : form;
    const res = await fetch("/api/gundem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.ok) {
      setMesaj({ tip: "ok", metin: duzenleItem ? "Güncellendi." : "Eklendi." });
      setFormAcik(false);
      yukle();
    } else {
      setMesaj({ tip: "hata", metin: json.hata ?? "Hata" });
    }
    setKaydediliyor(false);
  }

  async function tumunuAktifEt() {
    const pasifler = items.filter((i) => !i.aktif);
    if (pasifler.length === 0) return;
    await Promise.all(
      pasifler.map((item) =>
        fetch("/api/gundem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...item, aktif: true }),
        })
      )
    );
    setMesaj({ tip: "ok", metin: `${pasifler.length} öğe aktif edildi.` });
    yukle();
  }

  async function sil(id: string) {
    if (!confirm("Bu öğeyi silmek istediğine emin misin?")) return;
    const res = await fetch("/api/gundem", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.ok) { yukle(); }
    else { setMesaj({ tip: "hata", metin: json.hata ?? "Silinemedi" }); }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">

        {/* Başlık */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs text-slate-500 hover:text-slate-300">← Admin</Link>
            <h1 className="mt-1 text-xl font-bold">📡 Haftalık Gündem</h1>
          </div>
          <div className="flex gap-2">
            {items.some((i) => !i.aktif) && (
              <button
                onClick={tumunuAktifEt}
                className="rounded-xl border border-emerald-500/30 px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                ✓ Tümünü Yayınla
              </button>
            )}
            <button
              onClick={yeniForm}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-500 transition-colors"
            >
              + Yeni Ekle
            </button>
          </div>
        </div>

        {/* Hafta seçici */}
        <div className="mb-5 flex items-center gap-3">
          <label className="text-sm text-slate-400">Hafta (Pazartesi):</label>
          <input
            type="date"
            value={hafta}
            onChange={(e) => setHafta(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
          />
          <span className="text-xs text-slate-600">{items.length} öğe</span>
        </div>

        {/* Mesaj */}
        {mesaj && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${mesaj.tip === "ok" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
            {mesaj.metin}
            <button onClick={() => setMesaj(null)} className="ml-3 text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Form */}
        {formAcik && (
          <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-900 p-5">
            <h2 className="mb-4 text-sm font-bold text-cyan-400">
              {duzenleItem ? "Öğeyi Düzenle" : "Yeni Gündem Öğesi"}
            </h2>
            <div className="space-y-3">

              <div>
                <label className="mb-1 block text-xs text-slate-400">Başlık *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  placeholder="Haber başlığı..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Platform</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    {PLATFORM_SECENEKLER.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Önem</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as "low" | "medium" | "high" })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="high">🚨 Kritik</option>
                    <option value="medium">⚡ Önemli</option>
                    <option value="low">📌 Bilgi</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Hafta Başı *</label>
                  <input
                    type="date"
                    value={form.hafta_basi}
                    onChange={(e) => setForm({ ...form, hafta_basi: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Özet *</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  placeholder="Kısa açıklama..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Kaynak Link *</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aktif"
                  checked={form.aktif}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="aktif" className="text-sm text-slate-300">Aktif (sitede görünsün)</label>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={kaydet}
                disabled={kaydediliyor}
                className="rounded-xl bg-cyan-600 px-5 py-2 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
              >
                {kaydediliyor ? "Kaydediliyor…" : "Kaydet"}
              </button>
              <button
                onClick={() => setFormAcik(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Liste */}
        {yukleniyor ? (
          <p className="text-sm text-slate-500">Yükleniyor…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-slate-900/50 px-5 py-10 text-center">
            <p className="text-sm text-slate-500">Bu hafta için gündem öğesi yok.</p>
            <button onClick={yeniForm} className="mt-3 text-sm text-cyan-400 hover:underline">
              İlk öğeyi ekle →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-white/8 bg-slate-900 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SEVERITY_CLS[item.severity]}`}>
                      {SEVERITY_LABEL[item.severity]}
                    </span>
                    <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300">
                      {item.platform}
                    </span>
                    {!item.aktif && (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 line-through">
                        pasif
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.summary}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => duzenleAc(item)}
                    className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => sil(item.id)}
                    className="rounded-lg border border-red-500/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
