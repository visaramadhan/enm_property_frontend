"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useProfilSaya } from "@/lib/api/hooks";
import { hapusAkunDummy } from "@/lib/auth/akun-dummy";
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
  const router = useRouter();
  const queryClient = useQueryClient();

  const keluar = React.useCallback(async () => {
    hapusAkunDummy();
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
    router.replace("/login");
  }, [queryClient, router]);

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
