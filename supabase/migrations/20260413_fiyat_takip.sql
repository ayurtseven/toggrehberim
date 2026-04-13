-- Şarj fiyat takip sistemi
-- Çalıştır: Supabase Dashboard > SQL Editor

-- ── sarj_fiyatlari tablosuna yeni kolonlar ────────────────────────────────────
ALTER TABLE sarj_fiyatlari
  ADD COLUMN IF NOT EXISTS tarife_url       TEXT,
  ADD COLUMN IF NOT EXISTS css_selector     TEXT,
  ADD COLUMN IF NOT EXISTS son_otomatik_kontrol TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS otomatik_kontrol_sonucu TEXT; -- 'guncellendi' | 'degismedi' | 'hata' | 'ssp_bulunamadi'

-- ── Fiyat değişim geçmişi tablosu ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fiyat_gecmisi (
  id              BIGSERIAL PRIMARY KEY,
  tarife_id       TEXT NOT NULL,          -- sarj_fiyatlari.id (trugo-ac, zes-dc-50, ...)
  eski_fiyat      TEXT,
  yeni_fiyat      TEXT NOT NULL,
  degisim_tarihi  TIMESTAMPTZ DEFAULT NOW(),
  kaynak          TEXT DEFAULT 'otomatik' -- 'otomatik' | 'manuel'
);

CREATE INDEX IF NOT EXISTS fiyat_gecmisi_tarife_id_idx ON fiyat_gecmisi (tarife_id);
CREATE INDEX IF NOT EXISTS fiyat_gecmisi_tarih_idx     ON fiyat_gecmisi (degisim_tarihi DESC);

-- RLS
ALTER TABLE fiyat_gecmisi ENABLE ROW LEVEL SECURITY;

-- Sadece authenticated (admin) okuyabilir, yazabilir
DROP POLICY IF EXISTS "auth_only" ON fiyat_gecmisi;
CREATE POLICY "auth_only" ON fiyat_gecmisi
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- service_role (cron) her şeyi yapabilir — RLS bypass
-- (service_role zaten RLS'i bypass eder, ekstra policy gerekmez)
