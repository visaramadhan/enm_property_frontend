"use client";

import * as React from "react";

import {
  BATAS_IDLE_MS,
  bacaAktivitasTerakhir,
  tandaiAktivitas,
} from "@/lib/auth/aktivitas";
import { useProfilSaya } from "@/lib/api/hooks";
import { useKeluar } from "@/lib/api/use-sesi";
import { useSudahTerpasang } from "@/lib/hooks/use-sudah-terpasang";

/**
 * Menjaga batas sesi tanpa aktivitas (30 menit).
 *
 * Selama pengguna masuk, aktivitas (klik, ketikan, sentuhan, gulir, atau
 * kembali ke tab) memperbarui penanda waktu. Bila penanda melewati batas —
 * baik saat halaman dibuka kembali maupun selama sesi berjalan — pengguna
 * otomatis dikeluarkan lewat `useKeluar` sehingga perilakunya sama dengan
 * keluar manual (bersihkan sesi, kosongkan cache, arahkan ke halaman masuk).
 *
 * Sesi hanya dipantau setelah komponen terpasang agar tidak mengganggu
 * prerender halaman statis.
 */

/** Peristiwa pada `window` yang dianggap sebagai aktivitas pengguna. */
const PERISTIWA: readonly (keyof WindowEventMap)[] = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
];

/** Jeda antar pemeriksaan batas idle. */
const JEDA_PERIKSA_MS = 60 * 1000;

export function PenjagaIdle() {
  const profil = useProfilSaya();
  const keluar = useKeluar();
  const sudahTerpasang = useSudahTerpasang();
  const masuk = Boolean(sudahTerpasang && profil.data);

  React.useEffect(() => {
    if (!masuk) return;

    const sekarang = Date.now();
    const terakhir = bacaAktivitasTerakhir();

    /* Halaman dibuka kembali setelah melewati batas: akhiri sesi segera. */
    if (terakhir > 0 && sekarang - terakhir >= BATAS_IDLE_MS) {
      void keluar();
      return;
    }

    let acuan = sekarang;
    tandaiAktivitas(acuan);

    const tandaiAktif = () => {
      acuan = Date.now();
      tandaiAktivitas(acuan);
    };

    /* Kembali ke tab: periksa lebih dulu apakah batas idle terlampaui selama
       tab tidak aktif. Tanpa pemeriksaan ini, peristiwa kembali selalu
       memperbarui penanda sehingga sesi lama tidak pernah diakhiri. */
    const saatKembali = () => {
      if (Date.now() - acuan >= BATAS_IDLE_MS) {
        void keluar();
        return;
      }
      tandaiAktif();
    };

    PERISTIWA.forEach((nama) =>
      window.addEventListener(nama, tandaiAktif, { passive: true }),
    );
    document.addEventListener("visibilitychange", saatKembali);

    const pemeriksa = window.setInterval(() => {
      if (Date.now() - acuan >= BATAS_IDLE_MS) void keluar();
    }, JEDA_PERIKSA_MS);

    return () => {
      PERISTIWA.forEach((nama) => window.removeEventListener(nama, tandaiAktif));
      document.removeEventListener("visibilitychange", saatKembali);
      window.clearInterval(pemeriksa);
    };
  }, [masuk, keluar]);

  return null;
}
