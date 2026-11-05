import type { Metadata } from "next";

import { VersiPerjanjian } from "@/components/admin/versi-perjanjian";

export const metadata: Metadata = {
  title: "Versi Perjanjian",
  description: "Kelola versi perjanjian kerja sama mitra.",
};

export default function AdminPerjanjianPage() {
  return <VersiPerjanjian />;
}
