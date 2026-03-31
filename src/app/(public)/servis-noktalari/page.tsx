import type { Metadata } from "next";
import Link from "next/link";
import { SERVIS_NOKTALARI, SERVIS_ILLERI } from "@/lib/servis-noktalari";
import ServisListesi from "./ServisListesi";

export const metadata: Metadata = {
  title: "Togg Servis Noktaları — Türkiye Geneli Adres ve İletişim",
  description: `Türkiye genelinde ${SERVIS_NOKTALARI.length} Togg yetkili servis noktası. İl, adres, telefon ve harita yönlendirmesi.`,
  keywords: [
    "togg servis noktaları",
    "togg yetkili servis",
    "togg servis adresi",
    "togg bakım servisi",
    "togg t10x servis",
    "togg t10f servis",
  ],
};

export default function ServisNoktalariSayfasi() {
  const aktifSayisi = SERVIS_NOKTALARI.filter((n) => !n.yakinZamanda).length;
  const ilSayisi = SERVIS_ILLERI.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-slate-200">Servis Noktaları</span>
        </nav>

        {/* Başlık */}
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Yetkili Servis
        </div>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Togg Servis Noktaları</h1>
        <p className="mt-3 mb-6 text-slate-400">
          Teşhis, onarım ve bakım hizmeti alacağınız yetkili servisler.
          <br className="hidden md:block" />
          İl seçerek filtreleyebilir, "Konuma Git" ile yol tarifi alabilirsiniz.
        </p>

        {/* İstatistik şeridi */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--togg-red)]/15 text-sm font-bold text-[var(--togg-red)]">
              {aktifSayisi}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Aktif Servis</p>
              <p className="text-xs text-slate-500">Hizmet veriyor</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-sm font-bold text-blue-400">
              {ilSayisi}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">İl</p>
              <p className="text-xs text-slate-500">Türkiye geneli</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-xs font-bold text-emerald-400">
              7/24
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Togg Care</p>
              <a href="tel:08502228644" className="text-xs text-slate-400 hover:text-white transition-colors">
                0 850 222 86 44
              </a>
            </div>
          </div>
        </div>

        {/* Acil uyarı */}
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/8 px-4 py-3.5">
          <span className="mt-0.5 text-lg">⚠️</span>
          <div className="text-sm">
            <p className="font-semibold text-orange-200">Yolda kaldınız mı?</p>
            <p className="mt-0.5 text-orange-300/80">
              Servise gitmeden önce{" "}
              <a href="tel:08502228644" className="font-bold text-orange-200 underline underline-offset-2 hover:text-white">
                0 850 222 86 44
              </a>{" "}
              numaralı Togg Care'i arayın — 7/24 yol yardım hizmeti sunarlar.
            </p>
          </div>
        </div>

        {/* Filtrelenebilir liste */}
        <ServisListesi />

        {/* Alt not */}
        <div className="mt-14 rounded-2xl border border-white/8 bg-slate-900/40 p-5 text-sm text-slate-500">
          <p className="font-semibold text-slate-400 mb-1">Bilgi notu</p>
          <p>
            Servis bilgileri{" "}
            <a
              href="https://www.togg.com.tr/service-points"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 underline underline-offset-2 hover:text-white transition-colors"
            >
              togg.com.tr
            </a>{" "}
            adresinden alınmıştır. Çalışma saatleri için ilgili servisi arayın. Telefon numaraları
            doğrulandıkça güncellenecektir.
          </p>
        </div>

      </div>
    </div>
  );
}
