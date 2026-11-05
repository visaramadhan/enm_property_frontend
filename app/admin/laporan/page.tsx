import type { Metadata } from "next";

import { LaporanLangganan } from "@/components/admin/laporan-langganan";

export const metadata: Metadata = {
  title: "Laporan Langganan",
  description: "Rekapitulasi transaksi langganan paket mitra.",
};

export default function AdminLaporanPage() {
  return <LaporanLangganan />;
}
