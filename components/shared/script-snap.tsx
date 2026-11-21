"use client";

import Script from "next/script";

import { snapClientKey, snapScriptUrl } from "@/lib/midtrans";

/**
 * Memuat snap.js Midtrans lebih awal memakai strategi `afterInteractive` agar
 * popup pembayaran dapat dibuka tanpa menunggu unduhan skrip dari CDN.
 *
 * Skrip tidak mengeblok render awal halaman dan menjadi "pemanasan" bagi
 * `loadSnap()` yang dipanggil saat pembayaran dimulai. Tanpa client key,
 * komponen tidak dirender karena Midtrans belum dikonfigurasi.
 */
export function ScriptSnap() {
  const clientKey = snapClientKey();
  if (!clientKey) return null;

  return (
    <Script
      id="midtrans-snap"
      src={snapScriptUrl()}
      data-client-key={clientKey}
      strategy="afterInteractive"
    />
  );
}
