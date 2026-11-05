import type { Metadata } from "next";

import { AdminRingkasan } from "@/components/dashboard/admin-ringkasan";

export const metadata: Metadata = {
  title: "Ringkasan Admin",
  description: "Monitoring katalog properti, mitra, langganan, dan pembayaran platform.",
};

export default function AdminRingkasanPage() {
  return <AdminRingkasan />;
}
