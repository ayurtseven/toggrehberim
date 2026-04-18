import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { fiyatCek } from "@/lib/fiyat-scraper";

interface TarifeSatiri {
  id: string;
  fiyat: string | null;
  tarife_url: string | null;
  css_selector: string | null;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: satirlar, error } = await supabase
    .from("sarj_fiyatlari")
    .select("id, fiyat, tarife_url, css_selector")
    .not("tarife_url", "is", null)
    .eq("gizli", false);

  if (error || !satirlar) {
    return NextResponse.json({ error: "DB hatası", detay: error?.message }, { status: 500 });
  }

  const sonuclar: Array<{ id: string; sonuc: string; eski?: string; yeni?: string; hata?: string }> = [];
  const htmlCache = new Map<string, string>();
  const jsonCache = new Map<string, unknown>();

  for (const satir of satirlar as TarifeSatiri[]) {
    const now = new Date();

    if (!satir.tarife_url) {
      sonuclar.push({ id: satir.id, sonuc: "url_yok" });
      continue;
    }
    if (!satir.css_selector) {
      sonuclar.push({ id: satir.id, sonuc: "hata", hata: "selector tanımlı değil" });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: now.toISOString(),
        otomatik_kontrol_sonucu: "hata",
      }).eq("id", satir.id);
      continue;
    }

    const bulunanFiyat = await fiyatCek(satir.tarife_url, satir.css_selector, htmlCache, jsonCache);

    if (!bulunanFiyat) {
      sonuclar.push({ id: satir.id, sonuc: "selector_bulunamadi" });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: now.toISOString(),
        otomatik_kontrol_sonucu: "selector_bulunamadi",
      }).eq("id", satir.id);
      continue;
    }

    const mevcutFiyat = satir.fiyat ?? "—";
    if (bulunanFiyat === mevcutFiyat) {
      sonuclar.push({ id: satir.id, sonuc: "degismedi", yeni: bulunanFiyat });
      await supabase.from("sarj_fiyatlari").update({
        son_otomatik_kontrol: now.toISOString(),
        otomatik_kontrol_sonucu: "degismedi",
      }).eq("id", satir.id);
      continue;
    }

    await supabase.from("sarj_fiyatlari").update({
      fiyat: bulunanFiyat,
      son_guncelleme: now.toLocaleDateString("tr-TR"),
      son_otomatik_kontrol: now.toISOString(),
      otomatik_kontrol_sonucu: "guncellendi",
    }).eq("id", satir.id);

    await supabase.from("fiyat_gecmisi").insert({
      tarife_id: satir.id,
      eski_fiyat: mevcutFiyat,
      yeni_fiyat: bulunanFiyat,
      degisim_tarihi: now.toISOString(),
      kaynak: "otomatik",
    });

    sonuclar.push({ id: satir.id, sonuc: "guncellendi", eski: mevcutFiyat, yeni: bulunanFiyat });
  }

  return NextResponse.json({
    toplam:      sonuclar.length,
    guncellendi: sonuclar.filter((s) => s.sonuc === "guncellendi").length,
    degismedi:   sonuclar.filter((s) => s.sonuc === "degismedi").length,
    hata:        sonuclar.filter((s) => ["hata","selector_bulunamadi"].includes(s.sonuc)).length,
    url_yok:     sonuclar.filter((s) => s.sonuc === "url_yok").length,
    detay: sonuclar,
  });
}
