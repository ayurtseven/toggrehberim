"use client";

import { useState } from "react";
import React from "react";
import {
  VARYANTLAR,
  VARYANT_MAP,
  SPEC_KATEGORILER,
  RENK_SINIFLAR,
  type ModelAdi,
} from "@/lib/varyantlar";

const ANA_OZELLIKLER = [
  { anahtar: "batarya", ikon: "🔋", etiket: "Batarya" },
  { anahtar: "wltp", ikon: "🛣️", etiket: "WLTP Menzil" },
  { anahtar: "guc", ikon: "⚡", etiket: "Motor Gücü" },
  { anahtar: "tork", ikon: "🔩", etiket: "Maks. Tork" },
  { anahtar: "yuz", ikon: "⏱️", etiket: "0–100 km/s" },
  { anahtar: "dc_sarj", ikon: "🔌", etiket: "DC Şarj" },
];

export default function ModelVaryantDetay({ model }: { model: ModelAdi }) {
  const varyantlar = VARYANTLAR.filter((v) => v.model === model);
  const defaultId = varyantlar.length > 1 ? varyantlar[1].id : varyantlar[0].id;
  const [secilenId, setSecilenId] = useState(defaultId);

  const secilen = VARYANT_MAP[secilenId];
  const renkler = RENK_SINIFLAR[secilen.renk];

  return (
    <div>
      {/* Versiyon seçici */}
      <div className="mb-6">
        <h2 className="mb-3 text-xl font-bold">Versiyon Seç</h2>
        <div className="flex flex-wrap gap-2">
          {varyantlar.map((v) => {
            const isSecili = v.id === secilenId;
            return (
              <button
                key={v.id}
                onClick={() => setSecilenId(v.id)}
                className={`rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition-all ${
                  isSecili
                    ? `${renkler.kart} ${renkler.secili}`
                    : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500"
                }`}
              >
                {v.ad}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ana özellik kartları */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {ANA_OZELLIKLER.map((oz) => {
          const deger = secilen.specs[oz.anahtar] ?? "—";
          return (
            <div
              key={oz.anahtar}
              className={`rounded-2xl border p-4 text-center transition-all ${renkler.kart}`}
            >
              <div className="mb-1 text-xl">{oz.ikon}</div>
              <p className={`text-lg font-bold leading-tight ${renkler.baslik}`}>{deger}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{oz.etiket}</p>
            </div>
          );
        })}
      </div>

      {/* Tam teknik tablo */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <tbody>
            {SPEC_KATEGORILER.map((kat) =>
              [
                <tr
                  key={`kat-${kat.baslik}`}
                  className="bg-neutral-50 dark:bg-neutral-900"
                >
                  <td
                    colSpan={2}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    {kat.baslik}
                  </td>
                </tr>,
                ...kat.anahtarlar.map(({ anahtar, etiket }) => {
                  const deger = secilen.specs[anahtar] ?? "—";
                  return (
                    <tr
                      key={anahtar}
                      className="border-t border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="px-5 py-3 text-neutral-500">{etiket}</td>
                      <td
                        className={`px-5 py-3 font-medium ${
                          deger === "—"
                            ? "text-neutral-300 dark:text-neutral-600"
                            : ""
                        }`}
                      >
                        {deger}
                      </td>
                    </tr>
                  );
                }),
              ]
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-neutral-400">
        Teknik veriler resmi Togg kılavuzlarına dayanmaktadır. WLTP değerleri ideal koşullarda ölçülmüştür.
      </p>
    </div>
  );
}
