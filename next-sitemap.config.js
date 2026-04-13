/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.toggrehberim.com",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  exclude: [
    "/admin",
    "/admin/*",
    "/auth/*",
    "/giris",
    "/offline",
    "/api/*",
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/api", "/giris"] },
    ],
  },
};
