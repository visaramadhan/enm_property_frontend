import type { Metadata } from "next";

import { TautanDashboard } from "@/components/akun/tautan-dashboard";
import { TautanFavorit } from "@/components/akun/tautan-favorit";
import { ProfilAkun } from "@/components/shared/profil-akun";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Profil Saya", "Kelola informasi akun dan lihat properti favorit Anda.");
}

export default function AkunPage() {
  return (
    <>
      <ProfilAkun
        tombolBeranda
        aksi={
          <>
            <TautanDashboard />
            <TautanFavorit />
          </>
        }
      />
    </>
  );
}
