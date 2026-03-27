import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Çevrimdışı",
};

const OFFLINE_SAYFALAR = [
  { href: "/ikaz-arama", label: "İkaz Lambası Tanı", aciklama: "AI destekli ikaz tanıma", renk: "text-red-400", bg: "bg-red-500/10 border-red-500/25" },
  { href: "/rehber/sarj", label: "Şarj Rehberi", aciklama: "Evde ve yolda şarj bilgileri", renk: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/25" },
  { href: "/rehber", label: "Tüm Rehberler", aciklama: "Daha önce ziyaret ettikleriniz", renk: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/25" },
  { href: "/sarj-haritasi", label: "Şarj İstasyonları", aciklama: "Favori istasyon listesi", renk: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
];

export default function OfflineSayfasi() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-4xl">
        📡
      </div>

      <h1 className="mb-2 text-2xl font-bold">İnternet Bağlantısı Yok</h1>
      <p className="mb-10 max-w-sm text-sm text-slate-500">
        Bağlantı kesildi. Daha önce ziyaret ettiğin sayfalar önbellekten yüklenebilir.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <p className="mb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
          Önbellekteki Sayfalar
        </p>
        {OFFLINE_SAYFALAR.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-opacity hover:opacity-80 ${s.bg}`}
          >
            <svg className={`h-4 w-4 shrink-0 ${s.renk}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="text-left">
              <p className={`text-sm font-semibold ${s.renk}`}>{s.label}</p>
              <p className="text-xs text-slate-500">{s.aciklama}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-700">
        Bağlantı geri geldiğinde sayfa otomatik güncellenecek.
      </p>
    </div>
  );
}
