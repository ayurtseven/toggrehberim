"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Deneyim {
  id: number;
  kullanici_adi: string;
  model: string;
  metin: string;
  created_at: string;
}

function tarihFormatla(iso: string) {
  const fark = Date.now() - new Date(iso).getTime();
  const gun = Math.floor(fark / 86400000);
  if (gun === 0) return "bugün";
  if (gun === 1) return "dün";
  if (gun < 30) return `${gun} gün önce`;
  const ay = Math.floor(gun / 30);
  return `${ay} ay önce`;
}

export default function IkazDeneyimler({ ikazId }: { ikazId: string }) {
  const [deneyimler, setDeneyimler] = useState<Deneyim[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullanici, setKullanici] = useState<{ adi: string } | null>(null);

  // Form state
  const [model, setModel] = useState("hepsi");
  const [metin, setMetin] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState(false);

  useEffect(() => {
    // Deneyimleri yükle
    fetch(`/api/ikaz-deneyim?ikaz_id=${ikazId}`)
      .then((r) => r.json())
      .then((data) => setDeneyimler(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setYukleniyor(false));

    // Kullanıcı kontrolü
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const adi =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Sen";
        setKullanici({ adi });
      }
    });
  }, [ikazId]);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!metin.trim() || metin.trim().length < 10) {
      setHata("En az 10 karakter yazmalısın.");
      return;
    }
    setGonderiyor(true);
    setHata("");

    const res = await fetch("/api/ikaz-deneyim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ikaz_id: ikazId, model, metin }),
    });

    if (res.ok) {
      setBasarili(true);
      setMetin("");
      // Listeye ekle (optimistic)
      const yeni: Deneyim = {
        id: Date.now(),
        kullanici_adi: kullanici?.adi || "Sen",
        model,
        metin: metin.trim(),
        created_at: new Date().toISOString(),
      };
      setDeneyimler((prev) => [yeni, ...prev]);
    } else {
      const json = await res.json().catch(() => ({}));
      setHata(json.hata || "Bir hata oluştu.");
    }
    setGonderiyor(false);
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-8">
      <h2 className="mb-5 text-lg font-bold">
        Kullanıcı Deneyimleri
        {!yukleniyor && deneyimler.length > 0 && (
          <span className="ml-2 text-sm font-normal text-neutral-500">
            ({deneyimler.length})
          </span>
        )}
      </h2>

      {/* Deneyim listesi */}
      {yukleniyor ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : deneyimler.length > 0 ? (
        <div className="mb-6 space-y-3">
          {deneyimler.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-white/8 bg-neutral-900 px-4 py-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-200">
                  {d.kullanici_adi}
                </span>
                {d.model !== "hepsi" && (
                  <span className="rounded-full bg-[var(--togg-red)]/10 px-2 py-0.5 text-[10px] uppercase text-[var(--togg-red)]">
                    {d.model}
                  </span>
                )}
                <span className="ml-auto text-xs text-neutral-600">
                  {tarihFormatla(d.created_at)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-300">{d.metin}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-6 text-sm text-neutral-600">
          Henüz deneyim paylaşılmamış. İlk sen yaz!
        </p>
      )}

      {/* Form veya giriş CTA */}
      {kullanici ? (
        basarili ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3">
            <span className="text-emerald-400">✓</span>
            <p className="text-sm text-emerald-300">Deneyimin paylaşıldı, teşekkürler!</p>
          </div>
        ) : (
          <form onSubmit={gonder} className="rounded-xl border border-white/10 bg-neutral-900 p-4">
            <p className="mb-3 text-sm font-medium text-neutral-300">
              Bu ikazı yaşadın mı? Deneyimini paylaş
            </p>

            <div className="mb-3">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              >
                <option value="hepsi">Model seç</option>
                <option value="t10x">T10X</option>
                <option value="t10f">T10F</option>
              </select>
            </div>

            <textarea
              value={metin}
              onChange={(e) => { setMetin(e.target.value); setHata(""); }}
              placeholder="Ne zaman yandı? Ne yaptın? Nasıl çözüldü?"
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-white/25"
            />

            {hata && <p className="mt-1.5 text-xs text-red-400">{hata}</p>}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-neutral-600">{kullanici.adi} olarak paylaşılacak</span>
              <button
                type="submit"
                disabled={gonderiyor || !metin.trim()}
                className="rounded-lg bg-[var(--togg-red)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {gonderiyor ? "Gönderiliyor..." : "Paylaş"}
              </button>
            </div>
          </form>
        )
      ) : (
        <a
          href={`/giris?next=/ikaz/${ikazId}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 py-3 text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
        >
          Deneyimini paylaşmak için giriş yap →
        </a>
      )}
    </div>
  );
}
