import type { Metadata } from "next";

import { ProfilAkun } from "@/components/shared/profil-akun";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Profil Saya", "Kelola informasi akun dan keamanan Anda.");
}

export default function AdminProfilPage() {
  return (
    <>
      <ProfilAkun />
    </>
  );
}
