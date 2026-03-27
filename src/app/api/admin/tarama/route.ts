import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── GET: Tarama geçmişi ───────────────────────────────────────────────────────
export async function GET() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("icerik_taramalari")
    .select("id, kaynak_url, kaynak_tur, kaynak_adi, baslik, ozet, kategori, model, durum, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ hata: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST: Yeni tarama ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { url, metin, kaynak_tur, kaynak_adi } = await req.json();

  // 1. Ham metin al
  let hamMetin = metin?.trim() || "";

  if (url && !hamMetin) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ToggRehberim/1.0)" },
        signal: AbortSignal.timeout(10000),
      });
      const html = await res.text();
      // Basit HTML temizleme
      hamMetin = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{3,}/g, "\n")
        .slice(0, 8000)
        .trim();
    } catch {
      return NextResponse.json({ hata: "URL çekilemedi. Metni manuel yapıştırın." }, { status: 400 });
    }
  }

  if (!hamMetin || hamMetin.length < 50) {
    return NextResponse.json({ hata: "İçerik çok kısa veya boş." }, { status: 400 });
  }

  // 2. Claude ile MDX taslak üret
  const prompt = `Sen Türkiye'nin yerli elektrikli aracı Togg için içerik editörüsün.
Aşağıdaki kaynak metni analiz et ve toggrehberim.com sitesi için Türkçe MDX içerik taslağı oluştur.

KAYNAK METİN:
${hamMetin}

Çıktıyı JSON formatında ver:
{
  "baslik": "Türkçe SEO başlığı (60 karakter altı)",
  "ozet": "Meta description (150 karakter altı)",
  "kategori": "sarj | yazilim | bakim | suruculuk | sss | haber",
  "model": "t10x | t10f | hepsi",
  "etiketler": ["etiket1", "etiket2"],
  "mdx": "---\\nbaslik: \\"BAŞLIK\\"\\nozet: \\"ÖZET\\"\\nkategori: KATEGORİ\\nmodel: MODEL\\netiketler: [...]\\ntarih: ${new Date().toISOString().slice(0, 10)}\\nsure: DAKIKA\\n---\\n\\n## Giriş\\n\\nİçerik buraya...\\n\\n## Detaylar\\n\\n..."
}

Kurallar:
- Sadece Togg T10X ve/veya T10F ile alakalı bilgileri dahil et
- Türkçe yaz, teknik terimleri doğru kullan
- MDX içeriği en az 3 bölüm içersin
- JSON dışında hiçbir şey yazma`;

  let parsed: { baslik: string; ozet: string; kategori: string; model: string; mdx: string };

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON bulunamadı");
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ hata: "AI taslak oluşturamadı. Tekrar deneyin." }, { status: 500 });
  }

  // 3. DB'ye kaydet
  const sb = serviceClient();
  const { data, error } = await sb
    .from("icerik_taramalari")
    .insert({
      kaynak_url: url || null,
      kaynak_tur: kaynak_tur || "web",
      kaynak_adi: kaynak_adi || null,
      ham_metin: hamMetin.slice(0, 5000),
      baslik: parsed.baslik,
      ozet: parsed.ozet,
      mdx_taslak: parsed.mdx,
      kategori: parsed.kategori,
      model: parsed.model,
      durum: "taslak",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ hata: error.message }, { status: 500 });
  return NextResponse.json(data);
}
