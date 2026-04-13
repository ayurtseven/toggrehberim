import * as pdfjsLib from '../node_modules/pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.resolve('./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
).href;

async function getTOC(pdfPath, label) {
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
  console.log(`\n===== ${label} (${doc.numPages} sayfa) =====`);

  const results = [];
  for (let pg = 4; pg <= 12; pg++) {
    try {
      const page = await doc.getPage(pg);
      const content = await page.getTextContent();
      const raw = content.items.map(i => ('str' in i ? i.str : '')).join(' ');
      const parcalar = raw.split(/\s{2,}/);

      for (const parca of parcalar) {
        // "N BAŞLIK . . . . . 13" — tek veya çift rakam, noktasız, büyük harf başlangıç
        const m = parca.trim().match(/^(\d{1,2})\s+([A-ZÇĞİÖŞÜ][^\.]+?)(?:\s+\.[\s\.]+\s*)(\d{1,3})$/);
        if (m && !m[1].includes('.')) {
          const no = parseInt(m[1]);
          if (no >= 1 && no <= 15) {
            results.push({ no, baslik: m[2].trim(), sayfa: parseInt(m[3]) });
          }
        }
      }
    } catch {}
  }

  // Tekrar kaldır, sırala
  const seen = new Set();
  results
    .filter(r => { if (seen.has(r.no)) return false; seen.add(r.no); return true; })
    .sort((a, b) => a.no - b.no)
    .forEach(r => console.log(`  ${r.no}. ${r.baslik}  →  s.${r.sayfa}`));
}

await getTOC('C:/temp/t10x_kitap.pdf', 'T10X');
await getTOC('C:/temp/t10f_kitap.pdf', 'T10F');
