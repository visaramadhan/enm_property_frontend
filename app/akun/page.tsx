import type { Metadata } from "next";

import { TautanDashboard } from "@/components/akun/tautan-dashboard";
import { TautanFavorit } from "@/components/akun/tautan-favorit";
import { ProfilAkun } from "@/components/shared/profil-akun";

export const metadata: Metadata = {
  title: "Profil Saya",
  description: "Kelola informasi akun dan lihat properti favorit Anda.",
};

export default function AkunPage() {
  return (
    <ProfilAkun
      judul="Profil Saya"
      deskripsi="Perbarui identitas akun Anda dan lihat properti yang tersimpan."
      tombolBeranda
      aksi={
        <>
          <TautanDashboard />
          <TautanFavorit />
        </>
      }
    />
  );
}
