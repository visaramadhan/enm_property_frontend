"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * Apakah pelacakan GA4 aktif.
 *
 * `NEXT_PUBLIC_GA_ID` di-inline saat build. Bila kosong, seluruh pemanggilan
 * pelacakan menjadi no-op sehingga aplikasi tetap berjalan tanpa Google
 * Analytics pada lingkungan pengembangan.
 */
const GA_AKTIF = Boolean(process.env.NEXT_PUBLIC_GA_ID);

/**
 * Mengirim event GA4 secara non-blocking.
 *
 * Dibungkus sekali di sini (DRY) agar komponen tidak perlu mengimpor paket
 * `@next/third-parties/google` langsung dan selalu mengikuti pemeriksaan
 * `NEXT_PUBLIC_GA_ID`.
 */
export function lacakEvent(nama: string, parameter: Record<string, unknown>): void {
  if (!GA_AKTIF) return;
  sendGAEvent("event", nama, parameter);
}
