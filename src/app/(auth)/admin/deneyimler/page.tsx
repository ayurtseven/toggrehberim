import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

interface Deneyim {
  id: number;
  ikaz_id: string;
  kullanici_adi: string;
  model: string;
  metin: string;
  onaylandi: boolean;
  created_at: string;
}

async function getDeneyimler() {
  const supabase = getServiceClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("ikaz_deneyimler")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Deneyim[];
}

function tarihFormatla(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function DeneyimlerPage() {
  const deneyimler = await getDeneyimler();
  const onaylanan = deneyimler.filter((d) => d.onaylandi).length;

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">İkaz Deneyimleri</h1>
            <p className="mt-1 text-sm text-neutral-400">
              {onaylanan} onaylı · {deneyimler.length - onaylanan} beklemede
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-white"
          >
            ← Admin
          </Link>
        </div>

        {deneyimler.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-white/8 text-sm text-neutral-600">
            Henüz deneyim yok
          </div>
        ) : (
          <div className="space-y-2">
            {deneyimler.map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-mono text-neutral-300">
                      {d.ikaz_id}
                    </span>
                    <span className="text-sm font-medium text-white">{d.kullanici_adi}</span>
                    {d.model !== "hepsi" && (
                      <span className="rounded-full bg-[var(--togg-red)]/10 px-2 py-0.5 text-[10px] uppercase text-[var(--togg-red)]">
                        {d.model}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      d.onaylandi
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}>
                      {d.onaylandi ? "onaylı" : "beklemede"}
                    </span>
                    <span className="ml-auto text-xs text-neutral-600">{tarihFormatla(d.created_at)}</span>
                  </div>
                  <p className="text-sm text-neutral-300">{d.metin}</p>
                </div>
                <Link
                  href={`/ikaz/${d.ikaz_id}`}
                  className="shrink-0 rounded-lg bg-white/8 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/15"
                >
                  Sayfaya git
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
