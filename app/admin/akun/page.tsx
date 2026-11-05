import type { Metadata } from "next";

import { ManajemenAkun } from "@/components/admin/manajemen-akun";

export const metadata: Metadata = {
  title: "Manajemen Akun",
  description: "Kelola akun, peran, dan status pengguna platform.",
};

export default function AdminAkunPage() {
  return <ManajemenAkun />;
}
