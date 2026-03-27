"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FavoriIstasyon } from "@/app/api/favori-istasyonlar/route";

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const DURUM_SECENEKLER: Array<{
  value: FavoriIstasyon["durum"];
  label: string;
  bg: string;
  text: string;
}> = [
  { value: "musait",     label: "Müsait",     bg: "bg-emerald-500/20 hover:bg-emerald-500/35", text: "text-emerald-400" },
  { value: "kismi",      label: "Kısmi",      bg: "bg-yellow-500/20  hover:bg-yellow-500/35",  text: "text-yellow-400"  },
  { value: "megul",      label: "Meşgul",     bg: "bg-red-500/20     hover:bg-red-500/35",     text: "text-red-400"     },
  { value: "kapali",     label: "Kapalı",     bg: "bg-neutral-700/40 hover:bg-neutral-700/60", text: "text-neutral-400" },
  { value: "bilinmiyor", label: "Bilinmiyor", bg: "bg-white/8        hover:bg-white/15",       text: "text-neutral-500" },
];

// ─── Durum güncelleme kartı ───────────────────────────────────────────────────
export function DurumGuncelleyici({ ist }: { ist: FavoriIstasyon }) {
  const router = useRouter();
  const [not, setNot] = useState(ist.durumNot || "");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "ok" | "hata"; metin: string } | null>(null);

  async function durumGuncelle(durum: FavoriIstasyon["durum"]) {
    setYukleniyor(true);
    setMesaj(null);
    try {
      const res = await fetch("/api/favori-istasyonlar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ist.id, durum, durumNot: not }),
      });
      if (!res.ok) throw new Error();
      setMesaj({ tip: "ok", metin: "Güncellendi ✓" });
      router.refresh();
    } catch {
      setMesaj({ tip: "hata", metin: "Güncelleme başarısız" });
    } finally {
      setYukleniyor(false);
      setTimeout(() => setMesaj(null), 3000);
    }
  }

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
        Durumu Güncelle
      </p>

      <div className="flex flex-wrap gap-2">
        {DURUM_SECENEKLER.map((s) => (
          <button
            key={s.value}
            onClick={() => durumGuncelle(s.value)}
            disabled={yukleniyor}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 ${s.bg} ${s.text} ${ist.durum === s.value ? "ring-1 ring-current" : ""}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={not}
        onChange={(e) => setNot(e.target.value)}
        placeholder='Not ekle (isteğe bağlı)  — ör. "2 soket boş, 2 dolu"'
        rows={2}
        className="w-full resize-none rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs text-neutral-300 placeholder:text-neutral-600 focus:border-white/25 focus:outline-none"
      />

      {mesaj && (
        <p className={`text-xs ${mesaj.tip === "ok" ? "text-emerald-400" : "text-red-400"}`}>
          {mesaj.metin}
        </p>
      )}
    </div>
  );
}

// ─── Silme butonu ─────────────────────────────────────────────────────────────
export function SilButonu({ id, ad }: { id: string; ad: string }) {
  const router = useRouter();
  const [onay, setOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function sil() {
    setYukleniyor(true);
    try {
      await fetch(`/api/favori-istasyonlar?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch {
      setYukleniyor(false);
      setOnay(false);
    }
  }

  if (onay) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">Silmek istediğine emin misin?</span>
        <button
          onClick={sil}
          disabled={yukleniyor}
          className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30"
        >
          {yukleniyor ? "Siliniyor..." : "Evet, Sil"}
        </button>
        <button
          onClick={() => setOnay(false)}
          className="rounded-lg bg-white/8 px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/15"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOnay(true)}
      className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-neutral-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
    >
      Sil
    </button>
  );
}

// ─── Yeni istasyon formu ──────────────────────────────────────────────────────
const BOSH_BAGLANTI = { tip: "CCS Type 2", tipSinifi: "dc" as const, gucKW: 150, adet: 2 };

export function YeniIstasyonFormu() {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [form, setForm] = useState({
    ad: "",
    sehir: "",
    ilce: "",
    adres: "",
    lat: "",
    lng: "",
    operator: "trugo",
    not: "",
  });
  const [baglantilar, setBaglantilar] = useState([{ ...BOSH_BAGLANTI }]);
  const [hata, setHata] = useState("");

  function setField(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function baglantiGuncelle(i: number, k: string, v: string | number) {
    setBaglantilar((prev) => {
      const yeni = [...prev];
      (yeni[i] as any)[k] = v;
      return yeni;
    });
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ad || !form.sehir || !form.lat || !form.lng) {
      setHata("Ad, şehir ve koordinatlar zorunlu.");
      return;
    }
    setYukleniyor(true);
    setHata("");
    try {
      const res = await fetch("/api/favori-istasyonlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng),
          baglantilar: baglantilar.map((b) => ({
            ...b,
            gucKW: Number(b.gucKW),
            adet: Number(b.adet),
          })),
        }),
      });
      if (!res.ok) throw new Error();
      setAcik(false);
      setForm({ ad: "", sehir: "", ilce: "", adres: "", lat: "", lng: "", operator: "trugo", not: "" });
      setBaglantilar([{ ...BOSH_BAGLANTI }]);
      router.refresh();
    } catch {
      setHata("Kaydetme başarısız.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setAcik((v) => !v)}
        className="flex items-center gap-2 rounded-xl bg-[var(--togg-red)] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Yeni İstasyon Ekle
      </button>

      {acik && (
        <form
          onSubmit={gonder}
          className="mt-4 rounded-2xl border border-white/10 bg-neutral-900 p-5 space-y-4"
        >
          <h3 className="font-bold text-white">Yeni İstasyon</h3>

          <div className="grid gap-3 md:grid-cols-2">
            <LabelInput label="İstasyon Adı *" value={form.ad} onChange={(v) => setField("ad", v)} placeholder="Trugo — İstanbul Park" />
            <div>
              <label className="mb-1.5 block text-xs text-neutral-500">Operatör</label>
              <select
                value={form.operator}
                onChange={(e) => setField("operator", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              >
                {["trugo","zes","esarj","beefull","voltrun","sharz","tesla","diger"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <LabelInput label="Şehir *" value={form.sehir} onChange={(v) => setField("sehir", v)} placeholder="İstanbul" />
            <LabelInput label="İlçe" value={form.ilce} onChange={(v) => setField("ilce", v)} placeholder="Kadıköy" />
            <LabelInput label="Adres" value={form.adres} onChange={(v) => setField("adres", v)} placeholder="Bağdat Cad. No:1" />
            <div />
            <LabelInput label="Enlem (lat) *" value={form.lat} onChange={(v) => setField("lat", v)} placeholder="41.0082" type="number" />
            <LabelInput label="Boylam (lng) *" value={form.lng} onChange={(v) => setField("lng", v)} placeholder="28.9784" type="number" />
            <div className="md:col-span-2">
              <LabelInput label="Not" value={form.not} onChange={(v) => setField("not", v)} placeholder="Otopark katı, ücretli vb." />
            </div>
          </div>

          {/* Bağlantılar */}
          <div>
            <p className="mb-2 text-xs font-semibold text-neutral-500">Bağlantılar</p>
            {baglantilar.map((b, i) => (
              <div key={i} className="mb-2 flex flex-wrap items-center gap-2">
                <input
                  value={b.tip}
                  onChange={(e) => baglantiGuncelle(i, "tip", e.target.value)}
                  placeholder="CCS Type 2"
                  className="flex-1 min-w-[140px] rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-white/30 focus:outline-none"
                />
                <select
                  value={b.tipSinifi}
                  onChange={(e) => baglantiGuncelle(i, "tipSinifi", e.target.value)}
                  className="rounded-lg border border-white/10 bg-neutral-800 px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="dc">DC</option>
                  <option value="ac">AC</option>
                </select>
                <input
                  type="number"
                  value={b.gucKW || ""}
                  onChange={(e) => baglantiGuncelle(i, "gucKW", e.target.value)}
                  placeholder="kW"
                  className="w-16 rounded-lg border border-white/10 bg-neutral-800 px-2 py-2 text-xs text-white focus:border-white/30 focus:outline-none"
                />
                <input
                  type="number"
                  value={b.adet}
                  onChange={(e) => baglantiGuncelle(i, "adet", e.target.value)}
                  placeholder="Adet"
                  className="w-14 rounded-lg border border-white/10 bg-neutral-800 px-2 py-2 text-xs text-white focus:border-white/30 focus:outline-none"
                />
                {baglantilar.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setBaglantilar((p) => p.filter((_, j) => j !== i))}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBaglantilar((p) => [...p, { ...BOSH_BAGLANTI }])}
              className="text-xs text-[var(--togg-red)] hover:text-red-400"
            >
              + Bağlantı Ekle
            </button>
          </div>

          {hata && <p className="text-xs text-red-400">{hata}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={yukleniyor}
              className="rounded-xl bg-[var(--togg-red)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:opacity-90"
            >
              {yukleniyor ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setAcik(false)}
              className="rounded-xl bg-white/8 px-5 py-2.5 text-sm text-neutral-400 hover:bg-white/15"
            >
              İptal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Yardımcı ─────────────────────────────────────────────────────────────────
function LabelInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-neutral-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-white/30 focus:outline-none"
      />
    </div>
  );
}
