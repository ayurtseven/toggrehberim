import fs from "fs";
import path from "path";
import Link from "next/link";

const KOK = /*turbopackIgnore: true*/ process.cwd();

interface IcerikKarti {
  dosya: string; // content/draft/rehber/sarj/xxx.mdx
  baslik: string;
  tarih: string;
  tur: "haber" | "rehber";
  kategori?: string;
  taslak: boolean;
}

function mdxDosyalariOku(klasorYolu: string, tur: "haber" | "rehber", taslak: boolean): IcerikKarti[] {
  if (!fs.existsSync(klasorYolu)) return [];

  const sonuc: IcerikKarti[] = [];

  if (tur === "haber") {
    const dosyalar = fs.readdirSync(klasorYolu).filter((f) => f.endsWith(".mdx"));
    for (const dosya of dosyalar) {
      const tamYol = path.join(klasorYolu, dosya);
      const icerik = fs.readFileSync(tamYol, "utf-8");
      const baslik = icerik.match(/baslik:\s*"([^"]+)"/)?.[1] || dosya.replace(".mdx", "");
      const tarih = icerik.match(/tarih:\s*([^\n]+)/)?.[1]?.trim() || "";
      const goreceli = tamYol.replace(KOK + path.sep, "").replace(/\\/g, "/");
      sonuc.push({ dosya: goreceli, baslik, tarih, tur: "haber", taslak });
    }
  } else {
    const kategoriler = fs.readdirSync(klasorYolu).filter((k) =>
      fs.statSync(path.join(klasorYolu, k)).isDirectory()
    );
    for (const kat of kategoriler) {
      const katYol = path.join(klasorYolu, kat);
      const dosyalar = fs.readdirSync(katYol).filter((f) => f.endsWith(".mdx"));
      for (const dosya of dosyalar) {
        const tamYol = path.join(katYol, dosya);
        const icerik = fs.readFileSync(tamYol, "utf-8");
        const baslik = icerik.match(/baslik:\s*"([^"]+)"/)?.[1] || dosya.replace(".mdx", "");
        const tarih = icerik.match(/tarih:\s*([^\n]+)/)?.[1]?.trim() || "";
        const goreceli = tamYol.replace(KOK + path.sep, "").replace(/\\/g, "/");
        sonuc.push({ dosya: goreceli, baslik, tarih, tur: "rehber", kategori: kat, taslak });
      }
    }
  }

  return sonuc.sort((a, b) => b.tarih.localeCompare(a.tarih));
}

function tumIcerikleriOku() {
  return [
    ...mdxDosyalariOku(path.join(KOK, "content", "draft", "haberler"), "haber", true),
    ...mdxDosyalariOku(path.join(KOK, "content", "draft", "rehber"), "rehber", true),
    ...mdxDosyalariOku(path.join(KOK, "content", "haberler"), "haber", false),
    ...mdxDosyalariOku(path.join(KOK, "content", "rehber"), "rehber", false),
  ];
}

const KAT_RENK: Record<string, string> = {
  sarj: "bg-blue-500/20 text-blue-300",
  yazilim: "bg-purple-500/20 text-purple-300",
  suruculuk: "bg-green-500/20 text-green-300",
  bakim: "bg-orange-500/20 text-orange-300",
  sss: "bg-gray-500/20 text-gray-300",
  haber: "bg-red-500/20 text-red-300",
};

export default function AdminPage() {
  const icerikler = tumIcerikleriOku();
  const taslaklar = icerikler.filter((i) => i.taslak);
  const yayinlananlar = icerikler.filter((i) => !i.taslak);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">İçerik Yönetimi</h1>
            <p className="mt-1 text-sm text-slate-400">
              {taslaklar.length} taslak · {yayinlananlar.length} yayında
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/tarama"
              className="rounded-lg border border-white/10 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-500/20"
            >
              🔍 Tarama
            </Link>
            <Link
              href="/admin/deneyimler"
              className="rounded-lg border border-white/10 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/20"
            >
              💬 Deneyimler
            </Link>
            <Link
              href="/admin/analytics"
              className="rounded-lg border border-white/10 bg-blue-500/10 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/20"
            >
              📊 Analytics
            </Link>
            <Link
              href="/admin/ikazlar"
              className="rounded-lg border border-white/10 bg-orange-500/10 px-4 py-2 text-sm text-orange-400 hover:bg-orange-500/20"
            >
              ⚠️ İkazlar
            </Link>
            <Link
              href="/klavuz-ara"
              className="rounded-lg border border-white/10 bg-purple-500/10 px-4 py-2 text-sm text-purple-400 hover:bg-purple-500/20"
            >
              📚 Kılavuz Ara
            </Link>
            <Link
              href="/admin/istasyonlar"
              className="rounded-lg border border-white/10 bg-[var(--togg-red)]/10 px-4 py-2 text-sm text-[var(--togg-red)] hover:bg-[var(--togg-red)]/20"
            >
              ⚡ İstasyonlar
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              ← Siteye dön
            </Link>
          </div>
        </div>

        {/* Taslaklar */}
        {taslaklar.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Bekleyen Taslaklar ({taslaklar.length})
            </h2>
            <div className="space-y-2">
              {taslaklar.map((ic) => (
                <IcerikSatiri key={ic.dosya} ic={ic} />
              ))}
            </div>
          </section>
        )}

        {/* Yayındakiler */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Yayındaki İçerikler ({yayinlananlar.length})
          </h2>
          <div className="space-y-2">
            {yayinlananlar.map((ic) => (
              <IcerikSatiri key={ic.dosya} ic={ic} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function IcerikSatiri({ ic }: { ic: IcerikKarti }) {
  const etiket = ic.kategori || ic.tur;
  const renkSinif = KAT_RENK[etiket] || "bg-neutral-500/20 text-neutral-300";
  const editUrl = `/admin/duzenle?dosya=${encodeURIComponent(ic.dosya)}`;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition hover:bg-white/5">
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${renkSinif}`}>
        {etiket}
      </span>
      <span className="flex-1 truncate text-sm text-slate-200">{ic.baslik}</span>
      <span className="shrink-0 text-xs text-slate-500">{ic.tarih}</span>
      <Link
        href={editUrl}
        className="shrink-0 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
      >
        Düzenle
      </Link>
    </div>
  );
}
