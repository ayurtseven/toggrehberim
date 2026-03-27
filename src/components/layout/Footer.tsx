import Link from "next/link";

const links = {
  Rehber: [
    { href: "/rehber/sarj", label: "Şarj & Batarya" },
    { href: "/rehber/yazilim", label: "Yazılım & T-UI" },
    { href: "/rehber/bakim", label: "Bakım & Servis" },
    { href: "/rehber/suruculuk", label: "Sürüş İpuçları" },
  ],
  Modeller: [
    { href: "/modeller/t10x", label: "Togg T10X" },
    { href: "/modeller/t10f", label: "Togg T10F" },
    { href: "/modeller/karsilastir", label: "Karşılaştır" },
  ],
  Araçlar: [
    { href: "/ikaz-arama", label: "İkaz Tanı" },
    { href: "/sarj-haritasi", label: "Şarj Haritası" },
    { href: "/haberler", label: "Haberler" },
  ],
  Site: [
    { href: "/hakkinda", label: "Hakkında" },
    { href: "/iletisim", label: "İletişim" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
              <span className="text-[var(--togg-red)]">Togg</span>
              <span className="text-white">Rehberim</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-neutral-500">
              T10X ve T10F sahipleri için bağımsız kullanıcı rehberi ve topluluk portalı.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-600">
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/8 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} ToggRehberim.com — Bağımsız kullanıcı rehberi. Togg A.Ş. ile resmi bağlantısı yoktur.
          </p>
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--togg-red)]/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--togg-red)]/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--togg-red)]/20" />
          </div>
        </div>
      </div>
    </footer>
  );
}
