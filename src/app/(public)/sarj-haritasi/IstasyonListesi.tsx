import type { FavoriIstasyon, IstasyonBaglanti } from "@/app/api/favori-istasyonlar/route";

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const OPERATOR: Record<string, { renk: string; ad: string; url?: string }> = {
  trugo:   { renk: "#e8002d", ad: "Trugo",   url: "https://www.trugo.com.tr" },
  zes:     { renk: "#1d6eff", ad: "ZES",      url: "https://zes.net" },
  esarj:   { renk: "#00c853", ad: "Eşarj",   url: "https://esarj.com" },
  beefull: { renk: "#ff6600", ad: "Beefull",  url: "https://beefull.com" },
  voltrun: { renk: "#8b5cf6", ad: "Voltrun",  url: "https://voltrun.com" },
  sharz:   { renk: "#06b6d4", ad: "Sharz",    url: "https://sharz.net" },
  tesla:   { renk: "#cc0000", ad: "Tesla",    url: "https://www.tesla.com/tr_TR" },
  diger:   { renk: "#6b7280", ad: "Diğer" },
};

const DURUM: Record<
  FavoriIstasyon["durum"],
  { label: string; bg: string; text: string; ring: string; pul: string }
> = {
  musait:    { label: "Müsait",     bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/30", pul: "bg-emerald-500" },
  kismi:     { label: "Kısmi",      bg: "bg-yellow-500/10",  text: "text-yellow-400",  ring: "ring-yellow-500/30",  pul: "bg-yellow-500"  },
  megul:     { label: "Meşgul",     bg: "bg-red-500/10",     text: "text-red-400",     ring: "ring-red-500/30",     pul: "bg-red-500"     },
  kapali:    { label: "Kapalı",     bg: "bg-neutral-700/40", text: "text-neutral-400", ring: "ring-neutral-600/30", pul: "bg-neutral-500" },
  bilinmiyor:{ label: "Bilinmiyor", bg: "bg-white/5",        text: "text-neutral-500", ring: "ring-white/10",       pul: "bg-neutral-600" },
};

const TOGG_UYUMLU = ["CCS", "Type 2", "IEC 62196", "Mennekes"];

function toggUyumluMu(tip: string) {
  return TOGG_UYUMLU.some((t) => tip.includes(t));
}

function zamanFarki(iso: string | null): string {
  if (!iso) return "";
  const fark = (Date.now() - new Date(iso).getTime()) / 1000;
  if (fark < 60) return "az önce güncellendi";
  if (fark < 3600) return `${Math.floor(fark / 60)} dk önce güncellendi`;
  if (fark < 86400) return `${Math.floor(fark / 3600)} sa önce güncellendi`;
  return `${Math.floor(fark / 86400)} gün önce güncellendi`;
}

// ─── Soket rozeti ─────────────────────────────────────────────────────────────
function SoketRozeti({ b }: { b: IstasyonBaglanti }) {
  const uyumlu = toggUyumluMu(b.tip);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        b.tipSinifi === "dc"
          ? "bg-[var(--togg-red)]/10 text-[var(--togg-red)]"
          : "bg-blue-500/10 text-blue-400"
      }`}
    >
      {b.tipSinifi === "dc" ? "⚡" : "🔌"}
      {b.tip}
      {b.gucKW && <span className="opacity-70">· {b.gucKW} kW</span>}
      <span className="opacity-50">×{b.adet}</span>
      {uyumlu && (
        <span className="rounded-full bg-[var(--togg-red)]/20 px-1 text-[9px] font-bold text-[var(--togg-red)]">
          T
        </span>
      )}
    </span>
  );
}

// ─── İstasyon kartı ───────────────────────────────────────────────────────────
function IstasyonKarti({ ist }: { ist: FavoriIstasyon }) {
  const op = OPERATOR[ist.operator] || OPERATOR.diger;
  const durum = DURUM[ist.durum];
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${ist.lat},${ist.lng}&travelmode=driving`;
  const zaman = zamanFarki(ist.durumGuncelleme);
  const toplamSoket = ist.baglantilar.reduce((s, b) => s + b.adet, 0);
  const maxKW = Math.max(0, ...ist.baglantilar.map((b) => b.gucKW || 0));

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-neutral-900 p-5 transition-all duration-200 hover:border-white/20 ring-1 ${durum.ring}`}
      style={{ borderColor: `${op.renk}25` }}
    >
      {/* Üst: durum + operatör */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${durum.bg} ${durum.text} ${durum.ring}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${durum.pul} ${ist.durum === "musait" ? "animate-pulse" : ""}`} />
          {durum.label}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ background: op.renk }}
          />
          <span className="text-xs font-semibold text-neutral-400">{op.ad}</span>
        </div>
      </div>

      {/* Başlık */}
      <h2 className="mb-1 text-base font-bold leading-snug text-white group-hover:text-[var(--togg-red)] transition-colors">
        {ist.ad}
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        📍 {ist.ilce && `${ist.ilce}, `}{ist.sehir}
        {ist.adres && <span className="block text-xs mt-0.5 text-neutral-600">{ist.adres}</span>}
      </p>

      {/* Soket rozetleri */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {ist.baglantilar.map((b, i) => (
          <SoketRozeti key={i} b={b} />
        ))}
      </div>

      {/* Hızlı stat */}
      <div className="mb-4 flex items-center gap-4 text-xs text-neutral-500">
        <span><span className="font-semibold text-white">{toplamSoket}</span> soket</span>
        {maxKW > 0 && <span>maks <span className="font-semibold text-white">{maxKW} kW</span></span>}
      </div>

      {/* Durum notu */}
      {ist.durumNot && (
        <p className="mb-3 rounded-xl bg-white/5 px-3 py-2 text-xs italic text-neutral-400">
          "{ist.durumNot}"
        </p>
      )}

      {/* Zaman */}
      {zaman && (
        <p className="mb-3 text-[11px] text-neutral-600">{zaman}</p>
      )}

      {/* Not */}
      {ist.not && (
        <p className="mb-4 text-xs text-neutral-600">💡 {ist.not}</p>
      )}

      {/* Aksiyon butonları */}
      <div className="mt-auto flex gap-2">
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/10"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Rota Planla
        </a>
        {op.url && (
          <a
            href={op.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all hover:opacity-80"
            style={{ borderColor: `${op.renk}40`, color: op.renk, background: `${op.renk}10` }}
          >
            {op.ad} App
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function IstasyonListesi({ istasyonlar }: { istasyonlar: FavoriIstasyon[] }) {
  const musait  = istasyonlar.filter((i) => i.durum === "musait").length;
  const megul   = istasyonlar.filter((i) => i.durum === "megul").length;
  const kismi   = istasyonlar.filter((i) => i.durum === "kismi").length;

  // Şehirlere göre grupla
  const sehirler = Array.from(new Set(istasyonlar.map((i) => i.sehir))).sort();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Başlık */}
      <div className="border-b border-white/8 bg-neutral-950 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--togg-red)]">
            Kuratörlü Şarj Listesi
          </p>
          <h1 className="mb-2 text-3xl font-bold">Favori İstasyonlar</h1>
          <p className="mb-6 text-sm text-neutral-400">
            Sık kullandığım şarj noktaları — durum bilgisi bizzat gidip güncelleniyor.
          </p>

          {/* Özet istatistikler */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
              <span className="font-bold text-white">{istasyonlar.length}</span>
              <span className="text-neutral-500">istasyon</span>
            </div>
            {musait > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-400">{musait}</span>
                <span className="text-emerald-600">müsait</span>
              </div>
            )}
            {megul > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="font-bold text-red-400">{megul}</span>
                <span className="text-red-600">meşgul</span>
              </div>
            )}
            {kismi > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="font-bold text-yellow-400">{kismi}</span>
                <span className="text-yellow-600">kısmi</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* İstasyon listesi — şehirlere göre gruplu */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        {istasyonlar.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
              ⚡
            </div>
            <p className="text-neutral-400">Henüz istasyon eklenmemiş.</p>
            <p className="text-sm text-neutral-600">
              Admin panelinden favori istasyonlarını ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {sehirler.map((sehir) => {
              const liste = istasyonlar.filter((i) => i.sehir === sehir);
              return (
                <section key={sehir}>
                  <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-neutral-600">
                    <span>{sehir}</span>
                    <span className="flex-1 border-t border-white/8" />
                    <span>{liste.length} istasyon</span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {liste.map((ist) => (
                      <IstasyonKarti key={ist.id} ist={ist} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Açıklama notu */}
        <div className="mt-12 rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-xs text-neutral-600">
          <p className="font-semibold text-neutral-500 mb-1">Bu liste hakkında</p>
          <p>
            Durum bilgileri otomatik değil — istasyonları bizzat ziyaret ettiğimde veya güvenilir
            kaynaklardan öğrendiğimde manuel güncelleniyor. Gerçek zamanlı doğruluk için her zaman
            operatör uygulamasını da kontrol edin.
          </p>
        </div>
      </div>
    </div>
  );
}
