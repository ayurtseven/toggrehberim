-- İkaz sembolü override'ları (admin tarafından içerik düzenleme)
CREATE TABLE IF NOT EXISTS ikaz_overrides (
  sembol_id           TEXT PRIMARY KEY,
  kitapcik_aciklama   TEXT,
  anlami              TEXT,
  nedenler            TEXT[],
  yapilacaklar        TEXT[],
  not_metni           TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ikaz_overrides ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (sayfa yüklenirken fetch edilir)
DROP POLICY IF EXISTS "okuma_herkese" ON ikaz_overrides;
CREATE POLICY "okuma_herkese" ON ikaz_overrides
  FOR SELECT USING (true);

-- Sadece giriş yapanlar yazabilir
DROP POLICY IF EXISTS "yazma_giris_yapanlara" ON ikaz_overrides;
CREATE POLICY "yazma_giris_yapanlara" ON ikaz_overrides
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
