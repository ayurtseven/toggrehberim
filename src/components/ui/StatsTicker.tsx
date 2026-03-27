"use client";

const ITEMS = [
  "T10X · 523 km WLTP Menzil",
  "T10X · 218 PS Motor Gücü",
  "T10X · 7.4 sn 0–100 km/s",
  "T10F · 623 km AWD Menzil",
  "T10F · 435 PS Çift Motor",
  "T10F · 4.1 sn 0–100 km/s",
  "Euro NCAP · 5 Yıldız",
  "Trugo · Hızlı Şarj Ağı",
  "OTA · Kablosuz Güncelleme",
  "T-UI · Akıllı Dokunmatik Arayüz",
];

export default function StatsTicker() {
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-neutral-950 py-3.5 select-none">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-neutral-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-neutral-950 to-transparent" />
      <div className="flex animate-marquee whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="flex shrink-0 items-center">
            <span className="mx-6 text-[var(--togg-red)] text-[10px]">◆</span>
            <span className="text-xs font-medium tracking-wider text-neutral-300 uppercase">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
