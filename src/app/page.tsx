import Link from "next/link";
import Image from "next/image";
import { getTumRehberler } from "@/lib/content/rehber";
import { getTumHaberler } from "@/lib/content/haberler";
import HaberlerSlider from "@/components/haberler/HaberlerSlider";
import AnimatedSection from "@/components/ui/AnimatedSection";
import StatsTicker from "@/components/ui/StatsTicker";
import SpotlightCard from "@/components/ui/SpotlightCard";
import PanikButonu from "@/components/ui/PanikButonu";

const IMG = {
  hero: "https://www.togg.com.tr/assets/img/670514f6bb5c7ba993aec863_T10X-More-than-a-car.webp",
  t10x: "https://www.togg.com.tr/assets/img/673474f2a1df032a4a3b902b_t10x-slide-1.webp",
  t10f: "https://www.togg.com.tr/assets/img/68e3d6389c2e690c9497ead8_T10F_4More_Section_BG.webp",
};

const kategoriler = [
  {
    slug: "sarj",
    label: "Şarj & Batarya",
    aciklama: "Evde ve yolda şarj, Trugo ağı, batarya ömrü",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "rgba(234,179,8,0.15)",
    border: "rgba(234,179,8,0.35)",
    text: "text-yellow-400",
  },
  {
    slug: "yazilim",
    label: "Yazılım & T-UI",
    aciklama: "OTA güncellemeler, T-UI ipuçları, uygulama",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "rgba(139,92,246,0.15)",
    border: "rgba(139,92,246,0.35)",
    text: "text-violet-400",
  },
  {
    slug: "bakim",
    label: "Bakım & Servis",
    aciklama: "Periyodik bakım, servis ağı, öneriler",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    color: "rgba(249,115,22,0.15)",
    border: "rgba(249,115,22,0.35)",
    text: "text-orange-400",
  },
  {
    slug: "suruculuk",
    label: "Sürüş İpuçları",
    aciklama: "Menzil optimizasyonu, kış sürüşü, uzun yol",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    color: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.35)",
    text: "text-emerald-400",
  },
];

