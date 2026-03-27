"use client";

import { useState } from "react";

type FormDurumu = "bos" | "gonderiliyor" | "basarili" | "hata";

export default function OneriFormu() {
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [kategori, setKategori] = useState("sarj");
  const [model, setModel] = useState("hepsi");
  const [durum, setDurum] = useState<FormDurumu>("bos");
  const [hataMesaji, setHataMesaji] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDurum("gonderiliyor");
    setHataMesaji("");

    try {
      const res = await fetch("/api/oner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik, icerik, kategori, model }),
      });

      const veri = await res.json();

      if (!res.ok) {
        setHataMesaji(veri.hata || "Bir hata oluştu.");
        setDurum("hata");
        return;
      }

      setDurum("basarili");
    } catch {
      setHataMesaji("Sunucuya bağlanılamadı.");
      setDurum("hata");
    }
  }

  if (durum === "basarili") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <svg
              className="h-8 w-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Önerini aldık!</h2>
          <p className="text-sm text-neutral-400">
            Katkın için teşekkürler. En kısa sürede inceleyeceğiz.
          </p>
          <button
            onClick={() => {
              setBaslik("");
              setIcerik("");
              setKategori("sarj");
              setModel("hepsi");
              setDurum("bos");
            }}
            className="mt-6 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Yeni öneri gönder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            İçerik <span className="text-[var(--togg-red)]">Öner</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Rehberde görmek istediğin bir konuyu bizimle paylaş.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-white/10 bg-neutral-900 p-6"
        >
          {/* Başlık */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Başlık
            </label>
            <input
              type="text"
              required
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Örn: Kış lastiği takarken dikkat edilmesi gerekenler"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-[var(--togg-red)] focus:ring-1 focus:ring-[var(--togg-red)]"
            />
          </div>

          {/* İçerik */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">
              Açıklama
            </label>
            <textarea
              required
              rows={5}
              value={icerik}
              onChange={(e) => setIcerik(e.target.value)}
              placeholder="Bu konunun neden önemli olduğunu, ne tür bilgiler içermesini istediğini anlat..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-[var(--togg-red)] focus:ring-1 focus:ring-[var(--togg-red)]"
            />
          </div>

          {/* Kategori + Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--togg-red)] focus:ring-1 focus:ring-[var(--togg-red)]"
              >
                <option value="sarj">Şarj</option>
                <option value="yazilim">Yazılım</option>
                <option value="bakim">Bakım</option>
                <option value="suruculuk">Sürücülük</option>
                <option value="sss">Sık Sorulan Sorular</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--togg-red)] focus:ring-1 focus:ring-[var(--togg-red)]"
              >
                <option value="hepsi">Hepsi</option>
                <option value="t10x">T10X</option>
                <option value="t10f">T10F</option>
              </select>
            </div>
          </div>

          {/* Hata */}
          {durum === "hata" && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {hataMesaji}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={durum === "gonderiliyor"}
            className="w-full rounded-xl bg-[var(--togg-red)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {durum === "gonderiliyor" ? "Gönderiliyor..." : "Öneriyi Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
