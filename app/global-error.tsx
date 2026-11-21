"use client";

import { useEffect } from "react";

/**
 * Batas galat paling luar. Menggantikan root layout sehingga TIDAK boleh
 * bergantung pada provider i18n maupun Tailwind (globals.css milik root layout
 * tidak dimuat di sini) — gaya ditulis inline agar halaman tetap terbaca walau
 * root layout gagal dirender.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Galat fatal aplikasi:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "0 24px",
          textAlign: "center",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
          Aplikasi gagal dimuat
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b", maxWidth: 420 }}>
          Terjadi kesalahan tak terduga. Silakan muat ulang halaman; bila masih
          gagal, coba lagi beberapa saat lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 4,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "#0f172a",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Muat ulang
        </button>
      </body>
    </html>
  );
}
