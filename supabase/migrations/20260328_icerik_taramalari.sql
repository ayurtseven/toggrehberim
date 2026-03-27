-- İçerik tarama geçmişi
CREATE TABLE IF NOT EXISTS icerik_taramalari (
  id          BIGSERIAL PRIMARY KEY,
  kaynak_url  TEXT,
  kaynak_tur  TEXT NOT NULL DEFAULT 'web', -- 'web' | 'sosyal_medya' | 'forum' | 'manuel'
  kaynak_adi  TEXT, -- 'twitter', 'toggforum', 'shiftdelete' vs.
  ham_metin   TEXT,
  baslik      TEXT,
  ozet        TEXT,
  mdx_taslak  TEXT,
  kategori    TEXT, -- 'sarj' | 'yazilim' | 'bakim' | 'suruculuk' | 'sss' | 'haber'
  model       TEXT DEFAULT 'hepsi',
  durum       TEXT DEFAULT 'taslak', -- 'taslak' | 'kaydedildi' | 'reddedildi'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS icerik_taramalari_durum_idx ON icerik_taramalari (durum);
CREATE INDEX IF NOT EXISTS icerik_taramalari_created_at_idx ON icerik_taramalari (created_at DESC);

ALTER TABLE icerik_taramalari ENABLE ROW LEVEL SECURITY;
-- Sadece service_role erişebilir (admin API route'ları service key kullanır)
