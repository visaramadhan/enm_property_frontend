import type { Metadata } from "next";

import { FormulirPropertiMitra } from "@/components/mitra/formulir-properti";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Tambah Properti",
    "Lengkapi data properti baru lalu simpan sebagai draf atau ajukan untuk tayang.",
  );
}

export default function TambahPropertiPage() {
  return (
    <>
      <FormulirPropertiMitra />
    </>
  );
}
