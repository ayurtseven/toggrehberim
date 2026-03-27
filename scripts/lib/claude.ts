import Anthropic from "@anthropic-ai/sdk";
import type { HamHaber } from "./rss.js";
import type { YouTubeVideo } from "./youtube.js";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface UretilmisIcerik {
  slug: string;
  mdxMetin: string;
  baslik: string;
  tarih: string;
  tur: "haber" | "rehber";
  kategori?: string;
}

const SISTEM_PROMPT = `Sen www.toggrehberim.com için Türkçe içerik üretiyor bir editörüsün.
Bu site Türkiye'nin yerli elektrikli arabası Togg (T10X ve T10F modelleri) için
bağımsız kullanıcı rehberi ve topluluk portalı.

Yazma stili:
- Samimi ve anlaşılır Türkçe, teknik jargondan kaçın
- Togg sahiplerine pratik, uygulanabilir bilgiler ver
- Tarafsız ol, ne aşırı övücü ne aşırı eleştirel
- Başlıkları ilgi çekici ama abartısız tut
- Her zaman MDX formatında ve tam frontmatter ile yaz
- Frontmatter'da başlık ve özet çift tırnak içinde olmalı`;

export async function haberUret(
  ham: HamHaber
): Promise<UretilmisIcerik | null> {
  const bugun = new Date().toISOString().split("T")[0];

  const prompt = `Aşağıdaki haberi toggrehberim.com için Türkçe MDX haber makalesi olarak yaz.

Kaynak haber:
Başlık: ${ham.baslik}
Özet: ${ham.ozet}
Kaynak: ${ham.kaynak}
URL: ${ham.url}
Tarih: ${ham.yayinTarihi}

Çıktı formatı (kesinlikle bu formatta ver, başka hiçbir şey ekleme):

---
baslik: "${ham.baslik.slice(0, 100)}"
ozet: "1-2 cümle özet yaz"
tarih: ${ham.yayinTarihi || bugun}
kaynak: "${ham.kaynak}"
kaynak_url: "${ham.url}"
etiketler: [togg, elektrikli araç]
resim: ""
---

Makale gövdesi buraya. Minimum 3 paragraf. Togg sahipleri için önemli noktaları vurgula.
Son paragrafta kaynağa atıf yap.`;

  try {
    const mesaj = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: SISTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const metin = (mesaj.content[0] as { text: string }).text;
    const baslik =
      metin.match(/baslik:\s*"([^"]+)"/)?.[1] || ham.baslik;
    const slug = slugOlustur(baslik);

    return {
      slug,
      mdxMetin: metin,
      baslik,
      tarih: ham.yayinTarihi || bugun,
      tur: "haber",
    };
  } catch (err) {
    console.error(
      "  ✗ Claude haber üretme hatası:",
      (err as Error).message
    );
    return null;
  }
}

export async function videoRehberUret(
  video: YouTubeVideo
): Promise<UretilmisIcerik | null> {
  const bugun = new Date().toISOString().split("T")[0];

  const prompt = `Aşağıdaki YouTube videosuna dayanarak toggrehberim.com için Türkçe rehber makalesi yaz.

Video:
Başlık: ${video.baslik}
Kanal: ${video.kanal}
Açıklama: ${video.aciklama}
URL: ${video.url}

Çıktı formatı (kesinlikle bu formatta ver):

---
baslik: "SEO dostu Türkçe başlık"
ozet: "1-2 cümle özet"
kategori: suruculuk
model: hepsi
etiketler: [togg, sürüş, ipuçları]
tarih: ${bugun}
sure: 5
---

## Giriş

[Konuya giriş paragrafı]

## [Ana Bölüm 1 Başlığı]

[İçerik]

## [Ana Bölüm 2 Başlığı]

[İçerik]

## Pratik İpuçları

- İpucu 1
- İpucu 2
- İpucu 3

## Sonuç

[Kapanış paragrafı]

---
*Bu rehber [${video.kanal}](${video.url}) kanalının videosundan ilham alınarak hazırlanmıştır.*`;

  try {
    const mesaj = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: SISTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const metin = (mesaj.content[0] as { text: string }).text;
    const baslik =
      metin.match(/baslik:\s*"([^"]+)"/)?.[1] || video.baslik;
    const kategori =
      metin.match(/kategori:\s*(\w+)/)?.[1] || "suruculuk";
    const slug = slugOlustur(baslik);

    return { slug, mdxMetin: metin, baslik, tarih: bugun, tur: "rehber", kategori };
  } catch (err) {
    console.error(
      "  ✗ Claude rehber üretme hatası:",
      (err as Error).message
    );
    return null;
  }
}

export async function rehberKonusuUret(
  konu: string,
  kategori: string,
  model: string,
  etiketler: string[]
): Promise<UretilmisIcerik | null> {
  const bugun = new Date().toISOString().split("T")[0];

  const prompt = `Togg sahipleri için "${konu}" konusunda kapsamlı bir rehber yaz.

Hedef kitle: Türkiye'deki Togg T10X ve T10F sahipleri
Kategori: ${kategori}
Model: ${model}

Çıktı formatı (kesinlikle bu formatta ver):

---
baslik: "Başlık buraya"
ozet: "1-2 cümle özet"
kategori: ${kategori}
model: ${model}
etiketler: [${etiketler.map((e) => `"${e}"`).join(", ")}]
tarih: ${bugun}
sure: 8
---

## Giriş

[Konuya detaylı giriş]

## [Ana Bölüm 1]

[Detaylı içerik]

## [Ana Bölüm 2]

[Detaylı içerik]

## Sık Sorulan Sorular

**Soru 1?**
Cevap 1.

**Soru 2?**
Cevap 2.

## Özet

[Ana noktaları özetleyen kapanış]`;

  try {
    const mesaj = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system: SISTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const metin = (mesaj.content[0] as { text: string }).text;
    const baslik = metin.match(/baslik:\s*"([^"]+)"/)?.[1] || konu;
    const slug = slugOlustur(baslik);

    return { slug, mdxMetin: metin, baslik, tarih: bugun, tur: "rehber", kategori };
  } catch (err) {
    console.error(
      "  ✗ Claude rehber konusu üretme hatası:",
      (err as Error).message
    );
    return null;
  }
}

export function slugOlustur(baslik: string): string {
  const trMap: Record<string, string> = {
    ğ: "g", Ğ: "g", ü: "u", Ü: "u", ş: "s", Ş: "s",
    ı: "i", İ: "i", ö: "o", Ö: "o", ç: "c", Ç: "c",
  };

  return baslik
    .split("")
    .map((c) => trMap[c] || c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}
