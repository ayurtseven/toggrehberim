import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Toggça → Türkçe Sözlük — Teknik Terimlerin Sade Açıklamaları",
  description:
    "OTA, regen frenleme, heat pump, SoC, V2L... Togg'un ekranında veya el kitabında gördüğün teknik terimlerin sade Türkçe açıklamaları.",
  keywords: [
    "togg terimler sözlüğü",
    "ota ne demek",
    "regen frenleme ne demek",
    "togg teknik terimler",
    "elektrikli araba terimler",
  ],
};

interface Terim {
  teknik: string;
  turkce: string;
  aciklama: string;
  kategori: "sarj" | "yazilim" | "suruculuk" | "guvenlik" | "bakim";
  ilgiliHref?: string;
}

const KATEGORILER: Record<Terim["kategori"], { etiket: string; renk: string; bg: string }> = {
  sarj:      { etiket: "Şarj & Batarya", renk: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/25" },
  yazilim:   { etiket: "Ekran & Yazılım", renk: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/25" },
  suruculuk: { etiket: "Sürüş",           renk: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/25" },
  guvenlik:  { etiket: "Güvenlik",         renk: "text-red-400",    bg: "bg-red-500/10 border-red-500/25" },
  bakim:     { etiket: "Bakım & Servis",  renk: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
};

const TERIMLER: Terim[] = [
  /* ─── ŞARJ & BATARYA ─── */
  {
    teknik: "OBC (On-Board Charger)",
    turkce: "Araç içi şarj ünitesi",
    aciklama:
      "Arabanın içinde gömülü olan şarj cihazı. Evinizden veya normal şarj istasyonundan gelen elektriği, bataryanın anlayacağı forma çeviren parça. AC şarjda devreye girer; DC hızlı şarjda devre dışı kalır.",
    kategori: "sarj",
    ilgiliHref: "/rehber/sarj",
  },
  {
    teknik: "SoC (State of Charge)",
    turkce: "Batarya doluluk oranı",
    aciklama:
      "Ekranda gördüğünüz % rakamı. %80 SoC = batarya %80 dolu demek. Togg, uzun ömür için %20–%80 arasında tutmanızı önerir.",
    kategori: "sarj",
    ilgiliHref: "/rehber/sarj/togg-bataryasini-koruma-20-80-sarj-aliskanliginin-onemi",
  },
  {
    teknik: "AC Şarj",
    turkce: "Normal (yavaş) şarj",
    aciklama:
      "Evinizin prizinden veya normal şarj istasyonlarından yapılan şarj. Genellikle saatler sürer. Günlük kullanım için idealdir, bataryaya nazik gelir.",
    kategori: "sarj",
  },
  {
    teknik: "DC Hızlı Şarj",
    turkce: "Hızlı şarj",
    aciklama:
      "Yolda gördüğünüz büyük şarj istasyonlarındaki hızlı şarj. 20 dakika ile %80'e ulaşabilirsiniz. Seyahat için harika, ama her gün kullanmak bataryayı yıpratır.",
    kategori: "sarj",
  },
  {
    teknik: "Heat Pump",
    turkce: "Isı pompası",
    aciklama:
      "Kışın ısınma sisteminin kalbi. Klima gibi çalışır ama dışarıdan ısı alıp içeriye verir. Yokluğunda araç ısınmak için bataryadan doğrudan güç çeker ve menzil düşer.",
    kategori: "sarj",
  },
  {
    teknik: "V2L (Vehicle to Load)",
    turkce: "Araçtan elektrik alma",
    aciklama:
      "Togg'un bataryasından dışarıya elektrik verme özelliği. Bir uzatma kablosuyla arabanıza bağladığınız cihazları şarj edebilir, hatta küçük ev aletleri çalıştırabilirsiniz.",
    kategori: "sarj",
  },
  {
    teknik: "Preconditioning",
    turkce: "Ön ısıtma / soğutma",
    aciklama:
      "Araca binmeden önce telefon uygulamasından kabin sıcaklığını ayarlama özelliği. Araç prize takılıyken kullanırsanız batarya harcanmaz, fişten çekilir.",
    kategori: "sarj",
  },

  /* ─── YAZILIM ─── */
  {
    teknik: "OTA (Over-the-Air) Güncelleme",
    turkce: "Kablosuz yazılım güncellemesi",
    aciklama:
      "Telefonunuza gelen uygulama güncellemesi gibi, aracın yazılımının internet üzerinden güncellenmesi. Servise gitmenize gerek yoktur. Araç kapalıyken otomatik indirir, siz onaylayınca yükler.",
    kategori: "yazilim",
    ilgiliHref: "/rehber/yazilim/togg-ota-guncellemesi-nasil-yapilir-guncelleme-oncesi-kontrol-listesi",
  },
  {
    teknik: "HMI (Human-Machine Interface)",
    turkce: "Direksiyon ve ekran kontrol sistemi",
    aciklama:
      "Araçtaki dokunmatik ekran, direksiyon düğmeleri ve ses komutlarının hepsini kapsayan sistem. 'HMI dondu' derseniz ekran yanıt vermez hale gelmiş demektir.",
    kategori: "yazilim",
    ilgiliHref: "/rehber/yazilim",
  },
  {
    teknik: "Vale Modu",
    turkce: "Otopark görevlisi modu",
    aciklama:
      "Aracı birisine teslim ettiğinizde (otopark, servis) araç hızını ve erişimi kısıtlayan mod. Bu modda kişisel ayarlarınıza ve kayıtlı verilere ulaşılamaz.",
    kategori: "yazilim",
    ilgiliHref: "/rehber/yazilim/togg-vale-modu-nedir-nasil-kullanilir",
  },
  {
    teknik: "OTA Rollback",
    turkce: "Yazılım geri alma",
    aciklama:
      "Güncelleme sonrası sorun yaşarsanız bir önceki yazılım versiyonuna dönme işlemi. Genellikle Togg servisi yapar; kendiniz yapamazsınız.",
    kategori: "yazilim",
  },

  /* ─── SÜRÜŞ ─── */
  {
    teknik: "Regen Frenleme (Rejeneratif)",
    turkce: "Geri kazanımlı frenleme",
    aciklama:
      "Frene bastığınızda veya gaz pedaldan ayağınızı çektiğinizde motor jeneratöre döner ve hem fren kuvveti üretir hem de bataryayı şarj eder. Kalkış-durakları fazla şehir trafiğinde menzili uzatır.",
    kategori: "suruculuk",
    ilgiliHref: "/rehber/suruculuk/enerji-geri-kazanimi",
  },
  {
    teknik: "One-Pedal Driving",
    turkce: "Tek pedalla sürüş",
    aciklama:
      "Gaz pedalından ayağı çekince aracın yavaşlaması ve durması. Fren pedala hiç basmadan sadece gaz pedalıyla sürmenizi sağlar. Şehirde çok pratiktir.",
    kategori: "suruculuk",
  },
  {
    teknik: "AWD (All Wheel Drive)",
    turkce: "Dört çeker",
    aciklama:
      "Dört tekerleğe de güç giden sistem. T10F'de bulunur. Islak, karlı veya kaygan yollarda çok daha iyi tutuş sağlar.",
    kategori: "suruculuk",
  },
  {
    teknik: "RWD (Rear Wheel Drive)",
    turkce: "Arkadan çeker",
    aciklama:
      "Sadece arka tekerleklere güç giden sistem. T10X standart konfigürasyonda arkadan çeker.",
    kategori: "suruculuk",
  },
  {
    teknik: "Sport Modu / 4More",
    turkce: "Spor mod",
    aciklama:
      "T10F'e özel. Motorların tam gücünü serbest bırakır (435 PS). Hızlanma kabiliyeti artar ama batarya tüketimi de ciddi ölçüde artar. Uzun yolculukta kullanmayın.",
    kategori: "suruculuk",
    ilgiliHref: "/rehber/suruculuk/togg-t10f-4more-sport-modu-ne-zaman-kullanilir-ne-zaman-kacinilir",
  },
  {
    teknik: "ADAS",
    turkce: "Gelişmiş sürüş destek sistemleri",
    aciklama:
      "Şerit takip, adaptif hız sabitleyici, acil fren yardımı gibi güvenlik özelliklerinin toplu adı. Araç aniden fren yapıyorsa veya direksiyonu çekiyorsa ADAS devrededir.",
    kategori: "suruculuk",
    ilgiliHref: "/rehber/suruculuk/surucu-yardim-sistemleri",
  },

  /* ─── GÜVENLİK ─── */
  {
    teknik: "BMS (Battery Management System)",
    turkce: "Batarya yönetim sistemi",
    aciklama:
      "Bataryayı 7/24 izleyen, aşırı ısınmayı ve aşırı şarjı önleyen gömülü yazılım. Çoğu batarya ikaz lambası aslında BMS'nin bir uyarısıdır.",
    kategori: "guvenlik",
  },
  {
    teknik: "Thermal Runaway",
    turkce: "Batarya ısıl kaçışı",
    aciklama:
      "Bataryanın kontrolsüz şekilde ısınması ve yangın riskine girmesi. Son derece nadir fakat ciddi bir durum. Araçtan yanık veya duman kokusu geliyorsa hemen uzaklaşın, 112'yi arayın.",
    kategori: "guvenlik",
  },
  {
    teknik: "HV (High Voltage) Sistemi",
    turkce: "Yüksek gerilim sistemi",
    aciklama:
      "Batarya, motor ve hızlı şarj bağlantısını kapsayan 400V sistem. Kaza sonrası araç hasarlıysa kesinlikle dokunmayın; Togg Care'i (0 850 222 86 44) arayın.",
    kategori: "guvenlik",
  },

  /* ─── BAKIM ─── */
  {
    teknik: "TPMS",
    turkce: "Lastik basınç uyarı sistemi",
    aciklama:
      "Lastik basıncı düştüğünde ekranda ikaz üretiyor. Kırmızı TPMS lambası: hemen dur ve lastiği kontrol et. Sarı TPMS: yakında şişir.",
    kategori: "bakim",
  },
  {
    teknik: "12V Yardımcı Batarya",
    turkce: "Küçük akü",
    aciklama:
      "Klasik araçlardaki akü gibi. Kapı kilitleri, aydınlatma ve elektronik sistemleri besler. Bu batarya bitince araç hareket edemez. Her yıl kontrol ettirin.",
    kategori: "bakim",
  },
  {
    teknik: "Cabin Air Filter",
    turkce: "Polen / klima filtresi",
    aciklama:
      "Klimanın içindeki filtre. Elektrikli araçlarda motor yağı değişimi olmaz ama klima filtresi yine değiştirilmeli. Genellikle 15.000–20.000 km'de bir.",
    kategori: "bakim",
  },
];

const KATEGORI_SIRASI: Terim["kategori"][] = ["sarj", "yazilim", "suruculuk", "guvenlik", "bakim"];

export default function SozlukSayfasi() {
  const gruplar = KATEGORI_SIRASI.map((kat) => ({
    kat,
    stil: KATEGORILER[kat],
    terimler: TERIMLER.filter((t) => t.kategori === kat),
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">

        {/* Başlık */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-slate-200">Toggça Sözlük</span>
        </nav>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Terim Rehberi
        </div>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Toggça → Türkçe Sözlük</h1>
        <p className="mt-3 text-slate-400">
          El kitabında veya ekranda gördüğünüz teknik kelimeler Türkçe olarak ne anlama geliyor?
          <br className="hidden md:block" />
          Jargon yok, uzun anlatım yok — sade açıklamalar.
        </p>

        {/* Acil yardım şeridi */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3">
          <span className="text-lg">🚨</span>
          <p className="text-sm text-red-300">
            <strong className="text-red-200">Ekranda bilinmeyen bir ışık mı yandı?</strong>{" "}
            <Link href="/ikaz-arama" className="font-bold text-red-200 underline underline-offset-2 hover:text-red-100">
              AI ile fotoğraftan tanı →
            </Link>
          </p>
        </div>

        {/* İçindekiler */}
        <div className="mt-8 flex flex-wrap gap-2">
          {gruplar.map(({ kat, stil }) => (
            <a
              key={kat}
              href={`#${kat}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80 ${stil.bg} ${stil.renk}`}
            >
              {stil.etiket}
            </a>
          ))}
        </div>

        {/* Terim grupları */}
        <div className="mt-10 space-y-12">
          {gruplar.map(({ kat, stil, terimler }) => (
            <section key={kat} id={kat}>
              <h2 className={`mb-5 text-lg font-bold ${stil.renk}`}>{stil.etiket}</h2>
              <div className="space-y-4">
                {terimler.map((t) => (
                  <div
                    key={t.teknik}
                    className={`rounded-2xl border p-5 ${stil.bg}`}
                  >
                    <div className="mb-1 flex flex-wrap items-baseline gap-3">
                      <span className="font-mono text-sm font-bold text-white">{t.teknik}</span>
                      <span className="text-slate-500">=</span>
                      <span className={`text-sm font-semibold ${stil.renk}`}>{t.turkce}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.aciklama}</p>
                    {t.ilgiliHref && (
                      <Link
                        href={t.ilgiliHref}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300"
                      >
                        Detaylı rehbere git
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Alt not */}
        <div className="mt-14 rounded-2xl border border-white/8 bg-slate-900/40 p-5 text-sm text-slate-500">
          <p className="font-semibold text-slate-400 mb-1">Eksik terim mi gördünüz?</p>
          <p>
            Açıklamasını bulamadığınız bir terim varsa{" "}
            <Link href="/oner" className="text-slate-300 underline underline-offset-2 hover:text-white transition-colors">
              buradan önerin
            </Link>
            , ekleyelim.
          </p>
        </div>

      </div>
    </div>
  );
}
