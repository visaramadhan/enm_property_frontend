import type { Metadata } from "next";

import { LaporanMitraOwner } from "@/components/owner/laporan-mitra-owner";

export const metadata: Metadata = {
  title: "Laporan Mitra",
  description: "Kinerja katalog dan interaksi setiap mitra.",
};

export default function OwnerMitraPage() {
  return <LaporanMitraOwner />;
}
