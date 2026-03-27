import { createClient as createSupabaseClient } from "@supabase/supabase-js";

interface Oneri {
  id: number;
  user_id: string;
  baslik: string;
  icerik: string;
  kategori: string;
  model: string;
  durum: "beklemede" | "inceleniyor" | "kabul" | "ret";
  created_at: string;
}

const DURUM_STIL: Record<string, string> = {
  beklemede: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  inceleniyor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  kabul: "bg-green-500/20 text-green-300 border-green-500/30",
  ret: "bg-red-500/20 text-red-300 border-red-500/30",
};

const KAT_STIL: Record<string, string> = {
  sarj: "bg-blue-500/15 text-blue-300",
  yazilim: "bg-purple-500/15 text-purple-300",
  bakim: "bg-orange-500/15 text-orange-300",
  suruculuk: "bg-green-500/15 text-green-300",
  sss: "bg-gray-500/15 text-gray-300",
};

function tarihFormatla(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function OneriPage() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: oneriler, error } = await supabase
    .from("suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-red-400">Veri yüklenemedi: {error.message}</p>
        </div>
      </div>
    );
  }

  const liste = (oneriler ?? []) as Oneri[];

  const sayimlar = {
    beklemede: liste.filter((o) => o.durum === "beklemede").length,
    inceleniyor: liste.filter((o) => o.durum === "inceleniyor").length,
    kabul: liste.filter((o) => o.durum === "kabul").length,
    ret: liste.filter((o) => o.durum === "ret").length,
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Başlık */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kullanıcı Önerileri</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Toplam {liste.length} öneri
            </p>
          </div>
          <a
            href="/admin"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-400 hover:text-white"
          >
            ← Admin
          </a>
        </div>

        {/* Özet kartlar */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["beklemede", "Beklemede"],
              ["inceleniyor", "İnceleniyor"],
              ["kabul", "Kabul"],
              ["ret", "Ret"],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
            >
              <div className="text-2xl font-bold text-white">
                {sayimlar[key]}
              </div>
              <div className="mt-1 text-xs text-neutral-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Tablo */}
        {liste.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-neutral-500">
            Henüz öneri yok.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-400">
                    Başlık
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-neutral-400 sm:table-cell">
                    Kategori
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-neutral-400 md:table-cell">
                    Model
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-neutral-400 lg:table-cell">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-400">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {liste.map((oneri) => (
                  <tr
                    key={oneri.id}
                    className="bg-neutral-900 transition hover:bg-white/5"
                  >
                    <td className="max-w-xs px-4 py-3">
                      <div className="truncate font-medium text-white">
                        {oneri.baslik}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-neutral-500">
                        {oneri.icerik}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${KAT_STIL[oneri.kategori] ?? "bg-neutral-500/15 text-neutral-300"}`}
                      >
                        {oneri.kategori}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-neutral-400 md:table-cell">
                      {oneri.model}
                    </td>
                    <td className="hidden px-4 py-3 text-neutral-500 lg:table-cell">
                      {tarihFormatla(oneri.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${DURUM_STIL[oneri.durum] ?? "bg-neutral-500/20 text-neutral-300 border-neutral-500/30"}`}
                      >
                        {oneri.durum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
