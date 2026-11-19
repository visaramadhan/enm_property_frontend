"use client";

import * as React from "react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { useSudahTerpasang } from "@/lib/hooks/use-sudah-terpasang";
import { toastSukses } from "@/lib/toast";

/**
 * Menitipkan pesan singkat antar-pemuatan-ulang dokumen.
 *
 * Sebagian alur (mis. menghapus akun) berakhir dengan `window.location.replace`
 * sehingga state toast di memori ikut hilang. Pesan dititipkan pada
 * `sessionStorage` lalu ditampilkan begitu dokumen tujuan selesai dimuat.
 */

const KUNCI_PESAN_SESI = "enm.pesan-sesi";

/** Menyimpan pesan (teks Indonesia apa adanya) untuk ditampilkan setelah muat ulang. */
export function titipPesanSesi(judul: string, deskripsi?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KUNCI_PESAN_SESI, JSON.stringify({ judul, deskripsi }));
  } catch {
    // Penyimpanan diblokir: pesan tidak dapat dititipkan.
  }
}

/**
 * Menampilkan pesan tertunda di dokumen aktif.
 *
 * Dipasang di akar aplikasi sehingga pesan yang dititipkan sebelum pengalihan
 * (mis. ke halaman utama) tetap tampil sekali lalu dibersihkan.
 */
export function PesanSesi() {
  const { t } = useBahasa();
  const sudahTerpasang = useSudahTerpasang();

  React.useEffect(() => {
    if (!sudahTerpasang) return;

    let mentah: string | null = null;
    try {
      mentah = window.sessionStorage.getItem(KUNCI_PESAN_SESI);
    } catch {
      return;
    }
    if (!mentah) return;

    try {
      window.sessionStorage.removeItem(KUNCI_PESAN_SESI);
    } catch {
      // Tidak ada yang perlu dibersihkan.
    }

    try {
      const pesan = JSON.parse(mentah) as { judul?: string; deskripsi?: string };
      if (pesan.judul) toastSukses(t(pesan.judul), pesan.deskripsi ? t(pesan.deskripsi) : undefined);
    } catch {
      // Isi tersimpan tidak valid; abaikan.
    }
  }, [sudahTerpasang, t]);

  return null;
}
