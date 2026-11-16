import type { Metadata } from "next";

import { ManajemenMitra } from "@/components/admin/manajemen-mitra";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Manajemen Mitra",
    "Verifikasi dan kelola seluruh mitra yang terdaftar di platform.",
  );
}

export default function AdminMitraPage() {
  return (
    <>
      <ManajemenMitra />
    </>
  );
}
