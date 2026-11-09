"use client";

import * as React from "react";

import { useProfilSaya } from "@/lib/api/hooks";
import { useKeluar } from "@/lib/api/use-sesi";
import type { UserView } from "@/types/api";

interface KonteksAuth {
  /** Profil pengguna aktif dari `GET /me`, atau `null` bila belum masuk. */
  pengguna: UserView | null;
  /** `true` selama profil pertama kali dimuat. */
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

  const nilai = React.useMemo<KonteksAuth>(
    () => ({
      pengguna: hasil.data ?? null,
      memuat: hasil.isPending,
      keluar,
    }),
    [hasil.data, hasil.isPending, keluar],
  );

  return <KonteksAuth.Provider value={nilai}>{children}</KonteksAuth.Provider>;
}

export function useAuth() {
  const konteks = React.useContext(KonteksAuth);
  if (!konteks) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return konteks;
}
