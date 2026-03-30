"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import type { KlavuzAramaSonucu } from "@/app/api/klavuz-arama/route";

const KAYNAKLAR: { deger: string; etiket: string; ikon: string }[] = [
  { deger: "", etiket: "Tümü", ikon: "📚" },
  { deger: "ikaz_pdf", etiket: "İkaz Lambaları", ikon: "⚠️" },
  { deger: "kullanici_kilavuzu", etiket: "Kullanıcı Kılavuzu", ikon: "📖" },
  { deger: "manuel", etiket: "Manüel Eklenmiş", ikon: "✏️" },
];

function vurgula(metin: string, sorgu: string): React.ReactNode {
  const kelimeler = sorgu.trim().split(/\s+/).filter(Boolean);
  if (!kelimeler.length) return metin;

  const regex = new RegExp(`(${kelimeler.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parcalar = metin.split(regex);

  return (
    <>
      {parcalar.map((parca, i) =>
        regex.test(parca) ? (
          <mark key={i} className="rounded bg-amber-400/25 px-0.5 text-amber-200">
            {parca}
          </mark>
        ) : (
          parca
        )
      )}
    </>
  );
}

function SonucKarti({ sonuc, sorgu }: { sonuc: KlavuzAramaSonucu; sorgu: string }) {
  const KAYNAK_ETIKET: Record<string, string> = {
    ikaz_pdf: "İkaz Lambaları",
    kullanici_kilavuzu: "Kullanıcı Kılavuzu",
    manuel: "Manuel",
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5 transition hover:bg-white/5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          {sonuc.baslik && (
            <h3 className="font-semibold text-slate-100">{vurgula(sonuc.baslik, sorgu)}</h3>
          )}
          {sonuc.bolum && (
            <p className="text-xs text-slate-500">{sonuc.bolum}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-slate-400">
            {KAYNAK_ETIKET[sonuc.kaynak] ?? sonuc.kaynak}
          </span>
          {sonuc.sayfa && (
            <span className="text-xs text-slate-600">s. {sonuc.sayfa}</span>
          )}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-400">
        {vurgula(sonuc.snippet, sorgu)}
      </p>

      {sonuc.ilgili_sembol_id && (
        <div className="mt-3">
          <Link
            href={`/ikaz/${sonuc.ilgili_sembol_id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--togg-red)]/20 bg-[var(--togg-red)]/8 px-3 py-1.5 text-xs font-medium text-[var(--togg-red)] hover:bg-[var(--togg-red)]/15"
          >
            ⚠️ İkaz sayfasına git →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function KlavuzAraPage() {
  const [sorgu, setSorgu] = useState("");
  const [aktifKaynak, setAktifKaynak] = useState("");
  const [sonuclar, setSonuclar] = useState<KlavuzAramaSonucu[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [aramayapildi, setAramayapildi] = useState(false);
  const aramaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ara = useCallback(
    async (q: string, kaynak: string) => {
      if (!q.trim() || q.trim().length < 2) {
        setSonuclar([]);
        setAramayapildi(false);
        return;
      }

      setYukleniyor(true);
      try {
        const params = new URLSearchParams({ q: q.trim() });
        if (kaynak) params.set("kaynak", kaynak);
        const res = await fetch(`/api/klavuz-arama?${params}`);
        const veri = await res.json();
        setSonuclar(veri.sonuclar ?? []);
        setAramayapildi(true);
      } catch {
        setSonuclar([]);
      } finally {
        setYukleniyor(false);
      }
    },
    []
  );

  const handleInput = (deger: string) => {
    setSorgu(deger);
    if (aramaRef.current) clearTimeout(aramaRef.current);
    aramaRef.current = setTimeout(() => ara(deger, aktifKaynak), 300);
  };

  const handleKaynakDegis = (kaynak: string) => {
    setAktifKaynak(kaynak);
    ara(sorgu, kaynak);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-slate-300">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-slate-200">Kılavuz Arama</span>
      </nav>

      {/* Başlık */}
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
          <span className="text-sm font-bold text-slate-300">📚 Togg Kılavuzu</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Kılavuz Ara</h1>
        <p className="mt-2 text-slate-400">
          Togg kullanıcı kılavuzunda anahtar kelimelerle arama yap. İkaz lambaları, özellikler,
          bakım bilgileri ve daha fazlası.
        </p>
      </div>

      {/* Arama kutusu */}
      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <span className="text-slate-500">🔍</span>
        </div>
        <input
          type="search"
          value={sorgu}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ara(sorgu, aktifKaynak)}
          placeholder="Arayın... (ör: şarj, fren, uyarı lambası, bakım)"
          autoFocus
          className="w-full rounded-2xl border border-white/10 bg-slate-900 py-4 pl-11 pr-4 text-base text-white placeholder:text-slate-500 outline-none focus:border-[var(--togg-red)]/50 focus:ring-2 focus:ring-[var(--togg-red)]/10"
        />
        {yukleniyor && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
          </div>
        )}
      </div>

      {/* Kaynak filtreleri */}
      <div className="mb-6 flex flex-wrap gap-2">
        {KAYNAKLAR.map((k) => (
          <button
            key={k.deger}
            onClick={() => handleKaynakDegis(k.deger)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              aktifKaynak === k.deger
                ? "border-[var(--togg-red)]/40 bg-[var(--togg-red)]/10 text-[var(--togg-red)]"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
            }`}
          >
            <span>{k.ikon}</span>
            {k.etiket}
          </button>
        ))}
      </div>

      {/* Sonuçlar */}
      {aramayapildi && (
        <div>
          {sonuclar.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400">
                <strong className="text-slate-200">&ldquo;{sorgu}&rdquo;</strong> için sonuç bulunamadı.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Kılavuz içeriği henüz yüklenmemiş olabilir.{" "}
                <Link href="/ikaz-arama" className="text-[var(--togg-red)] underline">
                  İkaz lambası ara →
                </Link>
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">
                <strong className="text-slate-300">{sonuclar.length}</strong> sonuç bulundu
              </p>
              <div className="space-y-3">
                {sonuclar.map((s) => (
                  <SonucKarti key={s.id} sonuc={s} sorgu={sorgu} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!aramayapildi && !yukleniyor && (
        <div className="mt-8 rounded-2xl border border-white/8 bg-slate-900/40 p-5">
          <h2 className="mb-3 font-semibold text-slate-300">Örnek Aramalar</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "şarj kablosu",
              "lastik basıncı",
              "hava yastığı",
              "park freni",
              "enerji tasarrufu",
              "servis bakım",
              "kış lastiği",
              "sürücü asistanı",
            ].map((ornek) => (
              <button
                key={ornek}
                onClick={() => { setSorgu(ornek); ara(ornek, aktifKaynak); }}
                className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-slate-400 hover:border-white/20 hover:text-slate-300"
              >
                {ornek}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
