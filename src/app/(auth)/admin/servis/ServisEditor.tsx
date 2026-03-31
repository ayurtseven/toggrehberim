"use client";

import { useState } from "react";
import type { ServisNoktasi } from "@/lib/servis-noktalari";
import { googleMapsUrl } from "@/lib/servis-noktalari";

function SatirEditor({
  nokta,
  onKaydet,
}: {
  nokta: ServisNoktasi;
  onKaydet: (id: string, telefon: string, email: string) => Promise<void>;
}) {
  const [telefon, setTelefon] = useState(nokta.telefon);
  const [email, setEmail] = useState(nokta.email);
  const [durum, setDurum] = useState<"idle" | "saving" | "ok" | "err">("idle");

  async function kaydet() {
    setDurum("saving");
    try {
      await onKaydet(nokta.id, telefon, email);
      setDurum("ok");
      setTimeout(() => setDurum("idle"), 2000);
    } catch {
      setDurum("err");
      setTimeout(() => setDurum("idle"), 2000);
    }
  }

  const degisti = telefon !== nokta.telefon || email !== nokta.email;

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
          href={googleMapsUrl(nokta.koordinat.lat, nokta.koordinat.lon)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          🗺️
        </a>
      </div>

      {/* Form alanları */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Telefon
          </label>
          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="0 xxx xxx xx xx"
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-white/30 focus:outline-none"
          />
        </div>
        <div>
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
      </div>

      {/* Kaydet butonu */}
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

export default function ServisEditor({ noktalar }: { noktalar: ServisNoktasi[] }) {
  const [filtre, setFiltre] = useState("");

  async function guncelle(id: string, telefon: string, email: string) {
    const res = await fetch("/api/admin/servis", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, telefon, email }),
    });
    if (!res.ok) throw new Error("Güncelleme başarısız");
  }

  // İl filtresi
  const iller = [...new Set(noktalar.map((n) => n.il))].sort((a, b) => a.localeCompare(b, "tr"));

  const filtreli = filtre
    ? noktalar.filter((n) => n.il === filtre)
    : noktalar;

  const telefonluSayisi = noktalar.filter((n) => n.telefon).length;

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
          <SatirEditor key={nokta.id} nokta={nokta} onKaydet={guncelle} />
        ))}
      </div>
    </div>
  );
}
