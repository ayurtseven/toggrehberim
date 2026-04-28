/**
 * Haftalık Togg Gündemi — Otomatik Cron
 *
 * Her Pazartesi 06:00 UTC çalışır (vercel.json).
 * Tavily ile haber arar → Claude ile sınıflandırır → gundem_items'a ekler.
 *
 * Toggle: CRON_GUNDEM_AKTIF=true  →  çalışır
 *         CRON_GUNDEM_AKTIF=false →  atlar (siteyi tam aktive edince true yap)
 *
 * Eklenen öğeler aktif=false gelir — admin /admin/gundem'den onaylar.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Hafta başı hesapla ───────────────────────────────────────────────────────

function buHaftaninPazartesisi(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  return mon.toISOString().split("T")[0];
}

// ─── Tavily arama ─────────────────────────────────────────────────────────────

interface TavilyHit {
  title: string;
  url: string;
  content: string;
  published_date?: string;
}

async function tavilyAra(sorgu: string): Promise<TavilyHit[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: sorgu,
        search_depth: "basic",
        max_results: 6,
        include_answer: false,
        days: 7,           // Son 7 gün
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []) as TavilyHit[];
  } catch {
    return [];
  }
}

// ─── Claude sınıflandırma ─────────────────────────────────────────────────────

interface GundemOge {
  title: string;
  platform: "Haber" | "Resmi" | "Şikayet" | "Forum" | "Pazar";
  summary: string;
  link: string;
  severity: "low" | "medium" | "high";
}

async function claudeSiniflandir(haberler: TavilyHit[]): Promise<GundemOge[]> {
  if (haberler.length === 0) return [];

  const girdi = haberler
    .map((h, i) => `[${i + 1}] BAŞLIK: ${h.title}\nURL: ${h.url}\nİÇERİK: ${h.content.slice(0, 400)}`)
    .join("\n\n---\n\n");

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Aşağıdaki Togg haberlerini toggrehberim.com kullanıcıları için değerlendir ve JSON dizisi olarak döndür.

Her öğe için:
- title: Türkçe, kısa başlık (max 90 karakter)
- platform: "Haber" | "Resmi" | "Şikayet" | "Forum" | "Pazar"
  · Resmi = Togg'dan resmi duyuru
  · Şikayet = kullanıcı şikayeti, arıza, sorun
  · Forum = topluluk tartışması
  · Pazar = fiyat/rakip/pazar verisi
  · Haber = genel medya haberi
- summary: 1-2 cümle Türkçe özet (max 160 karakter)
- link: orijinal URL
- severity: "high" | "medium" | "low"
  · high = acil/kritik (araç güvenliği, büyük duyuru, önemli arıza)
  · medium = önemli ama acil değil (fiyat, yeni özellik, yasal düzenleme)
  · low = bilgi amaçlı

Sadece Togg veya Türkiye EV ekosistemine doğrudan alakalı olanları dahil et.
Alakasız veya tekrarlanan haberleri atla.
Sonucu sadece JSON dizisi olarak döndür, başka hiçbir şey yazma.

Haberler:
${girdi}`,
      },
    ],
  });

  const metin = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";

  // JSON bloğunu temizle
  const temiz = metin.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    const parsed = JSON.parse(temiz);
    return Array.isArray(parsed) ? (parsed as GundemOge[]) : [];
  } catch {
    console.error("Claude JSON parse hatası:", temiz.slice(0, 200));
    return [];
  }
}

// ─── Ana handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // 1. Cron güvenliği
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  // 2. Toggle — CRON_GUNDEM_AKTIF=false ise sessizce atla
  if (process.env.CRON_GUNDEM_AKTIF !== "true") {
    return NextResponse.json({ atlandı: true, neden: "CRON_GUNDEM_AKTIF=false" });
  }

  // 3. Supabase bağlantısı
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!sbUrl || !sbKey) {
    return NextResponse.json({ error: "Supabase env eksik" }, { status: 500 });
  }
  const sb = createServiceClient(sbUrl, sbKey);

  // 4. Bu hafta zaten çalıştı mı?
  const hafta = buHaftaninPazartesisi();
  const { count } = await sb
    .from("gundem_items")
    .select("id", { count: "exact", head: true })
    .eq("hafta_basi", hafta);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ atlandı: true, neden: "Bu hafta zaten dolu", hafta });
  }

  // 5. Tavily aramaları
  const YIL = new Date().getFullYear();
  const SORGULAR = [
    `Togg T10X T10F haber duyuru ${YIL} son hafta`,
    `Togg yazılım güncelleme OTA arıza şikayet ${YIL}`,
    `Togg fiyat kampanya ${YIL}`,
    `Togg yeni model T6X ihracat ${YIL}`,
    `Türkiye elektrikli araç şarj altyapısı ${YIL}`,
  ];

  const tumHaberler = (
    await Promise.allSettled(SORGULAR.map(tavilyAra))
  )
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<TavilyHit[]>).value);

  // URL bazlı tekil
  const tekil = Array.from(new Map(tumHaberler.map((h) => [h.url, h])).values());

  if (tekil.length === 0) {
    return NextResponse.json({ error: "Tavily sonuç döndürmedi" }, { status: 500 });
  }

  // 6. Claude sınıflandır (max 20 haber gönder)
  const ogeler = await claudeSiniflandir(tekil.slice(0, 20));

  if (ogeler.length === 0) {
    return NextResponse.json({ error: "Claude sınıflandırma başarısız" }, { status: 500 });
  }

  // 7. Supabase'e kaydet (aktif=false — admin onaylayacak)
  const kayitlar = ogeler.map((o) => ({
    title:      o.title,
    platform:   o.platform,
    summary:    o.summary,
    link:       o.link,
    severity:   o.severity,
    hafta_basi: hafta,
    aktif:      false,   // Admin /admin/gundem'den aktif edecek
  }));

  const { error } = await sb.from("gundem_items").insert(kayitlar);

  if (error) {
    console.error("gundem_items insert hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    hafta,
    eklenen: kayitlar.length,
    mesaj: `${kayitlar.length} öğe eklendi (aktif=false). /admin/gundem'den onaylayın.`,
  });
}
