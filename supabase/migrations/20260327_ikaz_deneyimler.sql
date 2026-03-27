-- İkaz sayfası kullanıcı deneyimleri
CREATE TABLE IF NOT EXISTS ikaz_deneyimler (
  id              BIGSERIAL PRIMARY KEY,
  ikaz_id         TEXT NOT NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kullanici_adi   TEXT NOT NULL,
  model           TEXT NOT NULL DEFAULT 'hepsi', -- 't10x' | 't10f' | 'hepsi'
  metin           TEXT NOT NULL,
  onaylandi       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ikaz_deneyimler_ikaz_id_idx ON ikaz_deneyimler (ikaz_id);
CREATE INDEX IF NOT EXISTS ikaz_deneyimler_created_at_idx ON ikaz_deneyimler (created_at DESC);

ALTER TABLE ikaz_deneyimler ENABLE ROW LEVEL SECURITY;

-- Herkes onaylananları okuyabilir
DROP POLICY IF EXISTS "okuma_herkese" ON ikaz_deneyimler;
CREATE POLICY "okuma_herkese" ON ikaz_deneyimler
  FOR SELECT USING (onaylandi = true);

-- Giriş yapanlar yazabilir
DROP POLICY IF EXISTS "yazma_giris_yapanlara" ON ikaz_deneyimler;
CREATE POLICY "yazma_giris_yapanlara" ON ikaz_deneyimler
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
