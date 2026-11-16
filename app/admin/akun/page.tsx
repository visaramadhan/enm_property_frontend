import type { Metadata } from "next";

import { ManajemenAkun } from "@/components/admin/manajemen-akun";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Manajemen Akun", "Kelola akun, peran, dan status pengguna platform.");
}

export default function AdminAkunPage() {
  return (
    <>
      <ManajemenAkun />
    </>
  );
}
