import type { MetadataRoute } from "next";

import { propertiSemua } from "@/lib/api/server";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap dinamis (`standa_seo_web.txt` bagian 3.A).
 *
 * Berisi rute statis publik (landing dan katalog) serta seluruh halaman detail
 * properti yang tayang. Daftar properti disusun dari fungsi server yang sudah
 * di-cache, sehingga pembuatan sitemap tidak membebani backend pada setiap
 * permintaan. Jika backend tidak dapat dihubungi, sitemap tetap berisi rute
 * statis agar tidak gagal total.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statis: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/en`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/katalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  let properti: Awaited<ReturnType<typeof propertiSemua>> = [];
  try {
    properti = await propertiSemua();
  } catch {
    properti = [];
  }

  const dinamis: MetadataRoute.Sitemap = properti.map((item) => ({
    url: `${SITE_URL}/katalog/${item.slug}`,
    lastModified: item.published_at || item.created_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...statis, ...dinamis];
}
