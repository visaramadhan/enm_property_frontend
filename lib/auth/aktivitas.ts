/**
 * Penyimpanan penanda aktivitas terakhir pengguna.
 *
 * Dipakai penjaga sesi idle (`PenjagaIdle`) untuk mengakhiri sesi otomatis
 * setelah 30 menit tanpa aktivitas, dan dibersihkan saat keluar (lihat
 * `lib/api/use-sesi.ts`) agar sesi yang baru masuk tidak langsung diakhiri
 * oleh stempel waktu lama.
 */

/** Batas sesi tanpa aktivitas sebelum pengguna otomatis dikeluarkan. */
export const BATAS_IDLE_MS = 30 * 60 * 1000;

const KUNCI_AKTIVITAS = "enm:aktivitas-terakhir";

/** Waktu aktivitas terakhir (epoch ms), atau 0 bila belum pernah tercatat. */
export function bacaAktivitasTerakhir(): number {
  try {
    const nilai = window.localStorage.getItem(KUNCI_AKTIVITAS);
    return nilai ? Number(nilai) || 0 : 0;
  } catch {
    // Penyimpanan diblokir (mode privat): anggap tidak ada catatan.
    return 0;
  }
}

/** Menyimpan waktu aktivitas terakhir. */
export function tandaiAktivitas(waktu: number = Date.now()): void {
  try {
    window.localStorage.setItem(KUNCI_AKTIVITAS, String(waktu));
  } catch {
    // Penyimpanan diblokir: penjaga sesi tetap berjalan memakai waktu di memori.
  }
}

/** Menghapus penanda aktivitas (dipanggil saat keluar). */
export function hapusAktivitas(): void {
  try {
    window.localStorage.removeItem(KUNCI_AKTIVITAS);
  } catch {
    // Tidak ada yang perlu dibersihkan.
  }
}
