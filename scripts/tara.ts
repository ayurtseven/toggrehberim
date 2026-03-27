#!/usr/bin/env node
/**
 * ToggRehberim İçerik Tarama ve Üretme CLI
 *
 * Kullanım:
 *   npm run tara              → RSS + YouTube tara, content/draft/ klasörüne kaydet
 *   npm run tara -- --rss     → Sadece RSS kaynakları
 *   npm run tara -- --youtube → Sadece YouTube (YOUTUBE_API_KEY gerekli)
 *   npm run tara -- --rehber  → Önceden tanımlı konulardan rehber üret
 *   npm run tara -- --listele → Mevcut taslakları listele
 *   npm run tara -- --yayinla → Taslakları interaktif gözden geçir ve yayınla
 */

import * as readline from "readline";
import {
  RSS_KAYNAKLAR,
  YOUTUBE_SORGULAR,
  REHBER_KONULARI,
  TOGG_ANAHTAR_KELIMELERI,
} from "./lib/kaynaklar.js";
import { rssTara } from "./lib/rss.js";
import { youtubeAra } from "./lib/youtube.js";
import {
  haberUret,
  videoRehberUret,
  rehberKonusuUret,
  slugOlustur,
} from "./lib/claude.js";
import {
  slugMevcutMu,
  taslakKaydet,
  taslakYayinla,
  tumTaslaklariListele,
} from "./lib/mdx.js";
import fs from "fs";

const args = process.argv.slice(2);
const SADECE_RSS = args.includes("--rss");
const SADECE_YOUTUBE = args.includes("--youtube");
const REHBER_MODU = args.includes("--rehber");
const LISTELE_MODU = args.includes("--listele");
const YAYINLA_MODU = args.includes("--yayinla");

async function sor(soru: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(soru, (cevap) => {
      rl.close();
      resolve(cevap.trim().toLowerCase());
    });
  });
}

async function rssTarama() {
  console.log("\n📡 RSS kaynakları taranıyor...\n");
  let toplamYeni = 0;

  for (const kaynak of RSS_KAYNAKLAR) {
    const haberler = await rssTara(kaynak, TOGG_ANAHTAR_KELIMELERI);
    if (haberler.length === 0) {
      console.log(`  ○ ${kaynak.ad}: Togg ile ilgili haber yok`);
      continue;
    }

    console.log(
      `  ✓ ${kaynak.ad}: ${haberler.length} ilgili haber bulundu`
    );

    for (const ham of haberler) {
      const geciciSlug = slugOlustur(ham.baslik);

      if (slugMevcutMu(geciciSlug, "haber")) {
        console.log(`  ⟳ Zaten mevcut: ${ham.baslik.slice(0, 60)}`);
        continue;
      }

      console.log(`  🤖 Üretiliyor: ${ham.baslik.slice(0, 60)}...`);
      const uretilmis = await haberUret(ham);
      if (!uretilmis) continue;

      if (slugMevcutMu(uretilmis.slug, "haber")) {
        console.log(`  ⟳ Zaten mevcut: ${uretilmis.slug}`);
        continue;
      }

      const yol = taslakKaydet(uretilmis.slug, uretilmis.mdxMetin, "haber");
      console.log(`  ✅ Taslak: ${yol}`);
      toplamYeni++;

      await bekle(1500);
    }
  }

  console.log(
    `\n📊 RSS tamamlandı → ${toplamYeni} yeni taslak\n`
  );
}

async function youtubeTarama() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn(
      "\n⚠️  YOUTUBE_API_KEY bulunamadı. .env.local dosyasına ekle."
    );
    return;
  }

  console.log("\n▶️  YouTube taranıyor...\n");
  let toplamYeni = 0;

  for (const sorguObj of YOUTUBE_SORGULAR) {
    const videolar = await youtubeAra(sorguObj.sorgu, apiKey);
    if (videolar.length === 0) continue;

    console.log(
      `  ✓ "${sorguObj.sorgu}": ${videolar.length} video bulundu`
    );

    for (const video of videolar.slice(0, 2)) {
      const geciciSlug = slugOlustur(video.baslik);

      if (slugMevcutMu(geciciSlug, "rehber")) {
        console.log(`  ⟳ Zaten mevcut: ${video.baslik.slice(0, 60)}`);
        continue;
      }

      console.log(
        `  🤖 Rehber üretiliyor: ${video.baslik.slice(0, 60)}...`
      );
      const uretilmis = await videoRehberUret(video);
      if (!uretilmis) continue;

      const yol = taslakKaydet(
        uretilmis.slug,
        uretilmis.mdxMetin,
        "rehber",
        uretilmis.kategori
      );
      console.log(`  ✅ Taslak: ${yol}`);
      toplamYeni++;

      await bekle(2000);
    }
  }

  console.log(
    `\n📊 YouTube tamamlandı → ${toplamYeni} yeni taslak\n`
  );
}

