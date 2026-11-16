import type { Metadata } from "next";

import { KatalogPaket } from "@/components/admin/katalog-paket";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Katalog Paket", "Kelola paket langganan yang ditawarkan kepada mitra.");
}

export default function AdminPaketPage() {
  return (
    <>
      <KatalogPaket />
    </>
  );
}
