import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SEMBOL_OZET_LISTESI, TUM_IKAZ_SEMBOLLERI } from "@/lib/ikaz-sembolleri";
import { stripExifFromBase64, normalizeAIResponse, generateSessionId } from "@/lib/ikaz-pipeline";
import { runRuleEngine, buildFallbackResult } from "@/lib/rule-engine";
import type { VehicleState } from "@/lib/triage-types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AI_TIMEOUT_MS = 4000;

export interface IkazTanimaYaniti {
  basarili: boolean;
  mesaj?: string;
  sonuc?: {
    tanindi: boolean;
    guven: "yuksek" | "orta" | "dusuk";
    sembol_id?: string;
    ai_aciklama: {
      ad: string;
      renk: string;
      aciliyet: string;
      anlami: string;
      nedenler: string[];
      yapilacaklar: string[];
      servis_gerekli: boolean;
      not?: string;
    };
  };
  triage?: ReturnType<typeof buildFallbackResult>;
  pipeline?: {
    sessionId: string;
    confidenceScore: number;
    fallback: boolean;
    fallbackTrigger?: string;
    rawInputDeleted: boolean;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse<IkazTanimaYaniti>> {
  const sessionId = generateSessionId();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { basarili: false, mesaj: "AI servisi yapılandırılmamış. Lütfen ANTHROPIC_API_KEY ortam değişkenini ayarlayın." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const dosya = formData.get("gorsel") as File | null;
    const vehicleStateRaw = formData.get("vehicleState") as string | null;

    const vehicleState: VehicleState = vehicleStateRaw
      ? JSON.parse(vehicleStateRaw)
      : { isRunning: false, onCharging: false, batteryLevel: -1, lastFaultCount: 0 };

    if (!dosya) {
      return NextResponse.json({ basarili: false, mesaj: "Görsel yüklenmedi." }, { status: 400 });
    }

    if (dosya.size > 5 * 1024 * 1024) {
      return NextResponse.json({ basarili: false, mesaj: "Görsel boyutu 5MB'yi geçemez." }, { status: 400 });
    }

    // KVKK: EXIF strip before sending to AI — no geolocation in metadata
    const arrayBuffer = await dosya.arrayBuffer();
    const rawBase64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = (dosya.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    const base64 = stripExifFromBase64(rawBase64, mediaType);

    const sembolListesi = SEMBOL_OZET_LISTESI.map(
      (s) => `- ID: ${s.id} | Ad: ${s.ad} | Renk: ${s.renk} | Görsel: ${s.sembol_tanimi}`
    ).join("\n");

    const systemPrompt = `Sen bir Togg araç uzmanısın. Kullanıcıların Togg T10X ve T10F araçlarında gördükleri dashboard uyarı lambalarını tanımlayan ve açıklayan bir asistansın.

ÖNCE görseldeki sembolün şeklini ve rengini dikkatlice analiz et:
- Kaplumbağa simgesi mi? (kırmızı kaplumbağa = "kaplumbaga-kritik", sarı kaplumbağa = "kaplumbaga-sinirli")
- Araç silüeti mi? (ESP/ESC, ACC, şerit takip...)
- Harf/yazı var mı? (ABS, LIM, iLIM, HAZIR, SOS...)
- Far simgesi mi? (D şekli + çizgiler)
- İnsan figürü mü? (emniyet kemeri, hava yastığı...)
- Batarya simgesi mi?
- Direksiyon simidi mi?
- Uyarı üçgeni mi?

Rengi önemli: kırmızı = acil/arıza, sarı = dikkat, yeşil = aktif/normal, mavi = bilgi

Mevcut semboller listesi (ID | Ad | Renk | Görsel Açıklama):
${sembolListesi}

Görevin:
1. Görseldeki sembolün şeklini ve rengini tanımla
2. Listeden EN YAKIN görsel eşleşmeyi seç — sadece isim benzerliğine değil, GÖRSEL ŞEKLE göre eşleştir
3. JSON formatında yanıt ver

JSON formatı:
{
  "tanindi": true/false,
  "guven": "yuksek"/"orta"/"dusuk",
  "sembol_id": "listedeki id veya null",
  "ai_aciklama": {
    "ad": "Sembol adı",
    "renk": "kirmizi/sari/yesil/mavi/beyaz",
    "aciliyet": "hemen_dur/yakin_servis/dikkat/bilgi",
    "anlami": "Sembolün ne anlama geldiği",
    "nedenler": ["neden 1", "neden 2"],
    "yapilacaklar": ["yapılacak 1", "yapılacak 2"],
    "servis_gerekli": true/false,
    "not": "varsa özel not veya null"
  }
}

Eğer görsel dashboard uyarı lambası içermiyorsa: tanindi: false döndür.
Yanıtın YALNIZCA JSON olsun, başka metin ekleme.`;

    // ── AI call with timeout ──────────────────────────────────────────────────
    let aiSonuc: { tanindi: boolean; guven: string; sembol_id?: string; ai_aciklama: Record<string, unknown> } | null = null;
    let fallbackTrigger: "TIMEOUT" | "PARSING_FAILED" | undefined;

    try {
      const abortController = new AbortController();
      const timer = setTimeout(() => abortController.abort(), AI_TIMEOUT_MS);

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: "Bu araç dashboard görselindeki uyarı lambasını tanımla ve açıkla." },
          ],
        }],
        system: systemPrompt,
      });
      clearTimeout(timer);

      const icerik = response.content[0];
      if (icerik.type !== "text") throw new Error("PARSING_FAILED");

      const jsonMetin = icerik.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      aiSonuc = JSON.parse(jsonMetin);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      fallbackTrigger = msg.includes("abort") || msg === "TIMEOUT" ? "TIMEOUT" : "PARSING_FAILED";
    }

    // ── Input normalization (KVKK data-safety gate) ──────────────────────────
    const normalized = normalizeAIResponse(
      aiSonuc ? { tanindi: aiSonuc.tanindi, guven: aiSonuc.guven, sembol_id: aiSonuc.sembol_id } : null,
      fallbackTrigger,
    );

    // ── Rule engine: deterministic triage ─────────────────────────────────────
    let triage = buildFallbackResult(fallbackTrigger ?? "PARSING_FAILED", false);

    if (normalized.detectedAlertId) {
      const sembol = TUM_IKAZ_SEMBOLLERI.find((s) => s.id === normalized.detectedAlertId);
      if (sembol) {
        triage = runRuleEngine(sembol, normalized.confidenceScore, vehicleState);
      }
    }

    // ── Enrich AI response with DB data ───────────────────────────────────────
    let sembolDetay = null;
    if (aiSonuc?.sembol_id) {
      sembolDetay = TUM_IKAZ_SEMBOLLERI.find((s) => s.id === aiSonuc!.sembol_id);
    }

    const zenginAciklama = aiSonuc
      ? sembolDetay
        ? {
            ...aiSonuc.ai_aciklama,
            nedenler: sembolDetay.nedenler.length > 0 ? sembolDetay.nedenler : aiSonuc.ai_aciklama.nedenler,
            yapilacaklar: sembolDetay.yapilacaklar.length > 0 ? sembolDetay.yapilacaklar : aiSonuc.ai_aciklama.yapilacaklar,
            not: sembolDetay.not || aiSonuc.ai_aciklama.not,
          }
        : aiSonuc.ai_aciklama
      : null;

    return NextResponse.json({
      basarili: true,
      sonuc: aiSonuc && zenginAciklama
        ? {
            tanindi: aiSonuc.tanindi,
            guven: aiSonuc.guven as "yuksek" | "orta" | "dusuk",
            sembol_id: aiSonuc.sembol_id ?? undefined,
            ai_aciklama: zenginAciklama as IkazTanimaYaniti["sonuc"]["ai_aciklama"],
          }
        : undefined,
      triage,
      pipeline: {
        sessionId,
        confidenceScore: normalized.confidenceScore,
        fallback: normalized.fallback,
        fallbackTrigger: normalized.fallbackTrigger,
        rawInputDeleted: true,
      },
    });

  } catch (hata) {
    console.error("İkaz tanıma hatası:", hata);
    if (hata instanceof SyntaxError) {
      return NextResponse.json({ basarili: false, mesaj: "AI yanıtı işlenemedi. Tekrar deneyin." }, { status: 500 });
    }
    return NextResponse.json({ basarili: false, mesaj: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
