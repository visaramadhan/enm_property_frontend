"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useProfilSaya } from "@/lib/api/hooks";
import { dashboardPeran, tujuanLanjut } from "@/lib/navigation";

/**
 * Penjaga halaman masuk: mengalihkan pengunjung yang sudah punya sesi aktif.
 *
 * Tanpa penjaga ini, pengguna yang sudah masuk masih dapat membuka `/login`
 * dan masuk kembali (perilaku berulang yang membingungkan). Karena area
 * autentikasi tidak memasang `AuthProvider`, profil dibaca langsung lewat
 * `useProfilSaya`; pengunjung anonim menerima 401 sehingga penjaga tidak
 * melakukan apa pun.
 */
export function PenjagaSudahMasuk() {
  const profil = useProfilSaya();
  const router = useRouter();

  const masuk = Boolean(profil.data);

  React.useEffect(() => {
    if (!masuk || !profil.data) return;
    router.replace(tujuanLanjut() ?? dashboardPeran(profil.data.role));
  }, [masuk, profil.data, router]);

  return null;
}
