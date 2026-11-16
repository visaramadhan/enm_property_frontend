import type { Metadata } from "next";

import { LaporanMitraOwner } from "@/components/owner/laporan-mitra-owner";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Laporan Mitra", "Kinerja katalog dan interaksi setiap mitra.");
}

export default function OwnerMitraPage() {
  return (
    <>
      <LaporanMitraOwner />
    </>
  );
}
