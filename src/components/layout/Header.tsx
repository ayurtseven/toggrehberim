import Link from "next/link";
import AramaButonu from "@/components/ui/AramaButonu";
import AuthButonu from "@/components/layout/AuthButonu";
import ModelSeciciChip from "@/components/ui/ModelSeciciChip";

const navLinks = [
  { href: "/rehber", label: "Rehber" },
  { href: "/modeller", label: "Modeller" },
  { href: "/ikaz-arama", label: "İkaz Tanı" },
  { href: "/sarj-haritasi", label: "Şarj" },
  { href: "/sarj-hesaplayici", label: "Menzil Hesapla" },
  { href: "/sozluk", label: "Sözlük" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-bold tracking-tight"
        >
          <span className="text-[var(--togg-red)]">Togg</span>
          <span className="text-white">Rehberim</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModelSeciciChip />
          <AramaButonu />
          <AuthButonu />
        </div>
      </div>

      {/* Mobil nav */}
      <nav className="flex overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
