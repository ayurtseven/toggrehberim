import fs from "fs";
import path from "path";
import Link from "next/link";
import IcerikListesi, { type IcerikKarti } from "./IcerikListesi";

const KOK = /*turbopackIgnore: true*/ process.cwd();

function mdxDosyalariOku(klasorYolu: string, tur: "haber" | "rehber", taslak: boolean): IcerikKarti[] {
  if (!fs.existsSync(klasorYolu)) return [];

  const sonuc: IcerikKarti[] = [];

  if (tur === "haber") {
    const dosyalar = fs.readdirSync(klasorYolu).filter((f) => f.endsWith(".mdx"));
    for (const dosya of dosyalar) {
      const tamYol = path.join(klasorYolu, dosya);
      const icerik = fs.readFileSync(tamYol, "utf-8");
      const frontmatter = icerik.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      const baslik = frontmatter.match(/baslik:\s*"([^"]+)"/)?.[1] || dosya.replace(".mdx", "");
      const tarih = frontmatter.match(/tarih:\s*([^\n]+)/)?.[1]?.trim() || "";
      const ozet = frontmatter.match(/ozet:\s*"([^"]+)"/)?.[1];
      const model = frontmatter.match(/model:\s*([^\n]+)/)?.[1]?.trim();
      const etiketlerMatch = frontmatter.match(/etiketler:\s*\[([^\]]*)\]/);
      const etiketler = etiketlerMatch
        ? etiketlerMatch[1].split(",").map((e) => e.trim().replace(/['"]/g, "")).filter(Boolean)
        : [];
      const body = icerik.replace(/^---[\s\S]*?---\n/, "").slice(0, 200).replace(/[#*`]/g, "").trim();
      const goreceli = tamYol.replace(KOK + path.sep, "").replace(/\\/g, "/");
      sonuc.push({ dosya: goreceli, baslik, tarih, tur: "haber", taslak, ozet, model, etiketler, onizleme: body || undefined });
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
        const frontmatter = icerik.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
        const baslik = frontmatter.match(/baslik:\s*"([^"]+)"/)?.[1] || dosya.replace(".mdx", "");
        const tarih = frontmatter.match(/tarih:\s*([^\n]+)/)?.[1]?.trim() || "";
        const ozet = frontmatter.match(/ozet:\s*"([^"]+)"/)?.[1];
        const model = frontmatter.match(/model:\s*([^\n]+)/)?.[1]?.trim();
        const etiketlerMatch = frontmatter.match(/etiketler:\s*\[([^\]]*)\]/);
        const etiketler = etiketlerMatch
          ? etiketlerMatch[1].split(",").map((e) => e.trim().replace(/['"]/g, "")).filter(Boolean)
          : [];
        const body = icerik.replace(/^---[\s\S]*?---\n/, "").slice(0, 200).replace(/[#*`]/g, "").trim();
        const goreceli = tamYol.replace(KOK + path.sep, "").replace(/\\/g, "/");
        sonuc.push({ dosya: goreceli, baslik, tarih, tur: "rehber", kategori: kat, taslak, ozet, model, etiketler, onizleme: body || undefined });
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

const NAV_LINKLER = [
  { href: "/admin/tarama", label: "Tarama", ikon: "🔍", renk: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { href: "/admin/ikazlar", label: "İkazlar", ikon: "⚠️", renk: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { href: "/admin/servis", label: "Servisler", ikon: "🔧", renk: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { href: "/admin/istasyonlar", label: "İstasyonlar", ikon: "⚡", renk: "text-[var(--togg-red)] bg-[var(--togg-red)]/10 border-[var(--togg-red)]/20" },
  { href: "/admin/deneyimler", label: "Deneyimler", ikon: "💬", renk: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { href: "/admin/analytics", label: "Analytics", ikon: "📊", renk: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { href: "/klavuz-ara", label: "Kılavuz", ikon: "📚", renk: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { href: "/", label: "Siteye Dön", ikon: "←", renk: "text-slate-400 bg-white/3 border-white/10" },
];

export default function AdminPage() {
  const icerikler = tumIcerikleriOku();
  const taslaklar = icerikler.filter((i) => i.taslak);
  const yayinlananlar = icerikler.filter((i) => !i.taslak);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        {/* Başlık + istatistik */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {taslaklar.length} taslak · {yayinlananlar.length} yayında
            </p>
          </div>
        </div>

        {/* Nav grid */}
        <div className="mb-8 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {NAV_LINKLER.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center text-xs font-medium transition hover:opacity-90 ${l.renk}`}
            >
              <span className="text-lg">{l.ikon}</span>
              <span className="leading-tight">{l.label}</span>
            </Link>
          ))}
        </div>

        {/* İçerik listeleri */}
        <IcerikListesi baslik="Bekleyen Taslaklar" renk="yellow" icerikler={taslaklar} />
        <IcerikListesi baslik="Yayındaki İçerikler" renk="green" icerikler={yayinlananlar} />
      </div>
    </div>
  );
}
