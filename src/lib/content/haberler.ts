import fs from "fs";
import path from "path";
import matter from "gray-matter";

const haberlerDir = path.join(process.cwd(), "content", "haberler");

export interface HaberMeta {
  slug: string;
  baslik: string;
  ozet: string;
  tarih: string;
  resim?: string;
  kaynak?: string;
  etiketler?: string[];
}

export function getTumHaberler(): HaberMeta[] {
  if (!fs.existsSync(haberlerDir)) return [];

  const dosyalar = fs
    .readdirSync(haberlerDir)
    .filter((f) => f.endsWith(".mdx"));

  return dosyalar
    .map((dosya) => {
      const slug = dosya.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(haberlerDir, dosya), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        baslik: data.baslik ?? "",
        ozet: data.ozet ?? "",
        tarih: data.tarih ?? "",
        resim: data.resim,
        kaynak: data.kaynak,
        etiketler: data.etiketler ?? [],
      } as HaberMeta;
    })
    .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
}
