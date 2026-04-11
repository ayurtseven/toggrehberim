import type { Metadata } from "next";
import Link from "next/link";
import IkazArama from "@/components/ikaz/IkazArama";

export const metadata: Metadata = {
  title: "Ekranımı Oku — Togg Asistanı",
  description:
    "Togg T10X veya T10F ekranındaki mesajın fotoğrafını çek — asistanın ne anlama geldiğini ve ne yapman gerektiğini anında açıklasın.",
  keywords: [
    "togg ekran mesajı",
    "togg dashboard ışığı",
    "togg kontrol paneli",
    "t10x bilgi lambası",
    "t10f gösterge",
    "togg semboller",
  ],
};

export default async function EkranimSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ kamera?: string }>;
}) {
  const { kamera } = await searchParams;
  const autoKamera = kamera === "ac";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-10">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <span className="text-slate-200">Ekranımı Oku</span>
        </nav>

        {/* Başlık */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-[var(--togg-red)]/20 bg-[var(--togg-red)]/8 px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--togg-red)]" />
            <span className="text-sm font-bold text-[var(--togg-red)]">Yapay Zeka Destekli</span>
            <span className="text-sm text-[var(--togg-red)]/70">· Togg El Kitabı 6.2.2</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Ekranımı Oku</h1>
          <p className="mt-2 text-slate-400">
            Kontrol panelinizde gördüğünüz sembolün fotoğrafını çekin — asistanınız
            Togg el kitabına göre ne anlama geldiğini ve ne yapmanız gerektiğini açıklasın.
          </p>
        </div>

        {/* Güven bandı */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/6 px-4 py-3">
          <span className="text-lg">🛡️</span>
          <p className="text-sm text-emerald-200">
            Emin olmadığınızda araç güvenli bir yere çekilebilir.{" "}
            <a href="tel:08502228644" className="font-bold text-emerald-100 underline underline-offset-2">
              Togg Care: 0 850 222 86 44
            </a>
          </p>
        </div>

        {/* Ana modül */}
        <IkazArama autoKamera={autoKamera} />

        {/* Alt bilgi */}
        <div className="mt-10 rounded-2xl border border-white/8 bg-slate-900/40 p-5">
          <h2 className="mb-3 font-bold text-slate-200">Bu uygulama hakkında</h2>
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
                Görsel analizi Claude AI (Haiku) tarafından yapılır. Fotoğraflar sunucu tarafında işlenir ve saklanmaz.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>💬</span>
              <span>
                Bu araç bilgilendirme amaçlıdır. Önemli durumlarda yetkili Togg servisini ziyaret edin.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
