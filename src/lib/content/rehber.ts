import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

export interface RehberMeta {
  slug: string;
  baslik: string;
  ozet: string;
  kategori: string;
  model?: "t10x" | "t10f" | "hepsi";
  etiketler?: string[];
  tarih: string;
  guncelleme?: string;
  sure?: number; // dakika cinsinden okuma süresi
}

export interface Rehber extends RehberMeta {
  icerik: string;
}

export function getRehberslugs(kategori?: string): string[] {
  const dir = kategori
    ? path.join(contentDir, "rehber", kategori)
    : path.join(contentDir, "rehber");

  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { recursive: !kategori })
    .filter((f) => String(f).endsWith(".mdx"))
    .map((f) => String(f).replace(/\.mdx$/, ""));
}

export function getRehber(slug: string, kategori: string): Rehber | null {
  const filePath = path.join(contentDir, "rehber", kategori, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    baslik: data.baslik ?? "",
    ozet: data.ozet ?? "",
    kategori,
    model: data.model ?? "hepsi",
    etiketler: data.etiketler ?? [],
    tarih: data.tarih ?? "",
    guncelleme: data.guncelleme,
    sure: data.sure,
    icerik: content,
  };
}

export function getTumRehberler(): RehberMeta[] {
  const kategoriler = ["sarj", "yazilim", "bakim", "suruculuk", "sss"];
  const rehberler: RehberMeta[] = [];

  for (const kategori of kategoriler) {
    const slugs = getRehberslugs(kategori);
    for (const slug of slugs) {
      const rehber = getRehber(slug, kategori);
      if (rehber) {
        const { icerik: _, ...meta } = rehber;
        rehberler.push(meta);
      }
    }
  }

  return rehberler.sort(
    (a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()
  );
}
