-- ikaz_overrides tablosunu genişlet: tam manuel sembol girişi için yeni alanlar
-- Bu sayede hem mevcut sembollerin override'ı hem de sıfırdan yeni sembol eklenebilir

ALTER TABLE ikaz_overrides
  ADD COLUMN IF NOT EXISTS ad TEXT,
  ADD COLUMN IF NOT EXISTS renk TEXT,                         -- kirmizi|sari|yesil|mavi|beyaz
  ADD COLUMN IF NOT EXISTS aciliyet TEXT,                     -- hemen_dur|yakin_servis|dikkat|bilgi
  ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'hepsi',        -- t10x|t10f|hepsi
  ADD COLUMN IF NOT EXISTS servis_gerekli BOOLEAN,
  ADD COLUMN IF NOT EXISTS gorsel_url TEXT,                   -- Supabase Storage public URL
  ADD COLUMN IF NOT EXISTS anahtar_kelimeler TEXT[],
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;   -- true = tamamen yeni giriş

-- is_custom = false → mevcut sembolün bazı alanlarını override et
-- is_custom = true  → TUM_IKAZ_SEMBOLLERI'nde olmayan yeni sembol
