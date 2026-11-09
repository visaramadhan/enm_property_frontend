import type { NextConfig } from "next";

/**
 * Membentuk pola `remotePatterns` dari sebuah URL agar `next/image` boleh
 * mengoptimalkan gambar yang berasal dari backend/situs sendiri.
 *
 * Host lokal (`localhost`/`127.0.0.1`) ditangani terpisah karena pada
 * pengembangan portnya dapat berubah-ubah.
 */
function polaHost(nilai: string | undefined) {
  if (!nilai) return null;
  try {
    const url = new URL(nilai);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return null;
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

/**
 * Host gambar eksternal yang boleh dioptimalkan `next/image`.
 *
 * - `images.unsplash.com`: dipakai data demo/seed backend.
 * - `storage.googleapis.com`: dipakai penyimpanan foto ketika
 *   `STORAGE_DRIVER=gcs` (lihat `backend/platform/storage/gcs.go`).
 *
 * Ini menjadi satu tempat untuk menambah host baru bila konten CMS memakai
 * penyedia gambar lain.
 */
const HOST_GAMBAR_EKSTERNAL = ["https://images.unsplash.com", "https://storage.googleapis.com"];

const hostGambar = Array.from(
  new Map(
    [
      polaHost(process.env.NEXT_PUBLIC_API_URL),
      polaHost(process.env.NEXT_PUBLIC_SITE_URL),
      ...HOST_GAMBAR_EKSTERNAL.map((nilai) => polaHost(nilai)),
    ]
      .filter((pola) => pola !== null)
      .map((pola) => [pola.hostname, pola]),
  ).values(),
);

const nextConfig: NextConfig = {
  /* config options here */
  /**
   * Indikator dev (ikon Next di pojok kiri + panel compile/status rute) dimatikan
   * agar tidak menutupi UI saat pengembangan. Error compile tetap dilaporkan.
   */
  devIndicators: false,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    /**
     * Gambar hero/OG landing page berasal dari penyimpanan backend
     * (`STORAGE_PUBLIC_BASE_URL`), sehingga host-nya harus diizinkan agar
     * `next/image` dapat mengoptimalkannya (WebP/AVIF).
     */
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      ...hostGambar,
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
