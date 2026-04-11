/**
 * Şarj bölümü PDF görsellerini optimize eder.
 * PNG → WebP, max 900px genişlik, kalite 82
 */
import sharp from 'sharp';
import { readdirSync } from 'fs';

const DIR = 'public/images/rehber/sarj';

// Sadece MDX'lerde kullanacağımız sayfalar
const KULLAN = [
  't10x-s090', // şarj tipleri — Mod 3 kablo görseli
  't10x-s091', // şarj başlatma — kapak fotoğrafı + ekran
  't10x-s092', // şarj ayarları — kontrol ekranı
  't10x-s093', // planlı şarj — menü ekranı
  't10x-s094', // manuel kilit — turuncu/sarı halka fotoğrafı
  't10f-s093', // t10f: şarj başlatma
  't10f-s096', // t10f: şarj ayarları
];

for (const name of KULLAN) {
  const input = `${DIR}/${name}.png`;
  const output = `${DIR}/${name}.webp`;
  try {
    const info = await sharp(input)
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(output);
    console.log(`✓ ${name}.webp  ${(info.size / 1024).toFixed(0)} KB`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
  }
}

console.log('\nTamamlandı.');
