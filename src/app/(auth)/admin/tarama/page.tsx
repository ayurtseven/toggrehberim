import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import TaramaClient from "./TaramaClient";

async function getGecmis() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await sb
    .from("icerik_taramalari")
    .select("id, kaynak_url, kaynak_tur, kaynak_adi, baslik, ozet, kategori, model, durum, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export default async function TaramaSayfasi() {
  const gecmis = await getGecmis();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Başlık */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">İçerik Tarama & Yazım</h1>
            <p className="mt-1 text-sm text-slate-400">
              Web ve sosyal medyadan içerik tara, AI ile MDX taslak oluştur
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              ← Admin
            </Link>
          </div>
        </div>

        <TaramaClient gecmis={gecmis} />
      </div>
    </div>
  );
}
