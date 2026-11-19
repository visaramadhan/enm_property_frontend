"use client";

import * as React from "react";

import { inisialSitus, useIdentitasSitus } from "@/components/shared/logo-situs";

/**
 * Menyelaraskan favicon (ikon pada tab/judul dokumen) dengan logo situs yang
 * diatur admin, agar identik dengan yang tampil di navbar.
 *
 * Berkas `app/favicon.ico` bawaan Next.js sengaja dihapus supaya peramban tidak
 * pernah menampilkan ikon Next.js. Selama logo belum diatur, dipakai monogram
 * nama situs (data-URI SVG) yang serupa dengan penanda di navbar.
 *
 * Penyisipan tautan ikon dilakukan melalui `document.head` (bukan saat
 * prerender) supaya HTML hasil prerender tidak berubah.
 */
export function FaviconSitus() {
  const { logo_url, site_name, brand_color } = useIdentitasSitus();

  React.useEffect(() => {
    const href = logo_url || ikonMonogram(site_name, brand_color);
    const tipe = logo_url ? tebakTipeGambar(logo_url) : "image/svg+xml";
    gantiIkon("icon", href, tipe);
    gantiIkon("apple-touch-icon", href, tipe);
  }, [logo_url, site_name, brand_color]);

  return null;
}

/** Menebak MIME type dari ekstensi URL logo; bawaan `image/png`. */
function tebakTipeGambar(url: string): string {
  const bersih = url.split("?")[0].split("#")[0].toLowerCase();
  if (bersih.endsWith(".svg")) return "image/svg+xml";
  if (bersih.endsWith(".ico")) return "image/x-icon";
  if (bersih.endsWith(".jpg") || bersih.endsWith(".jpeg")) return "image/jpeg";
  if (bersih.endsWith(".webp")) return "image/webp";
  if (bersih.endsWith(".gif")) return "image/gif";
  return "image/png";
}

/**
 * Membentuk favicon monogram (data-URI SVG) dari inisial nama situs.
 *
 * Dipakai saat admin belum mengunggah logo sehingga ikon peramban tetap
 * menyerupai penanda pada navbar, bukan ikon bawaan peramban.
 */
function ikonMonogram(nama: string, warna: string): string {
  const inisial = inisialSitus(nama);
  const latar = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(warna) ? warna : "#0f172a";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="${latar}"/>` +
    `<text x="32" y="32" dy="0.35em" text-anchor="middle" ` +
    `font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="30" ` +
    `font-weight="700" fill="#ffffff">${inisial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Mengganti seluruh tautan ikon dengan `rel` tertentu.
 *
 * Ikon apa pun yang sudah ada dihapus lebih dulu agar peramban hanya memakai
 * logo tersimpan (atau monogram), bukan ikon lama.
 */
function gantiIkon(rel: string, href: string, tipe: string): void {
  document.head
    .querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`)
    .forEach((tautan) => tautan.remove());

  const baru = document.createElement("link");
  baru.rel = rel;
  baru.type = tipe;
  baru.href = href;
  document.head.appendChild(baru);
}
