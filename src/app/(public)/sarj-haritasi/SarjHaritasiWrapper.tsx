"use client";

import dynamic from "next/dynamic";

const SarjHaritasiClient = dynamic(() => import("./SarjHaritasiClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-3 text-neutral-500">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm">Harita yükleniyor...</span>
      </div>
    </div>
  ),
});

export default function SarjHaritasiWrapper() {
  return <SarjHaritasiClient />;
}
