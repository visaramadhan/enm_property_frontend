import type { Metadata } from "next";

import { LaporanLanggananOwner } from "@/components/owner/laporan-langganan-owner";

export const metadata: Metadata = {
  title: "Laporan Langganan",
  description: "Rekapitulasi transaksi langganan paket mitra.",
};

export default function OwnerLaporanPage() {
  return <LaporanLanggananOwner />;
}
