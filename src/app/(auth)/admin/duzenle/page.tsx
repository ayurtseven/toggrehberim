"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Durum = "yukleniyor" | "hazir" | "kaydediliyor" | "yayinlaniyor" | "siliniyor" | "hata";

function DuzenlemeSayfasi() {
  const params = useSearchParams();
  const router = useRouter();
  const dosya = params.get("dosya") || "";

  const [icerik, setIcerik] = useState("");
  const [orijinal, setOrijinal] = useState("");
  const [durum, setDurum] = useState<Durum>("yukleniyor");
  const [mesaj, setMesaj] = useState("");

  const taslakMi = dosya.includes("/draft/");
  const baslik = dosya.split("/").pop()?.replace(".mdx", "") || "İsimsiz";

  // Dosyayı yükle
  useEffect(() => {
    if (!dosya) return;
    fetch(`/api/admin/icerik?dosya=${encodeURIComponent(dosya)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.hata) {
          setDurum("hata");
          setMesaj(d.hata);
        } else {
          setIcerik(d.icerik);
          setOrijinal(d.icerik);
          setDurum("hazir");
        }
      })
      .catch(() => {
        setDurum("hata");
        setMesaj("Dosya yüklenemedi");
      });
  }, [dosya]);

  // Kaydet
  const kaydet = useCallback(async () => {
    setDurum("kaydediliyor");
    setMesaj("");
    const res = await fetch("/api/admin/icerik", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dosya, icerik }),
    });
    const d = await res.json();
    if (d.ok) {
      setOrijinal(icerik);
      setMesaj("✓ Kaydedildi");
    } else {
      setMesaj("✗ Kaydetme hatası: " + d.hata);
    }
    setDurum("hazir");
    setTimeout(() => setMesaj(""), 3000);
  }, [dosya, icerik]);

  // Yayınla (taslak → yayın)
  const yayinla = useCallback(async () => {
    // Önce kaydet
    setDurum("yayinlaniyor");
    await fetch("/api/admin/icerik", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dosya, icerik }),
    });
    // Sonra taşı
    const res = await fetch("/api/admin/icerik", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dosya }),
    });
    const d = await res.json();
    if (d.ok) {
      setMesaj("✓ Yayınlandı!");
      setTimeout(() => router.push("/admin"), 1200);
    } else {
      setMesaj("✗ Yayınlama hatası: " + d.hata);
      setDurum("hazir");
    }
  }, [dosya, icerik, router]);

  // Sil
  const sil = useCallback(async () => {
    if (!confirm("Bu içerik kalıcı olarak silinecek. Emin misin?")) return;
    setDurum("siliniyor");
    const res = await fetch(`/api/admin/icerik?dosya=${encodeURIComponent(dosya)}`, {
      method: "DELETE",
    });
    const d = await res.json();
    if (d.ok) {
      router.push("/admin");
    } else {
      setMesaj("✗ Silme hatası: " + d.hata);
      setDurum("hazir");
    }
  }, [dosya, router]);

  // Ctrl+S ile kaydet
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (durum === "hazir") kaydet();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [durum, kaydet]);

  const degisti = icerik !== orijinal;

  if (!dosya) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-neutral-400">Dosya parametresi eksik.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      {/* Üst bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-neutral-900 px-4">
        <Link
          href="/admin"
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:text-white"
        >
          ← Admin
        </Link>

        <div className="flex-1 truncate text-sm font-medium text-neutral-300">
          {dosya}
        </div>

        {/* Durum mesajı */}
        {mesaj && (
          <span
            className={`shrink-0 text-sm ${
              mesaj.startsWith("✓") ? "text-green-400" : "text-red-400"
            }`}
          >
            {mesaj}
          </span>
        )}

        {/* Değişiklik göstergesi */}
        {degisti && durum === "hazir" && (
          <span className="shrink-0 text-xs text-yellow-400">● Kaydedilmemiş</span>
        )}

        {/* Butonlar */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={kaydet}
            disabled={durum !== "hazir" || !degisti}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/20 disabled:opacity-40"
          >
            {durum === "kaydediliyor" ? "Kaydediliyor..." : "Kaydet"}
          </button>

          {taslakMi && (
            <button
              onClick={yayinla}
              disabled={durum !== "hazir"}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium transition hover:bg-green-500 disabled:opacity-40"
            >
              {durum === "yayinlaniyor" ? "Yayınlanıyor..." : "Yayınla"}
            </button>
          )}

          <button
            onClick={sil}
            disabled={durum !== "hazir"}
            className="rounded-lg bg-red-600/30 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-600/50 disabled:opacity-40"
          >
            {durum === "siliniyor" ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      </header>

      {/* Editör */}
      <main className="flex flex-1 flex-col">
        {durum === "yukleniyor" && (
          <div className="flex flex-1 items-center justify-center text-neutral-500">
            Yükleniyor...
          </div>
        )}

        {durum === "hata" && (
          <div className="flex flex-1 items-center justify-center text-red-400">
            {mesaj}
          </div>
        )}

        {(durum === "hazir" ||
          durum === "kaydediliyor" ||
          durum === "yayinlaniyor" ||
          durum === "siliniyor") && (
          <textarea
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none bg-neutral-950 p-6 font-mono text-sm leading-relaxed text-neutral-200 outline-none placeholder:text-neutral-600"
            placeholder="MDX içeriği..."
            style={{ tabSize: 2 }}
          />
        )}
      </main>

      {/* Alt bilgi */}
      <footer className="flex h-8 shrink-0 items-center border-t border-white/5 px-4">
        <span className="text-xs text-neutral-600">
          {icerik.split("\n").length} satır · {icerik.length} karakter · Ctrl+S ile kaydet
        </span>
      </footer>
    </div>
  );
}

export default function DuzenlemeSayfasiWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-500">
        Yükleniyor...
      </div>
    }>
      <DuzenlemeSayfasi />
    </Suspense>
  );
}
