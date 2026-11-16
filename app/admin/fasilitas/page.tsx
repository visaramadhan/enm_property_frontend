import type { Metadata } from "next";

import { KatalogFasilitas } from "@/components/admin/katalog-fasilitas";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Master Fasilitas", "Kelola fasilitas properti yang dapat dipilih mitra.");
}

export default function AdminFasilitasPage() {
  return (
    <>
      <KatalogFasilitas />
    </>
  );
}
