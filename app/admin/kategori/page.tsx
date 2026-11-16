import type { Metadata } from "next";

import { KatalogKategori } from "@/components/admin/katalog-kategori";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Master Kategori", "Kelola kategori properti untuk katalog publik.");
}

export default function AdminKategoriPage() {
  return (
    <>
      <KatalogKategori />
    </>
  );
}
