import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ikaz-arama",
        destination: "/ekranim",
        permanent: true,
      },
    ];
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.togg.com.tr",
      },
    ],
  },
  experimental: {
    mdxRs: true,
  },
};

export default nextConfig;
