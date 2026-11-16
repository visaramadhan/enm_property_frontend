import type { Metadata } from "next";

import { LaporanLangganan } from "@/components/admin/laporan-langganan";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Laporan Langganan", "Rekapitulasi transaksi langganan paket mitra.");
}

export default function AdminLaporanPage() {
  return (
    <>
      <LaporanLangganan />
    </>
  );
}
