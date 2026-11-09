import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Aturan perayapan otomatis (`standa_seo_web.txt` bagian 3.A).
 *
 * Katalog properti dibiarkan terbuka agar tetap terindeks, sementara endpoint
 * internal, dashboard, dan halaman autentikasi ditutup. Pola `/*?*` mencegah
 * duplikasi indeks akibat variasi query parameter filter katalog.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/katalog/", "/katalog/*"],
        disallow: ["/api/", "/dashboard/", "/admin/", "/login", "/register", "/*?*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
