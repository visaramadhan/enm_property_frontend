"use client";

import * as React from "react";

import { useProfilSaya } from "@/lib/api/hooks";
import { useKeluar } from "@/lib/api/use-sesi";
import type { UserView } from "@/types/api";

interface KonteksAuth {
  /** Profil pengguna aktif dari `GET /me`, atau `null` bila belum masuk. */
  pengguna: UserView | null;
  /**
   * `true` selama sesi belum dapat dipastikan — mencakup pemulihan sesi Firebase
   * (`authStateReady`) dan pemuatan profil pertama. Penjaga rute harus menunggu
   * nilai ini agar tidak mengalihkan pengguna ke halaman masuk secara prematur
   * saat halaman dimuat ulang.
   */
  memuat: boolean;
  /** Keluar dari sesi Firebase (atau sesi demo) lalu kembali ke halaman masuk. */
  keluar: () => Promise<void>;
}

const KonteksAuth = React.createContext<KonteksAuth | null>(null);

/**
 * Menyediakan data sesi ke seluruh halaman dashboard.
 *
 * Identitas pengguna hanya diambil satu kali (`GET /me`) dan dibagikan lewat
 * context sehingga topbar, sidebar, dan halaman tidak memanggil API yang sama
 * berulang kali (DRY). Dipasang di layout per peran, bukan di root, agar
 * halaman publik tidak ikut meminta profil.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasil = useProfilSaya();
  const keluar = useKeluar();

  /* `GET /me` menunggu sesi Firebase dipulihkan (lihat `lib/api/client.ts`),
     namun status sesi tetap dilacak di sini agar konsumen context mempunyai satu
     penanda "belum siap" yang jelas sebelum sesi benar-benar diketahui. */
  const [sesiSiap, setSesiSiap] = React.useState(false);
  React.useEffect(() => {
    let aktif = true;
    void (async () => {
      try {
        const { tungguSesiFirebase } = await import("@/lib/firebase/client");
        await tungguSesiFirebase();
      } catch {
        // Firebase belum dikonfigurasi; anggap sesi siap tanpa menunggu.
      }
      if (aktif) setSesiSiap(true);
    })();
    return () => {
      aktif = false;
    };
  }, []);

  const nilai = React.useMemo<KonteksAuth>(
    () => ({
      pengguna: hasil.data ?? null,
      memuat: !sesiSiap || hasil.isPending,
      keluar,
    }),
    [hasil.data, hasil.isPending, sesiSiap, keluar],
  );

  return <KonteksAuth.Provider value={nilai}>{children}</KonteksAuth.Provider>;
}

export function useAuth() {
  const konteks = React.useContext(KonteksAuth);
  if (!konteks) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return konteks;
}
