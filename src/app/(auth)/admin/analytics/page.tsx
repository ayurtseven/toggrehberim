import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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

async function getAnalytics() {
  const supabase = getServiceClient();
  if (!supabase) return { aramalar: [], sayfalar: [], toplamArama: 0, toplamGoruntulenme: 0 };

  const [aramaRes, sayfaRes, toplamAramaRes, toplamGoruntulenmeRes] = await Promise.all([
    supabase.from("top_searches").select("*"),
    supabase.from("top_pages").select("*"),
    supabase.from("search_logs").select("id", { count: "exact", head: true }),
    supabase.from("page_views").select("id", { count: "exact", head: true }),
  ]);

  return {
    aramalar: (aramaRes.data ?? []) as AramaSatiri[],
    sayfalar: (sayfaRes.data ?? []) as SayfaSatiri[],
    toplamArama: aramaRes.error ? 0 : (toplamAramaRes.count ?? 0),
    toplamGoruntulenme: sayfaRes.error ? 0 : (toplamGoruntulenmeRes.count ?? 0),
  };
}

export default async function AnalyticsPage() {
  const { aramalar, sayfalar, toplamArama, toplamGoruntulenme } = await getAnalytics();

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="mt-1 text-sm text-neutral-400">Son 30 günün özeti</p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-white"
          >
            ← Admin
          </Link>
        </div>

        {/* Özet kartlar */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatKart baslik="Toplam Arama" deger={toplamArama} renk="text-blue-400" />
          <StatKart baslik="Toplam Görüntülenme" deger={toplamGoruntulenme} renk="text-emerald-400" />
          <StatKart baslik="Tekil Arama Terimi" deger={aramalar.length} renk="text-purple-400" />
          <StatKart baslik="Tekil Sayfa" deger={sayfalar.length} renk="text-yellow-400" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* En çok aranan terimler */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-neutral-200">En Çok Aranan Terimler</h2>
            {aramalar.length === 0 ? (
              <Bos mesaj="Henüz arama verisi yok" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                      <th className="px-4 py-2.5 text-left font-medium text-neutral-500">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-neutral-500">Terim</th>
                      <th className="px-4 py-2.5 text-right font-medium text-neutral-500">Arama</th>
                      <th className="px-4 py-2.5 text-right font-medium text-neutral-500">Ort. Sonuç</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aramalar.map((a, i) => (
                      <tr key={a.query} className="border-b border-white/5 hover:bg-white/3">
                        <td className="px-4 py-2.5 text-neutral-600">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-white">{a.query}</td>
                        <td className="px-4 py-2.5 text-right text-blue-400">{a.arama_sayisi}</td>
                        <td className="px-4 py-2.5 text-right text-neutral-400">
                          {a.ort_sonuc ? Number(a.ort_sonuc).toFixed(1) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* En çok görüntülenen sayfalar */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-neutral-200">En Çok Görüntülenen Sayfalar</h2>
            {sayfalar.length === 0 ? (
              <Bos mesaj="Henüz sayfa görüntülenme verisi yok" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                      <th className="px-4 py-2.5 text-left font-medium text-neutral-500">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-neutral-500">Sayfa</th>
                      <th className="px-4 py-2.5 text-right font-medium text-neutral-500">Görüntülenme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sayfalar.map((s, i) => (
                      <tr key={s.path} className="border-b border-white/5 hover:bg-white/3">
                        <td className="px-4 py-2.5 text-neutral-600">{i + 1}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-neutral-300">{s.path}</td>
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
      <p className="text-xs text-neutral-500">{baslik}</p>
      <p className={`mt-1 text-2xl font-bold ${renk}`}>{deger.toLocaleString("tr-TR")}</p>
    </div>
  );
}

function Bos({ mesaj }: { mesaj: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-white/8 text-sm text-neutral-600">
      {mesaj}
    </div>
  );
}
