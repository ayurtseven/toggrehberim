import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkında — ToggRehberim",
  description:
    "ToggRehberim nedir, kim yapar, neden var? T10X ve T10F sahipleri için bağımsız kullanıcı rehberi.",
};

export default function HakkindaSayfasi() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-slate-200">Hakkında</span>
        </nav>

        <h1 className="text-3xl font-bold md:text-4xl">Hakkında</h1>
        <p className="mt-3 text-slate-400">
          ToggRehberim, Togg A.Ş. ile hiçbir resmi bağlantısı olmayan bağımsız bir kullanıcı rehberi sitesidir.
        </p>

        <div className="mt-10 space-y-8">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Bu site neden var?</h2>
            <p className="text-slate-400 leading-relaxed">
              T10X ve T10F aldım. Resmi el kitabı 200+ sayfa, teknik terimlerle dolu.
              Aracın ekranında bir ışık yandığında ne yapacağını hızlıca bulmak çok zordu.
              Bu yüzden el kitabındaki bilgileri normal bir insanın anlayacağı dile çevirerek
              bir araya getirdim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">İçerikler güvenilir mi?</h2>
            <p className="text-slate-400 leading-relaxed">
              Tüm teknik içerikler Togg T10X ve T10F resmi kullanıcı el kitaplarından derlendi.
              Şarj istasyonu verileri, Trugo / ZES / Eşarj gibi ağların kamuya açık bilgilerinden alındı.
              Hata gördüğünde <Link href="/oner" className="text-white underline underline-offset-2 hover:text-[var(--togg-red)] transition-colors">öneri formunu</Link> kullanabilirsin.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">AI kullanıyor musunuz?</h2>
            <p className="text-slate-400 leading-relaxed">
              &ldquo;Ekranımı Oku&rdquo; özelliğinde kontrol paneli fotoğraflarını analiz etmek için
              Claude AI kullanılıyor. Fotoğraflar yalnızca analiz için işlenir, saklanmaz.
              Bu özellik bilgilendirme amaçlıdır; kritik durumlarda Togg Care&apos;i arayın.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Sorumluluk reddi</h2>
            <p className="text-slate-400 leading-relaxed">
              Bu site Togg A.Ş. ile resmi bağlantısı olmayan bağımsız bir kaynak sitesidir.
              Togg, Togg logosu ve T10X / T10F isimleri Togg A.Ş.&apos;nin tescilli markalarıdır.
              Araç güvenliğini etkileyen kararlar için her zaman yetkili Togg servisine danışın.
            </p>
          </section>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 px-5 py-4">
            <p className="text-sm text-slate-400">
              Önerilerin, hataların veya katkıların için{" "}
              <Link href="/oner" className="font-semibold text-white hover:text-[var(--togg-red)] transition-colors">
                öneri formunu
              </Link>{" "}
              kullanabilirsin.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
