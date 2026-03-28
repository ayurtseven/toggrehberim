import type { Metadata } from "next";
import Link from "next/link";
import IkazArama from "@/components/ikaz/IkazArama";

export const metadata: Metadata = {
  title: "İkaz Lambası Tanıma",
  description:
    "Togg T10X veya T10F'de gördüğün uyarı lambasının fotoğrafını çek, AI anında tanımlayıp ne yapman gerektiğini söylesin. Tüm ikaz sembolleri, açıklamaları ve çözüm önerileri.",
  keywords: [
    "togg ikaz lambası",
    "togg uyarı lambası",
    "togg dashboard",
    "t10x ikaz",
    "t10f uyarı",
    "ikaz sembolleri",
    "araba uyarı ışığı",
  ],
};

export default function IkazAramaSayfasi() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">
          Ana Sayfa
        </Link>
        <span>/</span>
        <span className="text-slate-200">İkaz Lambası Tanıma</span>
      </nav>

      {/* Başlık */}
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-[var(--togg-red)]/20 bg-[var(--togg-red)]/8 px-3 py-1.5">
          <span className="text-sm font-bold text-[var(--togg-red)]">AI Destekli</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--togg-red)]" />
          <span className="text-sm text-[var(--togg-red)]/80">Togg El Kitabı 6.2.2</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">İkaz Lambası Tanıma</h1>
        <p className="mt-2 text-slate-400">
          Dashboard&apos;da gördüğün uyarı sembolünün fotoğrafını çek — yapay zeka Togg el kitabına
          göre ne anlama geldiğini ve ne yapman gerektiğini anında söylesin.
        </p>
      </div>

      {/* Acil uyarı bandı */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3">
        <span className="text-lg">🚨</span>
        <p className="text-sm text-red-300">
          <strong className="text-red-200">Güvenlik sorunu hissediyorsan önce dur.</strong> Togg Care:{" "}
          <a href="tel:08502228644" className="font-bold text-red-200 underline underline-offset-2">
            0 850 222 86 44
          </a>
        </p>
      </div>

      {/* Ana modül */}
      <IkazArama />

      {/* Alt bilgi */}
      <div className="mt-10 rounded-2xl border border-white/8 bg-slate-900/40 p-5">
        <h2 className="mb-3 font-bold text-slate-200">Hakkında</h2>
        <ul className="space-y-2 text-sm text-slate-500">
          <li className="flex items-start gap-2">
            <span>📘</span>
            <span>
              Sembol açıklamaları Togg T10X ve T10F resmi kullanıcı el kitabı bölüm 6.2.2&apos;ye dayanmaktadır.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>🤖</span>
            <span>
              Görsel tanımlama Claude AI (Haiku) tarafından yapılır. Fotoğraflar sunucu tarafında işlenir
              ve saklanmaz.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>⚠️</span>
            <span>
              Bu araç bilgilendirme amaçlıdır. Ciddi güvenlik uyarılarında her zaman yetkili Togg
              servisiyle iletişime geç.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
