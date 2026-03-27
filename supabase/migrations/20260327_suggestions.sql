CREATE TABLE IF NOT EXISTS suggestions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  baslik      TEXT NOT NULL,
  icerik      TEXT NOT NULL,
  kategori    TEXT NOT NULL, -- 'sarj' | 'yazilim' | 'bakim' | 'suruculuk' | 'sss'
  model       TEXT DEFAULT 'hepsi', -- 't10x' | 't10f' | 'hepsi'
  durum       TEXT DEFAULT 'beklemede', -- 'beklemede' | 'inceleniyor' | 'kabul' | 'ret'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi önerilerini ekleyebilir ve görebilir
CREATE POLICY "kendi_oneri_ekle" ON suggestions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kendi_oneri_goster" ON suggestions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
