import type { Metadata } from "next";

import { KatalogKategori } from "@/components/admin/katalog-kategori";

export const metadata: Metadata = {
  title: "Master Kategori",
  description: "Kelola kategori properti untuk katalog publik.",
};

export default function AdminKategoriPage() {
  return <KatalogKategori />;
}
