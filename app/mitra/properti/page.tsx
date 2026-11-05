import type { Metadata } from "next";

import { PropertiMitra } from "@/components/mitra/properti-mitra";

export const metadata: Metadata = {
  title: "Properti Saya",
  description: "Kelola listing properti, status tayang, dan ketersediaan unit.",
};

export default function MitraPropertiPage() {
  return <PropertiMitra />;
}
