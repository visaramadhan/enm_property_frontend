import type { Metadata } from "next";

import { LaporanLanggananOwner } from "@/components/owner/laporan-langganan-owner";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Laporan Langganan", "Rekapitulasi transaksi langganan paket mitra.");
}

export default function OwnerLaporanPage() {
  return (
    <>
      <LaporanLanggananOwner />
    </>
  );
}
