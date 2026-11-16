import type { Metadata } from "next";

import { PropertiMitra } from "@/components/mitra/properti-mitra";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Properti Saya",
    "Kelola listing properti, status tayang, dan ketersediaan unit.",
  );
}

export default function MitraPropertiPage() {
  return (
    <>
      <PropertiMitra />
    </>
  );
}
