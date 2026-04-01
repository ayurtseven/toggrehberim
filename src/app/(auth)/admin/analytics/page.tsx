import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { AramaBarChart, SayfaBarChart, TriajGuvenDonut } from "./AnalytikGrafik";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

interface AramaSatiri {
  query: string;
  arama_sayisi: number;
  ort_sonuc: number;
}

interface SayfaSatiri {
  path: string;
  goruntulenme: number;
  ort_sure: number;
}

interface TriajSatiri {
  event: string;
  confidence: string;
  triage_status: string | null;
  alert_category: string | null;
  service_directed: boolean;
  sayisi: number;
}

async function getAnalytics() {
  const supabase = getServiceClient();
  if (!supabase) return {
    aramalar: [], sayfalar: [], toplamArama: 0, toplamGoruntulenme: 0,
    triajlar: [], toplamTriaj: 0, servisYonlendirme: 0, triajHam: [],
  };

  const [aramaRes, sayfaRes, toplamAramaRes, toplamGoruntulenmeRes, triajRes] = await Promise.all([
    supabase.from("top_searches").select("*"),
    supabase.from("top_pages").select("*"),
    supabase.from("search_logs").select("id", { count: "exact", head: true }),
    supabase.from("page_views").select("id", { count: "exact", head: true }),
    supabase.from("triage_events").select("event, confidence, triage_status, alert_category, service_directed"),
  ]);

  const triajHam = (triajRes.data ?? []) as {
    event: string; confidence: string; triage_status: string | null;
    alert_category: string | null; service_directed: boolean;
  }[];

  // group by alert_category
  const triajMap = new Map<string, TriajSatiri>();
  for (const row of triajHam) {
    const key = row.alert_category ?? "(bilinmiyor)";
    const existing = triajMap.get(key);
    if (existing) { existing.sayisi += 1; }
    else { triajMap.set(key, { ...row, sayisi: 1 }); }
  }
  const triajlar = [...triajMap.values()].sort((a, b) => b.sayisi - a.sayisi).slice(0, 10);

  return {
    aramalar: (aramaRes.data ?? []) as AramaSatiri[],
    sayfalar: (sayfaRes.data ?? []) as SayfaSatiri[],
    toplamArama: aramaRes.error ? 0 : (toplamAramaRes.count ?? 0),
    toplamGoruntulenme: sayfaRes.error ? 0 : (toplamGoruntulenmeRes.count ?? 0),
    triajlar,
    triajHam,
    toplamTriaj: triajHam.length,
    servisYonlendirme: triajHam.filter((r) => r.service_directed).length,
  };
}

export default async function AnalyticsPage() {
  const {
    aramalar, sayfalar, toplamArama, toplamGoruntulenme,
    triajlar, triajHam, toplamTriaj, servisYonlendirme,
  } = await getAnalytics();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="mt-1 text-sm text-slate-400">Son 30 günün özeti</p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            ← Admin
          </Link>
        </div>

        {/* Özet kartlar */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatKart baslik="Toplam Arama" deger={toplamArama} renk="text-blue-400" />
          <StatKart baslik="Toplam Görüntülenme" deger={toplamGoruntulenme} renk="text-emerald-400" />
          <StatKart baslik="Tekil Arama Terimi" deger={aramalar.length} renk="text-purple-400" />
          <StatKart baslik="Tekil Sayfa" deger={sayfalar.length} renk="text-yellow-400" />
          <StatKart baslik="İkaz Tanıma" deger={toplamTriaj} renk="text-orange-400" />
          <StatKart baslik="Servis Yönlendirme" deger={servisYonlendirme} renk="text-red-400" />
        </div>

        {/* ── Grafik bölümü ──────────────────────────────────────────────── */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* Arama bar chart */}
          <section className="rounded-xl border border-white/8 bg-slate-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-300">En Çok Aranan Terimler</h2>
            {aramalar.length === 0 ? (
              <Bos mesaj="Henüz arama verisi yok" />
            ) : (
              <AramaBarChart data={aramalar} />
            )}
          </section>

          {/* Sayfa bar chart */}
          <section className="rounded-xl border border-white/8 bg-slate-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-300">En Çok Görüntülenen Sayfalar</h2>
            {sayfalar.length === 0 ? (
              <Bos mesaj="Henüz sayfa görüntülenme verisi yok" />
            ) : (
              <SayfaBarChart data={sayfalar} />
            )}
          </section>

        </div>

        {/* ── Triage ──────────────────────────────────────────────────────── */}
        {toplamTriaj > 0 && (
          <div className="mb-8 grid gap-6 lg:grid-cols-3">

            {/* Güven donut */}
            <section className="rounded-xl border border-white/8 bg-slate-900 p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-300">Güven Dağılımı</h2>
              <TriajGuvenDonut data={triajHam.map((r) => ({ confidence: r.confidence, sayisi: 1 }))} />
            </section>

            {/* Kategori tablosu */}
            <section className="lg:col-span-2 rounded-xl border border-white/8 bg-slate-900 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300">En Sık Tanınan İkazlar</h2>
                <span className="text-xs text-slate-600">{toplamTriaj} toplam tanıma</span>
              </div>
              <div className="space-y-2">
                {triajlar.map((t, i) => {
                  const pct = Math.round((t.sayisi / toplamTriaj) * 100);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-4 shrink-0 text-right text-xs text-slate-600">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium text-slate-200">{t.alert_category ?? "—"}</span>
                          <span className="shrink-0 text-xs text-slate-500">{t.sayisi} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ── Ham tablolar ─────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* En çok aranan terimler — tam tablo */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-400">Arama Detayı</h2>
            {aramalar.length === 0 ? (
              <Bos mesaj="Henüz arama verisi yok" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500">Terim</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-500">Arama</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-500">Ort. Sonuç</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aramalar.map((a, i) => (
                      <tr key={a.query} className="border-b border-white/5 hover:bg-white/3">
                        <td className="px-4 py-2.5 text-slate-600">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-white">{a.query}</td>
                        <td className="px-4 py-2.5 text-right text-blue-400">{a.arama_sayisi}</td>
                        <td className="px-4 py-2.5 text-right text-slate-400">
                          {a.ort_sonuc ? Number(a.ort_sonuc).toFixed(1) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* En çok görüntülenen sayfalar — tam tablo */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-400">Sayfa Görüntülenme Detayı</h2>
            {sayfalar.length === 0 ? (
              <Bos mesaj="Henüz sayfa görüntülenme verisi yok" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500">Sayfa</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-500">Görüntülenme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sayfalar.map((s, i) => (
                      <tr key={s.path} className="border-b border-white/5 hover:bg-white/3">
                        <td className="px-4 py-2.5 text-slate-600">{i + 1}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-300">{s.path}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-400">{s.goruntulenme}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}

function StatKart({ baslik, deger, renk }: { baslik: string; deger: number; renk: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-4">
      <p className="text-xs text-slate-500">{baslik}</p>
      <p className={`mt-1 text-2xl font-bold ${renk}`}>{deger.toLocaleString("tr-TR")}</p>
    </div>
  );
}

function Bos({ mesaj }: { mesaj: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-white/8 text-sm text-slate-600">
      {mesaj}
    </div>
  );
}
