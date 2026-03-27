# toggrehberim.com — Proje Bağlamı

## Proje

Türkiye'nin yerli elektrikli otomobili **Togg** için bağımsız kullanıcı rehberi ve topluluk portalı.
Site: www.toggrehberim.com

## Geliştirici

- Solo geliştirici
- 2 Togg aracı sahibi: **T10X** ve **T10F**
- İçerik ve rehber öncelikli; topluluk özellikleri ikinci sprint

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 15 (App Router) |
| Dil | TypeScript |
| Stil | Tailwind CSS v4 |
| DB/Auth | Supabase (PostgreSQL + Auth + Storage) |
| İçerik | MDX dosyaları (`content/` klasörü, git-based) |
| Arama | Fuse.js (başlangıç), Algolia DocSearch (sonra) |
| i18n | next-intl (TR önce, EN hazır) |
| Hosting | Vercel |
| CDN | Vercel Edge + Cloudflare (opsiyonel) |

## Klasör Yapısı

```
toggrehberim/
├── content/               # MDX içerikler (git-based, DB değil)
│   ├── rehber/
│   │   ├── sarj/
│   │   ├── yazilim/
│   │   ├── bakim/
│   │   ├── suruculuk/
│   │   └── sss/
│   └── haberler/
├── src/
│   ├── app/
│   │   ├── (public)/      # Herkese açık sayfalar (SSG/ISR)
│   │   ├── (auth)/        # Giriş gerektiren sayfalar
│   │   └── api/           # API Routes
│   ├── components/
│   │   ├── ui/            # Base UI bileşenleri
│   │   ├── rehber/        # Rehber-spesifik bileşenler
│   │   └── layout/        # Header, Footer, Nav
│   └── lib/
│       ├── supabase/      # client.ts + server.ts
│       ├── content/       # MDX parse yardımcıları
│       └── search/        # Fuse.js search
```

## İçerik MDX Frontmatter Şeması

```yaml
---
baslik: string
ozet: string
kategori: sarj | yazilim | bakim | suruculuk | sss
model: t10x | t10f | hepsi
etiketler: string[]
tarih: YYYY-MM-DD
guncelleme: YYYY-MM-DD (opsiyonel)
sure: number (dakika, opsiyonel)
---
```

## Render Stratejisi

| Sayfa | Strateji |
|---|---|
| `/rehber/**` | SSG |
| `/modeller/**` | SSG |
| `/yazilim-takip` | ISR (1 saat) |
| `/sarj-haritasi` | SSR |
| `/topluluk/**` | SSR + Realtime |
| `/kullanici/**` | SSR (Auth gerekli) |

## MVP Sayfaları (Sprint 1)

1. Ana sayfa
2. `/rehber` hub
3. `/rehber/[kategori]/[slug]` detay
4. `/modeller/t10x` ve `/t10f`
5. Arama (Fuse.js)
6. PWA manifest + offline cache

## Önemli Kararlar

- **MDX > DB** rehber içerikleri için — versiyonlanabilir, build-time SSG
- **Türkçe URL** yapısı (`/rehber/sarj/evde-sarj`)
- **Araç içi kullanım** öncelikli: büyük dokunma hedefleri, dark mode varsayılan
- Batarya tavsiyesi: **%20–80** aralığı, Türkçe içerik
