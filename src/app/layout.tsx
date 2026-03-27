import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#e8002d",
};

export const metadata: Metadata = {
  title: {
    default: "Togg Rehberim — Türkiye'nin Yerli EV Rehberi",
    template: "%s | Togg Rehberim",
  },
  description:
    "Togg T10X ve T10F için kapsamlı kullanıcı rehberi. Şarj, yazılım güncellemeleri, bakım ve sürüş ipuçları.",
  keywords: ["togg", "togg rehber", "togg t10x", "togg t10f", "elektrikli araba", "şarj"],
  openGraph: {
    siteName: "Togg Rehberim",
    locale: "tr_TR",
    type: "website",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.toggrehberim.com"
  ),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ToggRehberim",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Service Worker kaydı */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
