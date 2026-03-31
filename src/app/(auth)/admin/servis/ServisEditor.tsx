"use client";

import { useState } from "react";
import type { ServisNoktasi } from "@/lib/servis-noktalari";
import { googleMapsUrl } from "@/lib/servis-noktalari";

interface IletisimKayit {
  telefonlar: string[];
  email: string;
  maps_url: string;
}

function SatirEditor({
  nokta,
  iletisim,
  onKaydet,
}: {
  nokta: ServisNoktasi;
  iletisim: IletisimKayit;
  onKaydet: (id: string, kayit: IletisimKayit) => Promise<void>;
}) {
  const [telefonlar, setTelefonlar] = useState<string[]>(
    iletisim.telefonlar.length > 0 ? iletisim.telefonlar : [""]
  );
  const [email, setEmail] = useState(iletisim.email);
  const [mapsUrl, setMapsUrl] = useState(iletisim.maps_url);
  const [durum, setDurum] = useState<"idle" | "saving" | "ok" | "err">("idle");

  const otomapsUrl = googleMapsUrl(nokta.koordinat.lat, nokta.koordinat.lon);

  function telefonGuncelle(i: number, deger: string) {
    setTelefonlar((prev) => prev.map((t, j) => (j === i ? deger : t)));
  }
  function telefonEkle() {
    setTelefonlar((prev) => [...prev, ""]);
  }
  function telefonSil(i: number) {
    setTelefonlar((prev) => prev.filter((_, j) => j !== i));
  }

  async function kaydet() {
    setDurum("saving");
    try {
      await onKaydet(nokta.id, {
        telefonlar: telefonlar.filter((t) => t.trim()),
        email,
        maps_url: mapsUrl,
      });
      setDurum("ok");
      setTimeout(() => setDurum("idle"), 2000);
    } catch {
      setDurum("err");
      setTimeout(() => setDurum("idle"), 2000);
    }
  }

  const mevcutTelefonlar = iletisim.telefonlar.length > 0 ? iletisim.telefonlar : [];
  const degisti =
    JSON.stringify(telefonlar.filter((t) => t.trim())) !== JSON.stringify(mevcutTelefonlar) ||
    email !== iletisim.email ||
    mapsUrl !== iletisim.maps_url;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
      {/* Başlık */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">
            {nokta.il} — {nokta.ilce}
            {nokta.yakinZamanda && (
              <span className="ml-2 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                Yakında
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{nokta.adres}</p>
        </div>
        <a
          href={mapsUrl || otomapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          🗺️
        </a>
      </div>

      {/* Telefonlar */}
      <div className="mb-3">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Telefon Numaraları
        </label>
        <div className="space-y-2">
          {telefonlar.map((tel, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="tel"
                value={tel}
                onChange={(e) => telefonGuncelle(i, e.target.value)}
                placeholder="0 xxx xxx xx xx"
                className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:outline-none"
              />
              {telefonlar.length > 1 && (
                <button
                  onClick={() => telefonSil(i)}
                  className="shrink-0 rounded-lg bg-white/5 px-2 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={telefonEkle}
          className="mt-1.5 text-xs text-[var(--togg-red)] hover:text-red-400 transition-colors"
        >
          + Telefon Ekle
        </button>
      </div>

      {/* E-posta */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          E-posta
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="togg-xxxsm@togg.com.tr"
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      {/* Maps URL */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Google Maps Linki{" "}
          <span className="normal-case font-normal text-slate-700">(boş bırakılırsa koordinattan otomatik oluşur)</span>
        </label>
        <input
          type="url"
          value={mapsUrl}
          onChange={(e) => setMapsUrl(e.target.value)}
          placeholder={otomapsUrl}
          className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:outline-none"
        />
      </div>

      {/* Kaydet */}
      {degisti && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={kaydet}
            disabled={durum === "saving"}
            className="rounded-lg bg-[var(--togg-red)] px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {durum === "saving" ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {durum === "ok" && <span className="text-xs text-emerald-400">✓ Kaydedildi</span>}
          {durum === "err" && <span className="text-xs text-red-400">Hata oluştu</span>}
        </div>
      )}
    </div>
  );
}

export default function ServisEditor({
  noktalar,
  iletisimMap,
}: {
  noktalar: ServisNoktasi[];
  iletisimMap: Record<string, IletisimKayit>;
}) {
  const [filtre, setFiltre] = useState("");

  async function guncelle(id: string, kayit: IletisimKayit) {
    const res = await fetch("/api/admin/servis", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...kayit }),
    });
    if (!res.ok) {
      const hata = await res.json().catch(() => ({}));
      throw new Error(hata.error ?? "Güncelleme başarısız");
    }
  }

  const iller = [...new Set(noktalar.map((n) => n.il))].sort((a, b) =>
    a.localeCompare(b, "tr")
  );
  const filtreli = filtre ? noktalar.filter((n) => n.il === filtre) : noktalar;
  const telefonluSayisi = noktalar.filter(
    (n) => (iletisimMap[n.id]?.telefonlar?.length ?? 0) > 0
  ).length;

  return (
    <div>
      {/* İlerleme */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5">
          <span className="text-lg font-bold text-[var(--togg-red)]">{telefonluSayisi}</span>
          <span className="text-sm text-slate-400">/ {noktalar.length} telefon girildi</span>
        </div>
        <div className="h-2 flex-1 min-w-[120px] rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-[var(--togg-red)] transition-all"
            style={{ width: `${(telefonluSayisi / noktalar.length) * 100}%` }}
          />
        </div>
      </div>

      {/* İl filtresi */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setFiltre("")}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
            filtre === ""
              ? "border-[var(--togg-red)] bg-[var(--togg-red)]/15 text-[var(--togg-red)]"
              : "border-white/15 bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Tümü
        </button>
        {iller.map((il) => (
          <button
            key={il}
            onClick={() => setFiltre(il === filtre ? "" : il)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
              filtre === il
                ? "border-[var(--togg-red)] bg-[var(--togg-red)]/15 text-[var(--togg-red)]"
                : "border-white/15 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {il}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtreli.map((nokta) => (
          <SatirEditor
            key={nokta.id}
            nokta={nokta}
            iletisim={iletisimMap[nokta.id] ?? { telefonlar: [], email: "", maps_url: "" }}
            onKaydet={guncelle}
          />
        ))}
      </div>
    </div>
  );
}
