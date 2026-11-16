import type { Metadata } from "next";

import { FavoritMitra } from "@/components/mitra/favorit-mitra";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Favorit", "Properti yang Anda simpan untuk ditinjau kembali.");
}

export default function MitraFavoritPage() {
  return (
    <>
      <FavoritMitra />
    </>
  );
}
