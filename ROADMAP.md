# ToggRehberim — Stratejik Ürün ve Platform Mimarisi

> Bu doküman, projenin kuzey yıldızıdır. Tüm geliştirme kararları bu parametrelere göre alınır.

---

## Vizyon

Türkiye'nin yerli elektrikli otomobili **Togg** için dünyada eşi benzeri olmayan kullanıcı rehber ve veri platformu.

**Hedef Kullanıcı:** Aracını yeni almış, menzil kaygısı yaşayan, teknik terimlerden yorulduğu için pişmanlık eşiğinde olan bir kullanıcı.
**Başarı Kriteri:** Kullanıcı siteyi açtığında — *"İyi ki bu siteyi buldum!"* diyecek.

---

## 1. Ölçek ve Performans

| Metrik | Hedef |
|---|---|
| Günlük aktif kullanıcı | 5.000 |
| Aylık ziyaret | 100.000 |
| Anlık eşzamanlı oturum | 300 |

### Mimari Kararlar

- **CDN:** Vercel Edge Network (varsayılan) + Cloudflare proxy (opsiyonel, özellikle statik asset'ler için)
- **Cache Katmanı:**
  - Rehber sayfaları → SSG (build-time, CDN'den servis)
  - Haber/duyuru sayfaları → ISR (`revalidate: 3600`)
  - Şarj haritası / canlı veri → SSR + `Cache-Control: s-maxage=60`
  - API route'lar → `next: { revalidate: 300 }` veya Redis (yoğunlaşınca)
- **DB:** Supabase PostgreSQL — ilk aşamada tek instance yeterli. 50K+ DAU'da read replica eklenebilir.
- **DB Partitioning:** `analytics_events` tablosu aylık partition (PostgreSQL native). Diğer tablolar için henüz erken.

---

## 2. İçerik Yönetim Stratejisi

### Hibrit Model: MDX + Supabase

| İçerik Tipi | Depolama | Neden |
|---|---|---|
| Teknik rehberler | MDX (`content/rehber/`) | Versiyonlanabilir, git PR review, SSG |
| Haberler / OTA notları | MDX (`content/haberler/`) | Hızlı yayın, markdown yeterli |
| Kullanıcı katkıları | Supabase `posts` tablosu | Moderation gerekli, dinamik |
| Hata kodları sözlüğü | Supabase `error_codes` tablosu | Aranabilir, API üzerinden offline'a sync |
| Şarj istasyonu verileri | Supabase `stations` tablosu | Admin + kullanıcı güncellemeli |

### OTA Güncelleme Akışı

1. Togg OTA yayınlar → site editörü MDX'i günceller → git push → Vercel otomatik deploy (5 dk)
2. Kritik güvenlik ikazı → Supabase `alerts` tablosuna direkt insert → anında SSR ile yayında

### Kullanıcı Katkısı

- Kullanıcılar Supabase Auth ile giriş yapıp içerik önerebilir
- Editör onayı sonrası MDX'e dönüştürülüp git'e eklenir
- Draft → Review → Published akışı

---

## 3. Veri ve Analitik Stratejisi (SaaS Vizyonu)

### Toplanacak Veri Noktaları

```
- Hata kodu aramaları (ikaz_arama_log: kod, model, tarih, konum)
- Şarj istasyonu tıklamaları (istasyon_id, aksiyon, timestamp)
- Menzil endişesi senaryoları (arama terimi içeriği, tahmini şarj durumu)
- Sayfa oturumları (sayfa, süre, model, versiyon)
```

### Veritabanı Şeması — Analytics Tabloları

```sql
-- Arama logları
CREATE TABLE search_logs (
  id          BIGSERIAL PRIMARY KEY,
  query       TEXT NOT NULL,
  type        TEXT NOT NULL, -- 'ikaz' | 'rehber' | 'istasyon'
  result_count INT,
  model       TEXT,          -- 't10x' | 't10f' | null
  session_id  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Sayfa görüntülemeleri
CREATE TABLE page_views (
  id         BIGSERIAL PRIMARY KEY,
  path       TEXT NOT NULL,
  referrer   TEXT,
  duration_s INT,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- İstasyon etkileşimleri
CREATE TABLE station_interactions (
  id          BIGSERIAL PRIMARY KEY,
  station_id  TEXT NOT NULL,
  action      TEXT NOT NULL, -- 'view' | 'route' | 'app_link'
  session_id  UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### B2B Raporlama (İleride)

- Haftalık/aylık özet rapor → PDF veya dashboard
- **Togg'a satılabilir veri:** En çok aranan ikazlar, bölgesel menzil kaygısı haritası
- **Trugo/ZES'e satılabilir veri:** En çok tıklanan istasyonlar, eksik istasyon talepleri
- Stack: Supabase + Metabase (self-host, ücretsiz) veya Grafana

---

## 4. PWA ve Offline Kullanım

### Offline'da Çalışması Gereken Özellikler

| Özellik | Öncelik |
|---|---|
| Hata kodu sözlüğü (tam liste) | P0 — Kritik |
| Temel şarj rehberi | P0 — Kritik |
| Yakın zamanda görüntülenen rehberler | P1 |
| Şarj istasyonu listesi (son senkron) | P1 |
| Panik Butonu senaryoları | P0 — Kritik |

### Service Worker Stratejisi

```
Cache Strategy:
- App Shell (layout, fonts, CSS)  → Cache First
- Statik rehber sayfaları         → Stale While Revalidate
- Hata kodu JSON                  → Cache First + Background Sync
- Görseller                       → Cache First (max 50 resim)
- API çağrıları                   → Network First, fallback cache
```

### Implementasyon

- `next-pwa` veya manuel Workbox entegrasyonu
- `public/manifest.json` — standalone mod, dark theme, Togg kırmızısı
- İlk ziyarette kritik içerik pre-cache (hata kodları ~200KB, rehber özeti ~100KB)
- Offline sayfasında: önbellek listesi + "Bu sayfalar çevrimdışı kullanılabilir"

---

## 5. Gelir Modeli ve Büyüme

### Faz 1 — Trafik Kazan (0–6 ay)
- Ücretsiz, reklamsız, güven inşa et
- SEO odaklı MDX içerik üretimi
- Google Analytics + Supabase analytics paralel

### Faz 2 — İlk Gelir (6–12 ay)

| Model | Açıklama | Tahmini Gelir |
|---|---|---|
| Affiliate | Aksesuar, şarj kablosu, ped linki (Amazon/Trendyol) | 500–2K TL/ay |
| Sponsor listing | Şarj istasyonu öne çıkarma (Trugo, ZES) | 1–5K TL/ay |
| Premium içerik | Gelişmiş optimizasyon rehberleri, video | 2–10K TL/ay |

### Faz 3 — SaaS (12+ ay)

| Model | Açıklama |
|---|---|
| Veri raporu | Togg/operatörlere aylık analytics raporu |
| White-label | Başka EV markaları için aynı platform |
| API erişimi | Hata kodu API'si — servis uygulamalarına lisans |

### Teknik Hazırlık

- `premium_content` flag'i MDX frontmatter'da şimdiden var olsun
- Supabase Auth + `subscriptions` tablosu hazır tutsun (Stripe bağlantısı için)
- Affiliate link wrapper component (tıklama takibi için)

---

## 6. UX & Tasarım — Öncelikli Özellikler

### Panik Butonu Konsepti

Ana sayfada büyük, görünür bir "Şu an ne yaşıyorsun?" modülü:

```
[ 🔴 Araçta ikaz lambası yandı ]
[ 🔋 Şarj bulamıyorum / Menzil bitecek ]
[ ❄️  Kışta menzil düştü, ne yapayım? ]
[ 🔧 Servis randevusu almam lazım ]
[ 📲 OTA geldi, ne değişti? ]
```

Her senaryo doğrudan ilgili rehbere veya çözüme yönlendirir. Tek tıkla cevap.

### Görsel Hata Tarama Modülü

- Kullanıcı araç görseli üzerinde ikazın konumunu tıklar
- Veya metin/fotoğraf ile AI arama (mevcut `/ikaz-arama`)
- Sonuçta: Açıklama + Aciliyet seviyesi + Ne yapmalısın + Rehber linki

### Canlı Şarj Haritası

- Kuratörlü liste (mevcut sistem) + kullanıcı katkılı durum güncellemesi
- "Ben şu an buradayım, bana en yakın 3 istasyonu göster" (Geolocation API)
- Filtre: DC/AC, operatör, müsait/meşgul

---

## 7. Teknik Yol Haritası

### Sprint 1 — Temel (Tamamlandı ✓)
- [x] Next.js 15 App Router kurulumu
- [x] MDX rehber sistemi
- [x] Admin paneli (içerik + istasyon yönetimi)
- [x] Favori istasyonlar (JSON-backed curated list)
- [x] Vibrant dark UI (SpotlightCard, AnimatedSection, StatsTicker)

### Sprint 2 — UX İyileştirme (Tamamlandı ✓)
- [x] **Panik Butonu** — ana sayfada "Şu an ne yaşıyorsun?" modülü
- [x] **Anasayfa yeniden tasarım** — devasa resimler kaldırıldı, kompakt model kartları
- [x] **Şarj hesaplayıcı** — kalan şarj % → menzil (soğuk/eko katsayılı) → geolocation
- [x] **PWA** — manifest + service worker (cache stratejileri) + /offline sayfası
- [x] **Fuse.js Arama** — ⌘K modal, rehber + haber indeksi, keyboard nav
- [x] **İkaz kodu sayfaları** — 54 adet SSG `/ikaz/[id]`, FAQPage JSON-LD, generateMetadata
- [x] **İkaz sözlüğü hub** — `/ikaz` aciliyet gruplu

### Sprint 3 — Veri ve Topluluk (Sıradaki)
- [x] **Analytics altyapısı** — Supabase migration + `/api/analytics` + search logging
- [ ] **Analytics migration çalıştır** — Supabase Dashboard > SQL Editor
- [ ] Supabase Auth (Google/Apple sign-in)
- [ ] Kullanıcı katkılı içerik akışı (rehber önerisi)
- [ ] İstasyon kullanıcı yorumları / durum bildirimi
- [ ] Analytics dashboard — top searches, top pages görünümü

### Sprint 4 — Monetizasyon
- [ ] Affiliate link sistemi
- [ ] Premium içerik flag'i
- [ ] Sponsor listing UI
- [ ] Analytics dashboard (Metabase veya özel)

---

## Önerilen Güncel Stack

| Katman | Teknoloji | Not |
|---|---|---|
| Framework | Next.js 15 (App Router) | Mevcut ✓ |
| Stil | Tailwind CSS v4 | Mevcut ✓ |
| İçerik | MDX + git | Mevcut ✓ |
| DB/Auth | Supabase | Mevcut ✓ |
| Hosting | Vercel | Mevcut ✓ |
| Arama | Fuse.js → Algolia (büyüyünce) | Fuse.js başlangıç |
| Analytics | Supabase custom tables + Plausible | Privacy-first |
| PWA | Workbox (next-pwa) | Sprint 2 |
| Cache | Vercel edge + Redis (büyüyünce) | Redis şimdilik erken |
| Payments | Stripe (ileride) | Supabase entegrasyonu var |

---

*Son güncelleme: 2026-03-27*
