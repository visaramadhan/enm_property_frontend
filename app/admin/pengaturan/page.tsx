import type { Metadata } from "next";

import { PengaturanSistem } from "@/components/admin/pengaturan-sistem";

export const metadata: Metadata = {
  title: "Pengaturan Sistem",
  description: "Konfigurasi global platform ENMProperty.",
};

export default function AdminPengaturanPage() {
  return <PengaturanSistem />;
}
