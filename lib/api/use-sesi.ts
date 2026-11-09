"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ambilProfilSaya, kirimSesi } from "@/lib/api/endpoints";
import { awalan, kunci } from "@/lib/api/keys";
import { hapusAkunDummy, simpanAkunDummy } from "@/lib/auth/akun-dummy";
import { hapusAktivitas } from "@/lib/auth/aktivitas";
import type { SessionResponse } from "@/types/api";

/**
 * Menyinkronkan akun Firebase aktif dengan baris pengguna lokal lalu menyegarkan
 * cache sesi.
 *
 * Wajib dijalankan setelah Firebase Auth berhasil sebelum mengakses dashboard,
 * karena endpoint `GET /me` memakai middleware `LoadUser` yang menolak token
 * tanpa baris pengguna lokal (BE-02). Dipakai bersama oleh login dan register
 * agar alurnya tidak ditulis ulang (DRY).
 */
export function useSiapkanSesi() {
  const queryClient = useQueryClient();

  return React.useCallback(async (): Promise<SessionResponse> => {
    const sesi = await kirimSesi();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: awalan.profilSaya }),
      queryClient.invalidateQueries({ queryKey: awalan.sesi }),
    ]);
    return sesi;
  }, [queryClient]);
}

/**
 * Mengaktifkan sesi akun demo lalu menyegarkan cache sesi.
 *
 * Pemilihan akun demo langsung memakai baris pengguna pada data seed backend,
 * sehingga `POST /auth/session` tidak dipanggil (barisnya sudah ada) dan profil
 * contoh tidak tertimpa klaim token uji. Sesi Firebase yang mungkin masih aktif
 * diputus agar tidak terjadi dua sesi sekaligus.
 *
 * Sebelum dianggap berhasil, profil dimuat terlebih dahulu dengan token demo.
 * Bila backend menolaknya (mis. 401), sesi demo dibatalkan dan galat
 * diteruskan ke pemanggil agar pengguna melihat pesannya, bukan dialihkan
 * kembali ke halaman masuk secara senyap.
 */
export function useMasukAkunDummy() {
  const queryClient = useQueryClient();

  return React.useCallback(
    async (uid: string): Promise<void> => {
      simpanAkunDummy(uid);

      try {
        const [{ signOut }, { getFirebaseAuth, isFirebaseConfigured }] = await Promise.all([
          import("firebase/auth"),
          import("@/lib/firebase/client"),
        ]);
        if (isFirebaseConfigured) await signOut(getFirebaseAuth());
      } catch {
        // Firebase opsional pada mode demo; kegagalan di sini tidak menghalangi.
      }

      try {
        await queryClient.fetchQuery({
          queryKey: kunci.profilSaya(),
          queryFn: ambilProfilSaya,
        });
      } catch (error) {
        hapusAkunDummy();
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: awalan.sesi });
    },
    [queryClient],
  );
}

/**
 * Mengakhiri sesi aktif lalu kembali ke halaman masuk.
 *
 * Dipakai bersama oleh menu akun dan `AuthProvider` supaya langkah keluar
 * (bersihkan sesi demo, putus Firebase, kosongkan cache) hanya ditulis sekali
 * (DRY) dan berperilaku sama di seluruh halaman.
 */
export function useKeluar() {
  const queryClient = useQueryClient();

  return React.useCallback(async () => {
    hapusAkunDummy();
    /* Hapus penanda aktivitas agar sesi berikutnya memulai hitungan idle dari
       awal, bukan mewarisi stempel waktu sesi sebelumnya. */
    hapusAktivitas();
    try {
      const [{ signOut }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/client"),
      ]);
      await signOut(getFirebaseAuth());
    } catch {
      // Firebase belum dikonfigurasi; sesi lokal tetap dibersihkan.
    }
    queryClient.clear();
    /* Muat ulang dokumen secara penuh menuju halaman masuk. Navigasi klien
       (`router.replace`) menyisakan instans Firebase dan sisa keadaan di memori
       sehingga percobaan masuk berikutnya gagal sampai halaman di-refresh
       manual; memuat ulang dokumen memastikan halaman masuk benar-benar bersih. */
    window.location.replace("/login");
  }, [queryClient]);
}
