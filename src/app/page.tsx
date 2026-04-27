import Link from "next/link";
import { getTumRehberler } from "@/lib/content/rehber";
import { getTumHaberler } from "@/lib/content/haberler";
import HaberlerSlider from "@/components/haberler/HaberlerSlider";
import SonRehberlerIstemci from "@/components/rehber/SonRehberlerIstemci";
import YolArkadasiHero from "@/components/ui/YolArkadasiHero";
import PanikButonu from "@/components/ui/PanikButonu";
import HaftalikGundem from "@/components/ui/HaftalikGundem";

const HIZLI_ERISIM = [
  {
    baslik: "Rehberler",
    aciklama: "Şarj, yazılım, bakım, sürüş ipuçları",
    href: "/rehber",
    ikon: "📖",
    renk: "border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5",
    text: "text-blue-400",
  },
  {
    baslik: "Ekranımı Oku",
    aciklama: "Kontrol panelindeki ışığın ne anlattığını öğren",
    href: "/ekranim",
    ikon: "✨",
    renk: "border-[var(--togg-red)]/20 hover:border-[var(--togg-red)]/40 bg-[var(--togg-red)]/5",
    text: "text-[var(--togg-red)]",
  },
  {
    baslik: "Şarj Fiyatları",
    aciklama: "Trugo, ZES, Eşarj ve diğerleri",
    href: "/sarj-haritasi",
    ikon: "⚡",
    renk: "border-yellow-500/20 hover:border-yellow-500/40 bg-yellow-500/5",
    text: "text-yellow-400",
  },
  {
    baslik: "Servis Noktaları",
    aciklama: "Türkiye geneli Togg servisleri",
    href: "/servis-noktalari",
    ikon: "🔧",
    renk: "border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5",
    text: "text-emerald-400",
  },
];

const SIKKONULAR = [
  { soru: "Şarj neden yavaş ilerliyor?",           href: "/rehber/sarj",                   ikon: "⚡" },
  { soru: "Kışın menzil neden düşüyor?",           href: "/rehber/sarj/kisin-togg-sarj-etme-soguk-hava-batarya-ve-menzil-uzerindeki-etkisi", ikon: "❄️" },
  { soru: "OTA güncellemek güvenli mi?",           href: "/rehber/yazilim/togg-ota-guncellemesi-nasil-yapilir-guncelleme-oncesi-kontrol-listesi", ikon: "📲" },
  { soru: "Periyodik bakım ne zaman gerekli?",     href: "/rehber/bakim",                  ikon: "🔧" },
  { soru: "Uzun yolda nasıl plan yapmalıyım?",     href: "/rehber/suruculuk/togg-t10x-ile-uzun-yolculuk-planlama-sarj-duraklarini-nasil-ayarlarsin", ikon: "🗺️" },
  { soru: "T10X mi, T10F mi almalıyım?",           href: "/modeller/karsilastir",           ikon: "⚖️" },
];

export default function AnaSayfa() {
  const sonRehberler = getTumRehberler().slice(0, 6);
  const haberler = getTumHaberler();

  return (
    <div className="bg-slate-950 text-white">

      {/* ── HERO ── */}
      <YolArkadasiHero rehberler={getTumRehberler()} />

      {/* ── HAFTALIK GÜNDEM ── */}
      <HaftalikGundem />

      {/* ── HIZLI ERİŞİM ── */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {HIZLI_ERISIM.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col gap-2 rounded-2xl border p-5 transition-all ${item.renk}`}
            >
              <span className="text-2xl">{item.ikon}</span>
              <p className={`text-sm font-bold ${item.text}`}>{item.baslik}</p>
              <p className="text-xs text-slate-500 leading-snug group-hover:text-slate-400 transition-colors">
                {item.aciklama}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PANİK BUTONU ── */}
      <PanikButonu />

      {/* ── SIK SORULANLAR ── */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200">Sık Sorulan Konular</h2>
          <Link href="/rehber" className="text-xs font-semibold text-[var(--togg-red)] hover:text-red-400 transition-colors">
            Tüm rehberler →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SIKKONULAR.map((k) => (
            <Link
              key={k.href}
              href={k.href}
              className="group flex items-center gap-3 rounded-xl border border-white/6 bg-slate-900/60 px-4 py-3.5 transition-all hover:border-white/12 hover:bg-slate-900"
            >
              <span className="shrink-0 text-lg">{k.ikon}</span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                {k.soru}
              </span>
              <svg className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-700 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SON REHBERLER ── */}
      {sonRehberler.length > 0 && (
        <section className="border-t border-white/6 bg-slate-900/30 px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200">Son Rehberler</h2>
              <Link href="/rehber" className="text-xs font-semibold text-[var(--togg-red)] hover:text-red-400 transition-colors">
                Tümünü gör →
              </Link>
            </div>
            <SonRehberlerIstemci
              rehberler={sonRehberler.map((r) => ({
                slug: r.slug,
                kategori: r.kategori,
                baslik: r.baslik,
                ozet: r.ozet,
                model: r.model ?? "hepsi",
                sure: r.sure,
              }))}
            />
          </div>
        </section>
      )}

      {/* ── HABERLER ── */}
      <div className="border-t border-white/8 bg-slate-950">
        <HaberlerSlider haberler={haberler} />
      </div>

    </div>
  );
}