export default function AnaSayfa() {
  const sonRehberler = getTumRehberler().slice(0, 6);
  const haberler = getTumHaberler();

  return (
    <div className="bg-black text-white">

      {/* ─── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[72vh] flex-col items-center justify-end overflow-hidden pb-16 text-center">
        <Image
          src={IMG.hero}
          alt="Togg T10X"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black" />

        {/* Ambient orbs */}
        <div className="absolute -bottom-24 -left-24 h-[500px] w-[500px] rounded-full bg-[var(--togg-red)]/12 blur-[130px] pointer-events-none" />
        <div className="absolute -right-16 top-8 h-[350px] w-[350px] rounded-full bg-blue-900/12 blur-[90px] pointer-events-none" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--togg-red)]" />
            Bağımsız Kullanıcı Rehberi
          </div>
          <h1 className="mb-4 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
            Togg&apos;unuzu En İyi{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #ff1744 0%, #ff6b6b 100%)" }}
            >
              Şekilde Kullanın
            </span>
          </h1>
          <p className="mb-7 text-base text-white/60 md:text-lg">
            T10X ve T10F sahipleri için şarj, yazılım, bakım ve sürüş rehberleri.
            <br className="hidden md:block" />
            Gerçek sahipten, gerçek deneyimle.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/rehber"
              className="rounded-full bg-white px-7 py-3 text-sm font-bold text-black transition-all hover:bg-neutral-100 hover:scale-[1.02]"
            >
              Rehberlere Göz At
            </Link>
            <Link
              href="/ikaz-arama"
              className="rounded-full border border-white/25 bg-white/8 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/40"
            >
              İkaz Lambası Tanı
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PANİK BUTONU ────────────────────────────────────────────────────── */}
      <PanikButonu />

      {/* ─── STATS TICKER ────────────────────────────────────────────────────── */}
      <StatsTicker />

      {/* ─── 2. MODEL KARTLARI ───────────────────────────────────────────────── */}
      <section className="bg-neutral-950 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection>
            <p className="mb-1.5 text-center text-xs font-bold uppercase tracking-[0.3em] text-neutral-600">
              Türkiye&apos;nin Yerli Elektrikli Otomobili
            </p>
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">İki Model, Bir Vizyon</h2>
          </AnimatedSection>

          <div className="grid gap-5 md:grid-cols-2">
            {/* T10X */}
            <AnimatedSection delay={50}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition-all duration-300 hover:border-white/20">
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={IMG.t10x}
                    alt="Togg T10X"
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                    T10X
                  </div>
                </div>
                <div className="p-5">
                  <p className="mb-3 text-sm text-neutral-400">Tek Motor · RWD · Togg&apos;un ilk modeli</p>
                  <div className="mb-4 flex gap-4">
                    {[
                      { val: "523 km", lbl: "Menzil" },
                      { val: "218 PS", lbl: "Güç" },
                      { val: "7.4 sn", lbl: "0–100" },
                    ].map((s) => (
                      <div key={s.lbl}>
                        <p className="text-lg font-bold">{s.val}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">{s.lbl}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/modeller/t10x"
                      className="flex-1 rounded-xl bg-white/8 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Model Detayı
                    </Link>
                    <Link
                      href="/rehber?model=t10x"
                      className="flex-1 rounded-xl border border-white/10 py-2 text-center text-sm font-semibold text-neutral-400 transition hover:text-white hover:border-white/20"
                    >
                      T10X Rehberi
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* T10F */}
            <AnimatedSection delay={120}>
              <div className="group relative overflow-hidden rounded-2xl border border-[var(--togg-red)]/20 bg-neutral-900 transition-all duration-300 hover:border-[var(--togg-red)]/35">
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={IMG.t10f}
                    alt="Togg T10F AWD"
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <div className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                      T10F
                    </div>
                    <div className="rounded-full bg-[var(--togg-red)]/80 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm">
                      4More · AWD
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="mb-3 text-sm text-neutral-400">Çift Motor · AWD · Maksimum Performans</p>
                  <div className="mb-4 flex gap-4">
                    {[
                      { val: "623 km", lbl: "Menzil" },
                      { val: "435 PS", lbl: "Güç" },
                      { val: "4.1 sn", lbl: "0–100" },
                    ].map((s) => (
                      <div key={s.lbl}>
                        <p className="text-lg font-bold">{s.val}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">{s.lbl}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/modeller/t10f"
                      className="flex-1 rounded-xl bg-[var(--togg-red)]/15 py-2 text-center text-sm font-semibold text-[var(--togg-red)] transition hover:bg-[var(--togg-red)]/25"
                    >
                      Model Detayı
                    </Link>
                    <Link
                      href="/modeller/karsilastir"
                      className="flex-1 rounded-xl border border-white/10 py-2 text-center text-sm font-semibold text-neutral-400 transition hover:text-white hover:border-white/20"
                    >
                      Karşılaştır
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── 3. BENTO FEATURES ───────────────────────────────────────────────── */}
      <section className="relative bg-neutral-950 px-4 py-20 overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[var(--togg-red)]/8 blur-[160px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-purple-600/6 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl">
          <AnimatedSection>
            <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.3em] text-[var(--togg-red)]">
              Ne Sunuyoruz
            </p>
            <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
              Sadece Bir Rehber Değil
            </h2>
          </AnimatedSection>

          <div className="grid gap-4 md:grid-cols-5 md:grid-rows-2">

            {/* AI İkaz — büyük kart */}
            <AnimatedSection className="md:col-span-3 md:row-span-2" delay={50}>
              <SpotlightCard
                spotlightColor="rgba(232,0,45,0.12)"
                className="group h-full rounded-2xl border border-[var(--togg-red)]/20 bg-neutral-900 p-8 transition-all duration-300 hover:border-[var(--togg-red)]/40"
              >
                <div className="flex h-full flex-col">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--togg-red)]/15 text-[var(--togg-red)]">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">AI İkaz Tanıma</h3>
                  <p className="mb-6 text-sm leading-relaxed text-neutral-300">
                    Dashboard&apos;da yanan sembolü fotoğrafla ya da tanımla — yapay zeka saniyeler içinde ne olduğunu ve ne yapman gerektiğini söylesin.
                  </p>
                  <div className="mt-auto">
                    <div className="mb-5 flex gap-2">
                      {[
                        { dot: "bg-red-500", label: "Kritik", count: "12", bg: "bg-red-500/10" },
                        { dot: "bg-yellow-500", label: "Uyarı", count: "28", bg: "bg-yellow-500/10" },
                        { dot: "bg-blue-400", label: "Bilgi", count: "14", bg: "bg-blue-500/10" },
                      ].map((s) => (
                        <div key={s.label} className={`flex flex-1 flex-col gap-1.5 rounded-xl ${s.bg} border border-white/8 p-3`}>
                          <div className={`h-2 w-2 rounded-full ${s.dot}`} />
                          <p className="text-xs text-neutral-400">{s.label}</p>
                          <p className="text-lg font-bold">{s.count}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/ikaz-arama"
                      className="flex items-center gap-2 text-sm font-semibold text-[var(--togg-red)] transition-colors group-hover:text-red-400"
                    >
                      Hemen Dene
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedSection>

            {/* Rehber */}
            <AnimatedSection className="md:col-span-2" delay={150}>
              <SpotlightCard
                spotlightColor="rgba(59,130,246,0.12)"
                className="group h-full rounded-2xl border border-blue-500/20 bg-neutral-900 p-7 transition-all duration-300 hover:border-blue-500/40"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Kapsamlı Rehberler</h3>
                <p className="text-sm leading-relaxed text-neutral-300">
                  Şarj, yazılım, kış sürüşü ve bakım için gerçek deneyime dayalı içerikler.
                </p>
                <Link
                  href="/rehber"
                  className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-blue-400 transition-colors group-hover:text-blue-300"
                >
                  Keşfet
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </SpotlightCard>
            </AnimatedSection>

            {/* Karşılaştır */}
            <AnimatedSection className="md:col-span-2" delay={200}>
              <SpotlightCard
                spotlightColor="rgba(16,185,129,0.12)"
                className="group h-full rounded-2xl border border-emerald-500/20 bg-neutral-900 p-7 transition-all duration-300 hover:border-emerald-500/40"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">T10X vs T10F</h3>
                <p className="text-sm leading-relaxed text-neutral-300">
                  İki modeli tüm teknik özellikleriyle yan yana karşılaştır.
                </p>
                <Link
                  href="/modeller/karsilastir"
                  className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-emerald-400 transition-colors group-hover:text-emerald-300"
                >
                  Karşılaştır
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </SpotlightCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── 4. REHBer KATEGORİLERİ ──────────────────────────────────────────── */}
      <section className="bg-neutral-950 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <h2 className="mb-8 text-2xl font-bold">Rehber Kategorileri</h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {kategoriler.map((kat, i) => (
              <AnimatedSection key={kat.slug} delay={i * 60}>
                <SpotlightCard
                  spotlightColor="rgba(255,255,255,0.06)"
                  className="group h-full rounded-2xl border bg-neutral-900 p-5 transition-all duration-300"
                  style={{ borderColor: kat.border } as React.CSSProperties}
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${kat.text}`}
                    style={{ background: kat.color }}
                  >
                    {kat.icon}
                  </div>
                  <p className="font-bold">{kat.label}</p>
                  <p className="mt-1.5 text-sm leading-snug text-neutral-400">{kat.aciklama}</p>
                  <Link href={`/rehber/${kat.slug}`} className="absolute inset-0" aria-label={kat.label} />
                </SpotlightCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. SON REHBERLER ────────────────────────────────────────────────── */}
      {sonRehberler.length > 0 && (
        <section className="relative bg-neutral-950 px-4 py-16 overflow-hidden">
          <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/6 blur-[120px]" />
          <div className="relative mx-auto max-w-6xl">
            <AnimatedSection>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Son Rehberler</h2>
                <Link href="/rehber" className="text-sm font-semibold text-[var(--togg-red)] hover:text-red-400 transition-colors">
                  Tümünü gör →
                </Link>
              </div>
            </AnimatedSection>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sonRehberler.map((rehber, i) => (
                <AnimatedSection key={`${rehber.kategori}/${rehber.slug}`} delay={i * 50}>
                  <SpotlightCard className="group h-full rounded-2xl border border-white/10 bg-neutral-900 p-6 transition-all duration-300 hover:border-white/20">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-300">
                        {rehber.kategori}
                      </span>
                      {rehber.model !== "hepsi" && (
                        <span className="rounded-full bg-[var(--togg-red)]/15 px-2.5 py-0.5 text-xs font-medium uppercase text-[var(--togg-red)]">
                          {rehber.model}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold leading-snug transition-colors group-hover:text-[var(--togg-red)]">
                      {rehber.baslik}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-400">
                      {rehber.ozet}
                    </p>
                    {rehber.sure && (
                      <p className="mt-4 text-xs text-neutral-500">{rehber.sure} dk okuma</p>
                    )}
                    <Link href={`/rehber/${rehber.kategori}/${rehber.slug}`} className="absolute inset-0" aria-label={rehber.baslik} />
                  </SpotlightCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 6. HABERLER ─────────────────────────────────────────────────────── */}
      <div className="border-t border-white/12 bg-neutral-950">
        <HaberlerSlider haberler={haberler} />
      </div>

    </div>
  );
}
