-- Analytics tabloları
-- Çalıştır: Supabase Dashboard > SQL Editor

-- ── Arama logları ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_logs (
  id          BIGSERIAL PRIMARY KEY,
  query       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'rehber', -- 'rehber' | 'ikaz' | 'genel'
  result_count INT,
  session_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS search_logs_created_at_idx ON search_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS search_logs_query_idx ON search_logs USING gin(to_tsvector('turkish', query));

-- ── Sayfa görüntülemeleri ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id         BIGSERIAL PRIMARY KEY,
  path       TEXT NOT NULL,
  referrer   TEXT,
  duration_s INT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views (path);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);

-- ── İstasyon etkileşimleri ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS station_interactions (
  id          BIGSERIAL PRIMARY KEY,
  station_id  TEXT NOT NULL,
  station_name TEXT,
  action      TEXT NOT NULL, -- 'view' | 'route' | 'app_link'
  session_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS: Sadece servis rolü yazabilir, okuyamaz (public) ──────────────────────
ALTER TABLE search_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views        ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_interactions ENABLE ROW LEVEL SECURITY;

-- Herkes ekleyebilir (INSERT), ama okuyamaz (sadece service_role)
DROP POLICY IF EXISTS "insert_only" ON search_logs;
CREATE POLICY "insert_only" ON search_logs
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "insert_only" ON page_views;
CREATE POLICY "insert_only" ON page_views
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "insert_only" ON station_interactions;
CREATE POLICY "insert_only" ON station_interactions
  FOR INSERT TO anon WITH CHECK (true);

-- ── Analitik view'ları (service_role ile kullan) ───────────────────────────────

-- En çok aranan terimler (son 30 gün)
CREATE OR REPLACE VIEW top_searches AS
SELECT
  query,
  COUNT(*) as arama_sayisi,
  AVG(result_count) as ort_sonuc
FROM search_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY query
ORDER BY arama_sayisi DESC
LIMIT 50;

-- En çok görüntülenen sayfalar (son 30 gün)
CREATE OR REPLACE VIEW top_pages AS
SELECT
  path,
  COUNT(*) as goruntulenme,
  AVG(duration_s) as ort_sure
FROM page_views
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY path
ORDER BY goruntulenme DESC
LIMIT 50;
