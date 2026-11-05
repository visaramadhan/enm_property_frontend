import type { Metadata } from "next";

import { ManajemenMitra } from "@/components/admin/manajemen-mitra";

export const metadata: Metadata = {
  title: "Manajemen Mitra",
  description: "Verifikasi dan kelola seluruh mitra yang terdaftar di platform.",
};

export default function AdminMitraPage() {
  return <ManajemenMitra />;
}
