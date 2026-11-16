"use client";

import * as React from "react";

import { BAHASA_BAWAAN, COOKIE_BAHASA, keBahasa, type Bahasa } from "@/lib/bahasa";
import { terjemah, type NilaiTerjemah } from "@/lib/app-i18n";

/**
 * Penyedia bahasa aplikasi (autentikasi, checkout, dashboard mitra).
 *
 * Pilihan bahasa disimpan pada cookie yang sama dengan halaman landing
 * (`enm_bahasa`) sehingga preferensi pengunjung konsisten lintas halaman.
 * Nilai awal selalu Indonesia agar HTML hasil prerender identik dengan render
 * pertama di klien; cookie dibaca tepat sebelum cat pertama (`useLayoutEffect`)
 * sehingga tidak memicu hydration mismatch maupun kedipan teks.
 */

type KonteksBahasa = {
  bahasa: Bahasa;
  /** Menerjemahkan teks Indonesia ke bahasa aktif (fallback: teks asli). */
  t: (teks: string, nilai?: NilaiTerjemah) => string;
  /** Menyimpan pilihan bahasa ke cookie dan menyegarkan tampilan. */
  gantiBahasa: (bahasa: Bahasa) => void;
};

const Konteks = React.createContext<KonteksBahasa | null>(null);

/** `useLayoutEffect` hanya dijalankan di klien; di server memakai `useEffect`. */
const useEfekLayout = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** Membaca cookie bahasa; aman dipanggil dari klien maupun server. */
function bacaCookieBahasa(): Bahasa {
  if (typeof document === "undefined") return BAHASA_BAWAAN;
  const cocok = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_BAHASA}=([^;]*)`));
  return keBahasa(cocok?.[1]);
}

export function BahasaProvider({ children }: { children: React.ReactNode }) {
  const [bahasa, setBahasa] = React.useState<Bahasa>(BAHASA_BAWAAN);

  useEfekLayout(() => {
    const awal = bacaCookieBahasa();
    setBahasa(awal);
    document.documentElement.lang = awal;
  }, []);

  const gantiBahasa = React.useCallback((berikutnya: Bahasa) => {
    document.cookie = `${COOKIE_BAHASA}=${berikutnya}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = berikutnya;
    setBahasa(berikutnya);
  }, []);

  const nilai = React.useMemo<KonteksBahasa>(
    () => ({
      bahasa,
      t: (teks, isi) => terjemah(bahasa, teks, isi),
      gantiBahasa,
    }),
    [bahasa, gantiBahasa],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

/**
 * Mengambil konteks bahasa. Bila dipakai di luar `BahasaProvider` (mis. pada
 * halaman statis), teks tampil dalam bahasa Indonesia tanpa error.
 */
export function useBahasa(): KonteksBahasa {
  const nilai = React.useContext(Konteks);
  if (nilai) return nilai;
  return {
    bahasa: BAHASA_BAWAAN,
    t: (teks, isi) => terjemah(BAHASA_BAWAAN, teks, isi),
    gantiBahasa: () => {},
  };
}

/** Pintasan untuk komponen yang hanya membutuhkan fungsi terjemah. */
export function useT(): KonteksBahasa["t"] {
  return useBahasa().t;
}
