import type { Metadata } from "next";

import { FavoritSaya } from "@/components/akun/favorit-saya";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Favorit Saya", "Properti yang Anda simpan untuk ditinjau kembali.");
}

export default function AkunFavoritPage() {
  return (
    <>
      <FavoritSaya />
    </>
  );
}
