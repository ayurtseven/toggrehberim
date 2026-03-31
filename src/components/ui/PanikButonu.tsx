import Link from "next/link";

const SENARYOLAR = [
  {
    emoji: "🔴",
    baslik: "Ekranda ışık yandı",
    microcopy: "Korkma, çoğu ikaz kritik değil.",
    href: "/ikaz-arama",
    border: "border-red-500/40",
    bg: "bg-red-500/8",
    hoverBorder: "hover:border-red-500/70",
    hoverBg: "hover:bg-red-500/12",
    textColor: "text-red-400",
    pulsing: true,
  },
  {
    emoji: "🔋",
    baslik: "Şarjım bitiyor",
    microcopy: "2 dakikada en yakın istasyonu buluruz.",
    href: "/sarj-hesaplayici",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/6",
    hoverBorder: "hover:border-yellow-500/55",
    hoverBg: "hover:bg-yellow-500/10",
    textColor: "text-yellow-400",
    pulsing: false,
  },
  {
    emoji: "❄️",
    baslik: "Menzil düştü",
    microcopy: "Bu normal, soğukta batarya böyle davranır.",
    href: "/rehber/sarj/kisin-togg-sarj-etme-soguk-hava-batarya-ve-menzil-uzerindeki-etkisi",
    border: "border-blue-500/30",
    bg: "bg-blue-500/6",
    hoverBorder: "hover:border-blue-500/55",
    hoverBg: "hover:bg-blue-500/10",
    textColor: "text-blue-400",
    pulsing: false,
  },
  {
    emoji: "🚨",
    baslik: "Yolda kaldım",
    microcopy: "Yalnız değilsin, hemen yardım çağıralım.",
    href: "/rehber/bakim/acil-durum-ve-kurtarma",
    border: "border-orange-500/30",
    bg: "bg-orange-500/6",
    hoverBorder: "hover:border-orange-500/55",
    hoverBg: "hover:bg-orange-500/10",
    textColor: "text-orange-400",
    pulsing: false,
  },
  {
    emoji: "📱",
    baslik: "Ekran dondu / karardı",
    microcopy: "Paniklemeden önce şunu dene.",
    href: "/rehber/yazilim",
    border: "border-purple-500/30",
    bg: "bg-purple-500/6",
    hoverBorder: "hover:border-purple-500/55",
    hoverBg: "hover:bg-purple-500/10",
    textColor: "text-purple-400",
    pulsing: false,
  },
  {
    emoji: "🗺️",
    baslik: "Uzun yola çıkacağım",
    microcopy: "Şarj planlaması yaparak rahat git.",
    href: "/rehber/suruculuk/togg-t10x-ile-uzun-yolculuk-planlama-sarj-duraklarini-nasil-ayarlarsin",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/6",
    hoverBorder: "hover:border-emerald-500/55",
    hoverBg: "hover:bg-emerald-500/10",
    textColor: "text-emerald-400",
    pulsing: false,
  },
];

export default function PanikButonu() {
  return (
    <section className="relative bg-slate-950 px-4 py-14 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-[350px] w-[350px] rounded-full bg-red-600/6 blur-[100px]" />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
              Hızlı Yardım
            </span>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl">Şu an ne yaşıyorsun?</h2>
          <p className="mt-2 text-sm text-slate-400">Durumunu seç, tek tıkla cevaba ulaş</p>
        </div>

        {/* Senaryo grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SENARYOLAR.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`group flex items-center gap-4 rounded-2xl border ${s.border} ${s.bg} ${s.hoverBorder} ${s.hoverBg} px-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
              style={{ minHeight: "72px", paddingTop: "14px", paddingBottom: "14px" }}
            >
              {/* Emoji badge */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                {s.emoji}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className={`font-semibold leading-snug ${s.pulsing ? s.textColor : "text-white"}`}>
                  {s.baslik}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                  {s.microcopy}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${s.textColor} opacity-60 group-hover:opacity-100`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Alt güven metni */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Acil durumda Togg Care:{" "}
          <a href="tel:08502228644" className="text-slate-400 hover:text-white transition-colors">
            0 850 222 86 44
          </a>
        </p>
      </div>
    </section>
  );
}
