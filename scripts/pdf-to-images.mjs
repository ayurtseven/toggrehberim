/**
 * PDF sayfalarını PNG olarak kaydeder (mupdf tabanlı).
 * Kullanım: node scripts/pdf-to-images.mjs
 *
 * Çıktı: public/images/rehber/sarj/t10x-s{N}.png
 *        public/images/rehber/sarj/t10f-s{N}.png
 */

import * as mupdf from 'mupdf';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';

const DPI = 150; // 72 varsayılan, 150 = yeterli kalite
const SCALE = DPI / 72;
const OUT_DIR = 'public/images/rehber/sarj';

mkdirSync(OUT_DIR, { recursive: true });

function renderPages(pdfPath, prefix, pages) {
  const data = readFileSync(pdfPath);
  const doc = mupdf.Document.openDocument(data, 'application/pdf');
  console.log(`\n${prefix.toUpperCase()} — ${doc.countPages()} sayfa toplam`);

  for (const pageNum of pages) {
    try {
      // mupdf sayfa indeksi 0-tabanlı
      const page = doc.loadPage(pageNum - 1);
      const bounds = page.getBounds();
      const matrix = mupdf.Matrix.scale(SCALE, SCALE);
      const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);

      const outPath = `${OUT_DIR}/${prefix}-s${String(pageNum).padStart(3, '0')}.png`;
      writeFileSync(outPath, pixmap.asPNG());
      console.log(`  ✓ sayfa ${pageNum} → ${outPath}  (${bounds[2].toFixed(0)}×${bounds[3].toFixed(0)} pt)`);
    } catch (err) {
      console.error(`  ✗ sayfa ${pageNum} hata:`, err.message);
    }
  }
}

// T10X: şarj bölümü sayfa 89–94
renderPages('C:/temp/t10x_kitap.pdf', 't10x', [89, 90, 91, 92, 93, 94]);

// T10F: şarj bölümü sayfa 92–97
renderPages('C:/temp/t10f_kitap.pdf', 't10f', [92, 93, 94, 95, 96, 97]);

console.log('\nTamamlandı.');
