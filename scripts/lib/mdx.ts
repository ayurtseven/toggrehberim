import fs from "fs";
import path from "path";

const PROJE_KOK = path.resolve(process.cwd());

export function slugMevcutMu(
  slug: string,
  tur: "haber" | "rehber"
): boolean {
  if (tur === "haber") {
    const dosya = path.join(PROJE_KOK, "content", "haberler", `${slug}.mdx`);
    const taslak = path.join(
      PROJE_KOK,
      "content",
      "draft",
      "haberler",
      `${slug}.mdx`
    );
    return fs.existsSync(dosya) || fs.existsSync(taslak);
  }

  // Rehber için tüm kategori klasörlerini tara
  const rehberKlasoru = path.join(PROJE_KOK, "content", "rehber");
  if (fs.existsSync(rehberKlasoru)) {
    const kategoriler = fs
      .readdirSync(rehberKlasoru)
      .filter((k) =>
        fs.statSync(path.join(rehberKlasoru, k)).isDirectory()
      );
    for (const kat of kategoriler) {
      if (fs.existsSync(path.join(rehberKlasoru, kat, `${slug}.mdx`)))
        return true;
    }
  }

  // Draft rehber klasörü de kontrol et
  const draftRehber = path.join(PROJE_KOK, "content", "draft", "rehber");
  if (fs.existsSync(draftRehber)) {
    const kategoriler = fs
      .readdirSync(draftRehber)
      .filter((k) =>
        fs.statSync(path.join(draftRehber, k)).isDirectory()
      );
    for (const kat of kategoriler) {
      if (fs.existsSync(path.join(draftRehber, kat, `${slug}.mdx`)))
        return true;
    }
  }

  return false;
}

export function taslakKaydet(
  slug: string,
  mdxMetin: string,
  tur: "haber" | "rehber",
  kategori?: string
): string {
  const hedefKlasor =
    tur === "haber"
      ? path.join(PROJE_KOK, "content", "draft", "haberler")
      : path.join(
          PROJE_KOK,
          "content",
          "draft",
          "rehber",
          kategori || "genel"
        );

  fs.mkdirSync(hedefKlasor, { recursive: true });

  const dosyaYolu = path.join(hedefKlasor, `${slug}.mdx`);
  fs.writeFileSync(dosyaYolu, mdxMetin, "utf-8");
  return dosyaYolu;
}

export function taslakYayinla(
  slug: string,
  tur: "haber" | "rehber",
  kategori?: string
): boolean {
  const kat = kategori || "genel";
  const kaynakYol =
    tur === "haber"
      ? path.join(PROJE_KOK, "content", "draft", "haberler", `${slug}.mdx`)
      : path.join(PROJE_KOK, "content", "draft", "rehber", kat, `${slug}.mdx`);

  const hedefYol =
    tur === "haber"
      ? path.join(PROJE_KOK, "content", "haberler", `${slug}.mdx`)
      : path.join(PROJE_KOK, "content", "rehber", kat, `${slug}.mdx`);

  if (!fs.existsSync(kaynakYol)) {
    console.error(`  ✗ Taslak bulunamadı: ${kaynakYol}`);
    return false;
  }

  fs.mkdirSync(path.dirname(hedefYol), { recursive: true });
  fs.renameSync(kaynakYol, hedefYol);
  console.log(`  ✅ Yayınlandı: ${hedefYol}`);
  return true;
}

export function tumTaslaklariListele(): {
  tur: "haber" | "rehber";
  slug: string;
  yol: string;
  baslik: string;
  kategori?: string;
}[] {
  const sonuc: ReturnType<typeof tumTaslaklariListele> = [];

  // Haberler
  const haberDraft = path.join(PROJE_KOK, "content", "draft", "haberler");
  if (fs.existsSync(haberDraft)) {
    for (const dosya of fs
      .readdirSync(haberDraft)
      .filter((f) => f.endsWith(".mdx"))) {
      const yol = path.join(haberDraft, dosya);
      const icerik = fs.readFileSync(yol, "utf-8");
      const baslik =
        icerik.match(/baslik:\s*"([^"]+)"/)?.[1] ||
        dosya.replace(".mdx", "");
      sonuc.push({ tur: "haber", slug: dosya.replace(".mdx", ""), yol, baslik });
    }
  }

  // Rehberler
  const rehberDraft = path.join(PROJE_KOK, "content", "draft", "rehber");
  if (fs.existsSync(rehberDraft)) {
    for (const kat of fs.readdirSync(rehberDraft)) {
      const katYol = path.join(rehberDraft, kat);
      if (!fs.statSync(katYol).isDirectory()) continue;
      for (const dosya of fs
        .readdirSync(katYol)
        .filter((f) => f.endsWith(".mdx"))) {
        const yol = path.join(katYol, dosya);
        const icerik = fs.readFileSync(yol, "utf-8");
        const baslik =
          icerik.match(/baslik:\s*"([^"]+)"/)?.[1] ||
          dosya.replace(".mdx", "");
        sonuc.push({
          tur: "rehber",
          slug: dosya.replace(".mdx", ""),
          yol,
          baslik,
          kategori: kat,
        });
      }
    }
  }

  return sonuc;
}
