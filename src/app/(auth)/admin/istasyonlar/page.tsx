import fs from "fs";
import path from "path";
import Link from "next/link";
import type { FavoriIstasyon } from "@/app/api/favori-istasyonlar/route";
import {
  DurumGuncelleyici,
  SilButonu,
  YeniIstasyonFormu,
} from "./IstasyonYonetimClient";

export const dynamic = "force-dynamic";

const DURUM_ETIKET: Record<FavoriIstasyon["durum"], { label: string; cls: string }> = {
  musait:     { label: "Müsait",     cls: "bg-emerald-500/15 text-emerald-400" },
  kismi:      { label: "Kısmi",      cls: "bg-yellow-500/15  text-yellow-400"  },
  megul:      { label: "Meşgul",     cls: "bg-red-500/15     text-red-400"     },
  kapali:     { label: "Kapalı",     cls: "bg-neutral-700/40 text-neutral-400" },
  bilinmiyor: { label: "Bilinmiyor", cls: "bg-white/5        text-neutral-500" },
};

function istasyonlariOku(): FavoriIstasyon[] {
  try {
    const dosya = path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "data",
      "favori-istasyonlar.json"
    );
    return JSON.parse(fs.readFileSync(dosya, "utf-8"));
  } catch {
    return [];
  }
}

function zamanFarki(iso: string | null): string {
  if (!iso) return "Hiç güncellenmedi";
  const fark = (Date.now() - new Date(iso).getTime()) / 1000;
  if (fark < 60) return "Az önce";
  if (fark < 3600) return `${Math.floor(fark / 60)} dk önce`;
  if (fark < 86400) return `${Math.floor(fark / 3600)} sa önce`;
  return `${Math.floor(fark / 86400)} gün önce`;
}

export default function IstasyonYonetimSayfasi() {
  const istasyonlar = istasyonlariOku();

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Başlık */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Favori İstasyonlar</h1>
            <p className="mt-1 text-sm text-neutral-400">
              {istasyonlar.length} istasyon ·{" "}
              <Link href="/sarj-haritasi" className="text-[var(--togg-red)] hover:text-red-400">
                Listeyi Görüntüle →
              </Link>
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-white"
          >
            ← Admin
          </Link>
        </div>

        {/* Yeni istasyon ekleme formu */}
        <div className="mb-8">
          <YeniIstasyonFormu />
        </div>

        {/* İstasyon listesi */}
        <div className="space-y-4">
          {istasyonlar.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-16 text-center text-neutral-500">
              Henüz istasyon eklenmemiş.
            </div>
          ) : (
            istasyonlar.map((ist) => {
              const durum = DURUM_ETIKET[ist.durum];
              return (
                <div
                  key={ist.id}
                  className="rounded-2xl border border-white/8 bg-neutral-900 p-5"
                >
                  {/* Kart başlığı */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${durum.cls}`}>
                          {durum.label}
                        </span>
                        <span className="text-xs text-neutral-600 capitalize">{ist.operator}</span>
                        <span className="text-xs text-neutral-700">·</span>
                        <span className="text-xs text-neutral-600">{zamanFarki(ist.durumGuncelleme)}</span>
                      </div>
                      <h2 className="font-bold text-white">{ist.ad}</h2>
                      <p className="text-sm text-neutral-500">
                        {ist.ilce && `${ist.ilce}, `}{ist.sehir}
                      </p>
                    </div>
                    <SilButonu id={ist.id} ad={ist.ad} />
                  </div>

                  {/* Soketler */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ist.baglantilar.map((b, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-neutral-400"
                      >
                        {b.tip}
                        {b.gucKW && ` · ${b.gucKW} kW`}
                        {` × ${b.adet}`}
                      </span>
                    ))}
                  </div>

                  {/* Durum not */}
                  {ist.durumNot && (
                    <p className="mt-2 text-xs italic text-neutral-600">"{ist.durumNot}"</p>
                  )}

                  {/* Güncelleme kontrolleri */}
                  <DurumGuncelleyici ist={ist} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
