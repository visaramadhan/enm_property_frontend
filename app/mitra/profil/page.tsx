import type { Metadata } from "next";

import { ProfilMitra } from "@/components/mitra/profil-mitra";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Profil Mitra",
    "Kelola data badan usaha dan informasi akun kemitraan Anda.",
  );
}

export default function MitraProfilPage() {
  return (
    <>
      <ProfilMitra />
    </>
  );
}
