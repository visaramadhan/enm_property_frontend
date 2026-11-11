import type { Metadata } from "next";

import { KatalogFasilitas } from "@/components/admin/katalog-fasilitas";

export const metadata: Metadata = {
  title: "Master Fasilitas",
  description: "Kelola fasilitas properti yang dapat dipilih mitra.",
};

export default function AdminFasilitasPage() {
  return <KatalogFasilitas />;
}
