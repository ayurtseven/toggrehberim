-- Şarj fiyat takip — URL ve CSS selector tanımlamaları
-- Çalıştır: Supabase Dashboard > SQL Editor

-- ── ZES — statik HTML, doğrudan çekilebilir ──────────────────────────────────
UPDATE sarj_fiyatlari SET
  tarife_url   = 'https://zes.net/tr/fiyatlandirma',
  css_selector = '.pricing-cards .pricing-card:nth-child(1) .price'
WHERE id = 'zes-ac';

UPDATE sarj_fiyatlari SET
  tarife_url   = 'https://zes.net/tr/fiyatlandirma',
  css_selector = '.pricing-cards .pricing-card:nth-child(2) .price'
WHERE id = 'zes-dc-50';

UPDATE sarj_fiyatlari SET
  tarife_url   = 'https://zes.net/tr/fiyatlandirma',
  css_selector = '.pricing-cards .pricing-card:nth-child(3) .price'
WHERE id = 'zes-dc-120';

-- ── Trugo — SPA, otomatik çekilemiyor (manuel takip) ─────────────────────────
-- tarife_url tanımlı değil → cron atlar, admin panelinde "URL Yok" görünür

-- ── Diğer operatörler — URL/selector eklenince buraya ekle ───────────────────
-- UPDATE sarj_fiyatlari SET tarife_url = '...', css_selector = '...' WHERE id = 'esarj-ac';
