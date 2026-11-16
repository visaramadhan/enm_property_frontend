import type { Metadata } from "next";

import { PengaturanSistem } from "@/components/admin/pengaturan-sistem";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Pengaturan Sistem", "Konfigurasi global platform ENMProperty.");
}

export default function AdminPengaturanPage() {
  return (
    <>
      <PengaturanSistem />
    </>
  );
}
