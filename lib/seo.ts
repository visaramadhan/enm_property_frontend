/**
 * Konstanta SEO bersama.
 *
 * Dipakai oleh metadata, JSON-LD, `robots.ts`, dan `sitemap.ts` agar basis URL
 * situs hanya didefinisikan di satu tempat (DRY) dan tidak ada domain yang
 * tertulis keras di dalam komponen.
 */

/** Nama situs yang konsisten pada metadata dan skema terstruktur. */
export const NAMA_SITUS = "ENM Property";

/**
 * Basis URL publik situs. Diambil dari `NEXT_PUBLIC_SITE_URL`; nilai cadangan
 * `http://localhost:3000` dipakai pada pengembangan lokal agar canonical dan
 * sitemap tetap valid.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

/** Mengubah path relatif menjadi URL absolut (URL yang sudah absolut dilewatkan). */
export function urlAbsolut(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}
