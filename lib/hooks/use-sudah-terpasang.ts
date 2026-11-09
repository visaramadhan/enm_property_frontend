"use client";

import * as React from "react";

/** Tanpa langganan: nilai dibaca sekali tiap render, bukan dari store eksternal. */
export const tanpaLangganan = () => () => {};

/**
 * Menandai bahwa komponen sudah terpasang di sisi klien.
 *
 * Beberapa tampilan publik (logo situs, menu akun, tombol favorit) bergantung
 * pada data yang hanya tersedia setelah permintaan sisi klien selesai. Render
 * pertama di klien (tahap hidrasi) harus memakai nilai bawaan yang sama dengan
 * hasil prerender agar tidak terjadi hydration mismatch; setelah hidrasi React
 * memakai snapshot klien (`true`) lalu menampilkan data sebenarnya.
 *
 * Dibuat sebagai hook bersama agar pola ini tidak ditulis ulang di tiap
 * komponen yang membutuhkannya (DRY).
 */
export function useSudahTerpasang() {
  return React.useSyncExternalStore(tanpaLangganan, () => true, () => false);
}
