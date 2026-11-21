"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/error-state";

/**
 * Batas galat tingkat rute (Next.js App Router).
 *
 * Mencegah satu komponen yang gagal dirender membuat seluruh halaman menjadi
 * blank atau crash. Pengguna diberi tombol "Coba lagi" untuk merender ulang
 * segmen ini tanpa memuat ulang seluruh aplikasi.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Jejak untuk diagnosis tanpa menampilkan detail teknis ke pengguna.
    console.error("Galat saat merender halaman:", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <ErrorState
        error={error}
        judul="Terjadi kesalahan saat menampilkan halaman"
        onCobaLagi={reset}
      />
    </div>
  );
}
