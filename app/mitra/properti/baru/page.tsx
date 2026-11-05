import type { Metadata } from "next";

import { FormulirPropertiMitra } from "@/components/mitra/formulir-properti";

export const metadata: Metadata = {
  title: "Tambah Properti",
  description: "Lengkapi data properti baru lalu simpan sebagai draf atau ajukan untuk tayang.",
};

export default function TambahPropertiPage() {
  return <FormulirPropertiMitra />;
}
