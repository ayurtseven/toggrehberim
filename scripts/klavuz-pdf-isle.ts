/**
 * klavuz-pdf-isle.ts
 *
 * Togg kullanıcı kılavuzu PDF'ini okuyup klavuz_chunks tablosuna yükler.
 *
 * Kullanım:
 *   npx tsx scripts/klavuz-pdf-isle.ts --pdf ./ikaz.pdf --kaynak ikaz_pdf --bolum "6.2.2 Uyarı Lambaları"
 *   npx tsx scripts/klavuz-pdf-isle.ts --pdf ./togg-kullanici-kilavuzu.pdf --kaynak kullanici_kilavuzu
 *
 * Gereksinimler:
 *   npm install pdf-parse
 *   .env.local → NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Not: pdf-parse paketi önce kurulmalı:
 *   npm install -D pdf-parse @types/pdf-parse
 */

import * as fs from "fs";
import * as path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

// ─── Argümanlar ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const argVal = (flag: string) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const PDF_YOLU = argVal("--pdf") ?? "./ikaz.pdf";
const KAYNAK = argVal("--kaynak") ?? "kullanici_kilavuzu";
const BOLUM_OVERRIDE = argVal("--bolum") ?? null;
const CHUNK_BOYUTU = parseInt(argVal("--chunk-boyut") ?? "800");
const CHUNK_OVERLAP = parseInt(argVal("--overlap") ?? "100");

// ─── Supabase bağlantısı ──────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env.local içinde olmalı");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── PDF okuma ────────────────────────────────────────────────────────────────

async function pdfOku(dosyaYolu: string): Promise<{ metin: string; sayfaSayisi: number }> {
  try {
    // pdf-parse dinamik import (kurulu değilse hata verir)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const buffer = fs.readFileSync(dosyaYolu);
    const sonuc = await pdfParse(buffer);
    return {
      metin: sonuc.text as string,
      sayfaSayisi: sonuc.numpages as number,
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "MODULE_NOT_FOUND") {
      console.error("❌ pdf-parse kurulu değil. Kur: npm install -D pdf-parse @types/pdf-parse");
    } else {
      console.error("❌ PDF okunamadı:", e);
    }
    process.exit(1);
  }
}

// ─── Metin chunklama ──────────────────────────────────────────────────────────

interface Chunk {
  bolum: string | null;
  baslik: string | null;
  icerik: string;
  sira: number;
}

function bolumBas(satir: string): boolean {
  // Büyük harf başlangıçlı, kısa satırları bölüm başlığı say
  return (
    /^[A-ZÇĞİÖŞÜ\d]/.test(satir) &&
    satir.length < 80 &&
    !satir.endsWith(".") &&
    satir.split(" ").length < 12
  );
}

function metniChunkla(metin: string, chunkBoyutu: number, overlap: number): Chunk[] {
  const satirlar = metin.split("\n").map((s) => s.trim()).filter(Boolean);
  const chunks: Chunk[] = [];
  let mevcutBolum: string | null = null;
  let mevcutBaslik: string | null = null;
  let mevcutMetin = "";
  let sira = 0;

  const chunkEkle = () => {
    if (mevcutMetin.trim().length < 30) return;
    chunks.push({
      bolum: mevcutBolum,
      baslik: mevcutBaslik,
      icerik: mevcutMetin.trim(),
      sira: sira++,
    });
  };

  for (const satir of satirlar) {
    // Bölüm başlığı tespiti
    if (bolumBas(satir)) {
      if (mevcutMetin.length > chunkBoyutu / 2) {
        chunkEkle();
        // Overlap: önceki chunk'ın sonunu yeni chunk'a taşı
        const kelimeler = mevcutMetin.split(" ");
        mevcutMetin = kelimeler.slice(-Math.floor(overlap / 5)).join(" ") + " ";
      }
      // Büyük başlıkları bolum, küçükleri baslik olarak işaretle
      if (satir.length < 40) {
        mevcutBolum = satir;
        mevcutBaslik = null;
      } else {
        mevcutBaslik = satir;
      }
      continue;
    }

    mevcutMetin += (mevcutMetin ? " " : "") + satir;

    if (mevcutMetin.length >= chunkBoyutu) {
      chunkEkle();
      const kelimeler = mevcutMetin.split(" ");
      mevcutMetin = kelimeler.slice(-Math.floor(overlap / 5)).join(" ") + " ";
    }
  }

  if (mevcutMetin.trim().length > 30) chunkEkle();

  return chunks;
}

// ─── Supabase'e yükle ─────────────────────────────────────────────────────────

async function yukle(chunks: Chunk[], kaynak: string) {
  console.log(`\n📤 ${chunks.length} chunk Supabase'e yükleniyor...`);

  // Mevcut kaynak verilerini temizle
  const { error: silHata } = await supabase
    .from("klavuz_chunks")
    .delete()
    .eq("kaynak", kaynak);

  if (silHata) {
    console.error("⚠️ Eski veriler silinemedi:", silHata.message);
  } else {
    console.log(`🗑️  Eski "${kaynak}" verileri temizlendi`);
  }

  // Batch insert (100'er)
  const BATCH = 100;
  let basarili = 0;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH).map((c) => ({
      kaynak,
      bolum: BOLUM_OVERRIDE ?? c.bolum,
      baslik: c.baslik,
      icerik: c.icerik,
      sira: c.sira,
    }));

    const { error } = await supabase.from("klavuz_chunks").insert(batch);

    if (error) {
      console.error(`❌ Batch ${i / BATCH + 1} hatası:`, error.message);
    } else {
      basarili += batch.length;
      process.stdout.write(`\r✓ ${basarili}/${chunks.length}`);
    }
  }

  console.log(`\n✅ ${basarili}/${chunks.length} chunk başarıyla yüklendi`);
}

// ─── Ana akış ─────────────────────────────────────────────────────────────────

async function main() {
  const tamYol = path.resolve(PDF_YOLU);

  if (!fs.existsSync(tamYol)) {
    console.error(`❌ Dosya bulunamadı: ${tamYol}`);
    process.exit(1);
  }

  console.log(`📄 PDF okunuyor: ${tamYol}`);
  const { metin, sayfaSayisi } = await pdfOku(tamYol);

  console.log(`✓ ${sayfaSayisi} sayfa, ${metin.length} karakter okundu`);
  console.log(`🔪 Chunk boyutu: ${CHUNK_BOYUTU}, overlap: ${CHUNK_OVERLAP}`);

  const chunks = metniChunkla(metin, CHUNK_BOYUTU, CHUNK_OVERLAP);
  console.log(`✓ ${chunks.length} chunk oluşturuldu`);

  if (chunks.length === 0) {
    console.error("❌ Chunk oluşturulamadı — PDF metin içermiyordur (taranmış PDF olabilir)");
    process.exit(1);
  }

  // Önizleme
  console.log("\n--- İlk chunk önizlemesi ---");
  console.log(`Bölüm: ${chunks[0].bolum}`);
  console.log(`Başlık: ${chunks[0].baslik}`);
  console.log(`İçerik: ${chunks[0].icerik.slice(0, 200)}...`);
  console.log("---");

  await yukle(chunks, KAYNAK);
}

main().catch((e) => {
  console.error("❌ Beklenmedik hata:", e);
  process.exit(1);
});
