-- Şarj fiyat takip — URL ve CSS selector tanımlamaları
-- Çalıştır: Supabase Dashboard > SQL Editor

-- ── ZES — statik HTML, nth: modu (sayfa metnindeki N. fiyat rakamı) ──────────
-- Sayfa metin sırası: AC(9,99) → DC-1(12,99) → DC-2(16,49)
UPDATE sarj_fiyatlari SET
  tarife_url   = 'https://zes.net/tr/fiyatlandirma',
  css_selector = 'nth:0'
WHERE id = 'zes-ac';

UPDATE sarj_fiyatlari SET
  tarife_url   = 'https://zes.net/tr/fiyatlandirma',
  css_selector = 'nth:1'
WHERE id = 'zes-dc-50';

UPDATE sarj_fiyatlari SET
  tarife_url   = 'https://zes.net/tr/fiyatlandirma',
  css_selector = 'nth:2'
WHERE id = 'zes-dc-120';

-- ── Trugo — SPA, otomatik çekilemiyor (manuel takip) ─────────────────────────
-- tarife_url tanımlı değil → cron atlar, admin panelinde "URL Yok" görünür

-- ── Diğer operatörler — URL/selector eklenince buraya ekle ───────────────────
-- UPDATE sarj_fiyatlari SET tarife_url = '...', css_selector = '...' WHERE id = 'esarj-ac';
