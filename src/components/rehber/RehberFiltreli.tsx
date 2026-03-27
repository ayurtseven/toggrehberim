"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useModelSecim } from "@/lib/model-secim";
import { VARYANTLAR } from "@/lib/varyantlar";

export interface RehberOzet {
  slug: string;
  kategori: string;
  baslik: string;
  ozet: string;
  model: string;
  sure?: number;
  tarih: string;
  etiketler?: string[];
}

type ModelFiltre = "hepsi" | "t10x" | "t10f";

interface Props {
  rehberler: RehberOzet[];
  gosterKategoriGrubu?: boolean; // hub sayfasında kategorilere göre grupla
}

const KATEGORILER: Record<string, { label: string; icon: string }> = {
  sarj: { label: "Şarj & Batarya", icon: "⚡" },
  yazilim: { label: "Yazılım & T-UI", icon: "💻" },
  bakim: { label: "Bakım & Servis", icon: "🔧" },
  suruculuk: { label: "Sürüş İpuçları", icon: "🚗" },
  sss: { label: "Sık Sorulan Sorular", icon: "❓" },
};

export default function RehberFiltreli({ rehberler, gosterKategoriGrubu = false }: Props) {
  const { secili } = useModelSecim();
  const [filtre, setFiltre] = useState<ModelFiltre>("hepsi");

  // Kayıtlı model varsa oto-seç
  useEffect(() => {
    if (secili) {
      const model = secili.startsWith("t10x") ? "t10x" : "t10f";
      setFiltre(model);
    }
  }, [secili]);

  const seciliVaryant = secili ? VARYANTLAR.find((v) => v.id === secili) : null;

  const filtrelenenler =
    filtre === "hepsi"
      ? rehberler
      : rehberler.filter((r) => r.model === filtre || r.model === "hepsi");

  // Kategori gruplama (hub sayfası için)
  const kategoriler = gosterKategoriGrubu
    ? Object.entries(KATEGORILER).map(([slug, info]) => ({
        slug,
        ...info,
        rehberler: filtrelenenler.filter((r) => r.kategori === slug),
      }))
    : null;

  return (
    <div>
      {/* ── Filtre bandı ───────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-3 flex-wrap">
        <div className="flex rounded-xl border border-white/10 bg-white/4 p-1 gap-1">
          {(["hepsi", "t10x", "t10f"] as ModelFiltre[]).map((f) => {
            const aktif = filtre === f;
            return (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                  aktif
                    ? f === "t10x"
                      ? "bg-blue-500/20 text-blue-300"
                      : f === "t10f"
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-white/12 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {f === "hepsi" ? "Tümü" : f.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Kaç içerik gösteriliyor */}
        {filtre !== "hepsi" && (
          <span className="text-sm text-slate-500">
            {filtrelenenler.length} içerik
            {seciliVaryant && (
              <span className="ml-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                {seciliVaryant.ad} için optimize edildi
              </span>
            )}
          </span>
        )}

        {/* Seçili model yokken hint */}
        {!secili && (
          <span className="text-xs text-slate-600">
            Aracını seçersen ilgili içerikler öne çıkar
          </span>
        )}
      </div>

      {/* ── İçerik listesi ─────────────────────────────────────────────────── */}
      {gosterKategoriGrubu && kategoriler ? (
        <div className="space-y-12">
          {kategoriler.map((kat) => (
            <section key={kat.slug}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <span>{kat.icon}</span>
                  {kat.label}
                </h2>
                <Link
                  href={`/rehber/${kat.slug}`}
                  className="text-sm font-medium text-[var(--togg-red)] hover:text-red-400 transition-colors"
                >
                  Tümünü gör →
                </Link>
              </div>

              {kat.rehberler.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-slate-600">
                  {filtre !== "hepsi"
                    ? `${filtre.toUpperCase()} için bu kategoride içerik yok.`
                    : "Yakında içerik eklenecek."}
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {kat.rehberler.slice(0, 3).map((r) => (
                    <RehberKart
                      key={r.slug}
                      rehber={r}
                      aktifFiltre={filtre}
                      seciliModel={secili?.startsWith("t10x") ? "t10x" : secili ? "t10f" : null}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtrelenenler.map((r) => (
            <RehberKart
              key={r.slug}
              rehber={r}
              aktifFiltre={filtre}
              seciliModel={secili?.startsWith("t10x") ? "t10x" : secili ? "t10f" : null}
            />
          ))}
          {filtrelenenler.length === 0 && (
            <p className="col-span-2 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-600">
              {filtre.toUpperCase()} için bu kategoride içerik yok.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RehberKart({
  rehber,
  aktifFiltre,
  seciliModel,
}: {
  rehber: RehberOzet;
  aktifFiltre: ModelFiltre;
  seciliModel: "t10x" | "t10f" | null;
}) {
  // Kişiselleştirilmiş uyum kontrolü
  const uyumlu =
    seciliModel &&
    (rehber.model === "hepsi" || rehber.model === seciliModel);

  return (
    <Link
      href={`/rehber/${rehber.kategori}/${rehber.slug}`}
      className={`group relative rounded-xl border p-5 transition-all hover:shadow-md ${
        uyumlu
          ? "border-white/15 bg-slate-900 hover:border-white/25"
          : "border-white/8 bg-slate-900/70 hover:border-white/15"
      }`}
    >
      {/* "Senin için" işareti */}
      {uyumlu && rehber.model !== "hepsi" && (
        <span className="absolute right-3 top-3 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          senin için ✓
        </span>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {rehber.model !== "hepsi" && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
              rehber.model === "t10x"
                ? "bg-blue-500/15 text-blue-400"
                : "bg-purple-500/15 text-purple-400"
            }`}
          >
            {rehber.model}
          </span>
        )}
        {rehber.etiketler?.slice(0, 2).map((e) => (
          <span
            key={e}
            className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-slate-500"
          >
            {e}
          </span>
        ))}
      </div>

      <h3
        className={`font-semibold leading-snug transition-colors group-hover:text-[var(--togg-red)] ${
          uyumlu ? "text-white" : "text-slate-300"
        }`}
      >
        {rehber.baslik}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
        {rehber.ozet}
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
        {rehber.sure && <span>{rehber.sure} dk okuma</span>}
        <span>{new Date(rehber.tarih).toLocaleDateString("tr-TR")}</span>
      </div>
    </Link>
  );
}
