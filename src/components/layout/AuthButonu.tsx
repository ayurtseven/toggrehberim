"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuthButonu() {
  const [kullanici, setKullanici] = useState<User | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Mevcut oturumu al
    supabase.auth.getUser().then(({ data }) => {
      setKullanici(data.user);
      setYukleniyor(false);
    });

    // Auth değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setKullanici(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function cikisYap() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (yukleniyor) {
    return <div className="h-8 w-16 animate-pulse rounded-lg bg-white/10" />;
  }

  if (!kullanici) {
    return (
      <Link
        href="/giris"
        className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-medium text-neutral-300 transition hover:border-white/30 hover:text-white"
      >
        Giriş
      </Link>
    );
  }

  const kisaIsim =
    kullanici.user_metadata?.full_name?.split(" ")[0] ||
    kullanici.email?.split("@")[0] ||
    "Kullanıcı";

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/admin"
        className="hidden rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:border-white/20 hover:text-white sm:block"
      >
        Admin
      </Link>
      <button
        onClick={cikisYap}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-neutral-400 transition hover:border-red-500/40 hover:text-red-400"
      >
        {kisaIsim} · Çıkış
      </button>
    </div>
  );
}
