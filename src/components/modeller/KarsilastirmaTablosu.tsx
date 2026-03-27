"use client";

import { useState } from "react";
import {
  VARYANTLAR,
  VARYANT_MAP,
  SPEC_KATEGORILER,
  VARSAYILAN_VARYANTLAR,
  RENK_SINIFLAR,
  type Varyant,
} from "@/lib/varyantlar";

// T10X varyantları sol, T10F sağ
const T10X_VARYANTLAR = VARYANTLAR.filter((v) => v.model === "t10x");
const T10F_VARYANTLAR = VARYANTLAR.filter((v) => v.model === "t10f");

function VaryantSecici({
  varyantlar,
  secili,
  onChange,
}: {
  varyantlar: Varyant[];
  secili: string;
  onChange: (id: string) => void;
}) {
  const aktif = VARYANT_MAP[secili];
  const renkler = RENK_SINIFLAR[aktif?.renk ?? "blue"];

  return (
    <div className="flex flex-wrap gap-2">
      {varyantlar.map((v) => {
        const r = RENK_SINIFLAR[v.renk];
        const isSecili = v.id === secili;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              isSecili
                ? `${r.kart} ${r.secili}`
                : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            }`}
          >
            {v.kisaAd}
          </button>
        );
      })}
    </div>
  );
}

function farkliMi(a: string | undefined, b: string | undefined) {
  return a !== b && a !== "—" && b !== "—";
}

export default function KarsilastirmaTablosu() {
  const [solId, setSolId] = useState(VARSAYILAN_VARYANTLAR[0]);
  const [sagId, setSagId] = useState(VARSAYILAN_VARYANTLAR[1]);
  const [sadeceFarklar, setSadeceFarklar] = useState(false);

  const sol = VARYANT_MAP[solId];
  const sag = VARYANT_MAP[sagId];

  if (!sol || !sag) return null;

  const solRenk = RENK_SINIFLAR[sol.renk];
  const sagRenk = RENK_SINIFLAR[sag.renk];

  return (
    <div>
      {/* Seçici kartlar */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Sol model */}
        <div className={`rounded-2xl border-2 p-5 ${solRenk.kart}`}>
          <p className={`mb-1 text-xs font-bold uppercase tracking-widest ${solRenk.baslik}`}>
            {sol.model.toUpperCase()}
          </p>
          <p className="mb-3 text-xl font-bold">{sol.ad}</p>
          <VaryantSecici
            varyantlar={T10X_VARYANTLAR}
            secili={solId}
            onChange={setSolId}
          />
        </div>

        {/* Sağ model */}
        <div className={`rounded-2xl border-2 p-5 ${sagRenk.kart}`}>
          <p className={`mb-1 text-xs font-bold uppercase tracking-widest ${sagRenk.baslik}`}>
            {sag.model.toUpperCase()}
          </p>
          <p className="mb-3 text-xl font-bold">{sag.ad}</p>
          <VaryantSecici
            varyantlar={T10F_VARYANTLAR}
            secili={sagId}
            onChange={setSagId}
          />
        </div>
      </div>

      {/* Filtre */}
      <div className="mb-4 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sadeceFarklar}
            onChange={(e) => setSadeceFarklar(e.target.checked)}
            className="h-4 w-4 rounded accent-[var(--togg-red)]"
          />
          Yalnızca farklı özellikleri göster
        </label>
        <span className="ml-auto text-xs text-neutral-400">
          Renkli satır = fark var
        </span>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="w-1/3 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Özellik
              </th>
              <th className={`w-1/3 px-5 py-4 text-center text-sm font-bold ${solRenk.baslik}`}>
                {sol.ad}
              </th>
              <th className={`w-1/3 px-5 py-4 text-center text-sm font-bold ${sagRenk.baslik}`}>
                {sag.ad}
              </th>
            </tr>
          </thead>
          <tbody>
            {SPEC_KATEGORILER.map((kat) => {
              const gorunurSatirlar = kat.anahtarlar.filter(({ anahtar }) => {
                if (!sadeceFarklar) return true;
                return farkliMi(sol.specs[anahtar], sag.specs[anahtar]);
              });

              if (gorunurSatirlar.length === 0) return null;

              return [
                // Kategori başlığı
                <tr key={`kat-${kat.baslik}`} className="bg-neutral-50 dark:bg-neutral-900">
                  <td
                    colSpan={3}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    {kat.baslik}
                  </td>
                </tr>,
                // Satırlar
                ...gorunurSatirlar.map(({ anahtar, etiket }, i) => {
                  const solDeger = sol.specs[anahtar] ?? "—";
                  const sagDeger = sag.specs[anahtar] ?? "—";
                  const farki = farkliMi(solDeger, sagDeger);

                  return (
                    <tr
                      key={anahtar}
                      className={`border-t border-neutral-100 dark:border-neutral-800 ${
                        farki ? "bg-amber-50/40 dark:bg-amber-950/10" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5 text-neutral-500">
                        {etiket}
                        {farki && (
                          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                        )}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-center font-medium ${
                          farki ? solRenk.kazanan : ""
                        }`}
                      >
                        {solDeger}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-center font-medium ${
                          farki ? sagRenk.kazanan : ""
                        }`}
                      >
                        {sagDeger}
                      </td>
                    </tr>
                  );
                }),
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* Açıklama */}
      <p className="mt-4 text-xs text-neutral-400">
        🟡 Sarı vurgu: iki varyant arasında fark olan satırlar.
        Teknik veriler resmi Togg kılavuzlarına dayanmaktadır.
      </p>
    </div>
  );
}