async function rehberUretme() {
  console.log("\n📝 Rehber konuları işleniyor...\n");
  let toplamYeni = 0;

  for (const konu of REHBER_KONULARI) {
    const geciciSlug = slugOlustur(konu.konu);

    if (slugMevcutMu(geciciSlug, "rehber")) {
      console.log(`  ⟳ Zaten mevcut: ${konu.konu.slice(0, 60)}`);
      continue;
    }

    console.log(`  🤖 Üretiliyor: "${konu.konu.slice(0, 60)}"...`);
    const uretilmis = await rehberKonusuUret(
      konu.konu,
      konu.kategori,
      konu.model,
      konu.etiketler
    );
    if (!uretilmis) continue;

    if (slugMevcutMu(uretilmis.slug, "rehber")) {
      console.log(`  ⟳ Zaten mevcut: ${uretilmis.slug}`);
      continue;
    }

    const yol = taslakKaydet(
      uretilmis.slug,
      uretilmis.mdxMetin,
      "rehber",
      konu.kategori
    );
    console.log(`  ✅ Taslak: ${yol}`);
    toplamYeni++;

    await bekle(2000);
  }

  console.log(
    `\n📊 Rehber üretimi tamamlandı → ${toplamYeni} yeni taslak\n`
  );
}

async function taslaklariGozdenGecir() {
  const taslaklar = tumTaslaklariListele();

  if (taslaklar.length === 0) {
    console.log("\n✓ Bekleyen taslak yok.\n");
    return;
  }

  console.log(`\n📋 ${taslaklar.length} bekleyen taslak:\n`);

  for (const taslak of taslaklar) {
    const icerik = fs.readFileSync(taslak.yol, "utf-8");
    console.log("\n" + "─".repeat(60));
    console.log(
      `[${taslak.tur.toUpperCase()}${taslak.kategori ? "/" + taslak.kategori : ""}] ${taslak.baslik}`
    );
    console.log("─".repeat(60));
    console.log(icerik.slice(0, 600) + (icerik.length > 600 ? "\n..." : ""));
    console.log("─".repeat(60));

    const cevap = await sor(
      "\nYayınla? [e=evet / h=hayır+sil / a=atla / q=çık]: "
    );

    if (cevap === "q" || cevap === "çık") break;

    if (cevap === "h" || cevap === "n") {
      fs.unlinkSync(taslak.yol);
      console.log("  🗑️  Taslak silindi.");
    } else if (cevap === "e" || cevap === "y") {
      taslakYayinla(taslak.slug, taslak.tur, taslak.kategori);
    } else {
      console.log("  ↷ Atlandı.");
    }
  }

  console.log("\n✓ Gözden geçirme tamamlandı.\n");
}

function bekle(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("🚗 ToggRehberim İçerik Tarama Aracı");
  console.log("=====================================\n");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "❌ ANTHROPIC_API_KEY bulunamadı. .env.local dosyasını kontrol et.\n"
    );
    process.exit(1);
  }

  if (LISTELE_MODU) {
    const taslaklar = tumTaslaklariListele();
    if (taslaklar.length === 0) {
      console.log("✓ Bekleyen taslak yok.");
    } else {
      console.log(`📋 ${taslaklar.length} bekleyen taslak:\n`);
      for (const t of taslaklar) {
        console.log(
          `  [${t.tur}${t.kategori ? "/" + t.kategori : ""}] ${t.baslik}`
        );
      }
    }
    return;
  }

  if (YAYINLA_MODU) {
    await taslaklariGozdenGecir();
    return;
  }

  if (REHBER_MODU) {
    await rehberUretme();
  } else if (SADECE_RSS) {
    await rssTarama();
  } else if (SADECE_YOUTUBE) {
    await youtubeTarama();
  } else {
    // Varsayılan: hem RSS hem YouTube
    await rssTarama();
    await youtubeTarama();
  }

  const taslaklar = tumTaslaklariListele();
  if (taslaklar.length > 0) {
    console.log(`\n💡 ${taslaklar.length} bekleyen taslak var:`);
    console.log("   npm run tara -- --listele    → hepsini görüntüle");
    console.log("   npm run tara -- --yayinla    → interaktif yayınla\n");
  }
}

main().catch((err: Error) => {
  console.error("\n❌ Kritik hata:", err.message);
  process.exit(1);
});
