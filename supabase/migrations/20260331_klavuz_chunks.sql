-- Togg kullanıcı kılavuzu metin parçaları — tam metin arama için
CREATE TABLE IF NOT EXISTS klavuz_chunks (
  id              BIGSERIAL PRIMARY KEY,
  kaynak          TEXT NOT NULL,          -- 'ikaz_pdf' | 'kullanici_kilavuzu' | 'manuel'
  bolum           TEXT,                   -- '6.2.2 Uyarı Lambaları' gibi bölüm başlığı
  baslik          TEXT,                   -- Parça başlığı
  icerik          TEXT NOT NULL,          -- Aranacak metin içeriği
  sayfa           INTEGER,                -- PDF sayfa numarası
  sira            INTEGER,                -- Bölüm içi sıra
  ilgili_sembol_id TEXT,                  -- Varsa ikaz sembolüne referans
  anahtar_kelimeler TEXT[],
  search_vector   TSVECTOR,              -- Full-text search için
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index (Türkçe)
CREATE INDEX IF NOT EXISTS klavuz_chunks_search_idx
  ON klavuz_chunks USING GIN (search_vector);

-- search_vector otomatik güncelleme trigger
CREATE OR REPLACE FUNCTION klavuz_chunks_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.baslik, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.bolum, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.icerik, '')), 'C') ||
    setweight(to_tsvector('simple', array_to_string(COALESCE(NEW.anahtar_kelimeler, '{}'), ' ')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS klavuz_chunks_search_trigger ON klavuz_chunks;
CREATE TRIGGER klavuz_chunks_search_trigger
  BEFORE INSERT OR UPDATE ON klavuz_chunks
  FOR EACH ROW EXECUTE FUNCTION klavuz_chunks_search_update();

-- RLS
ALTER TABLE klavuz_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okuma_herkese" ON klavuz_chunks;
CREATE POLICY "okuma_herkese" ON klavuz_chunks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "yazma_giris_yapanlara" ON klavuz_chunks;
CREATE POLICY "yazma_giris_yapanlara" ON klavuz_chunks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
