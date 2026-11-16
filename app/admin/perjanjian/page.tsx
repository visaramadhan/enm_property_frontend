import type { Metadata } from "next";

import { VersiPerjanjian } from "@/components/admin/versi-perjanjian";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Versi Perjanjian", "Kelola versi perjanjian kerja sama mitra.");
}

export default function AdminPerjanjianPage() {
  return (
    <>
      <VersiPerjanjian />
    </>
  );
}
