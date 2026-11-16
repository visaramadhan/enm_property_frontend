import type { Metadata } from "next";

import { AdminRingkasan } from "@/components/dashboard/admin-ringkasan";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Ringkasan Admin",
    "Monitoring katalog properti, mitra, langganan, dan pembayaran platform.",
  );
}

export default function AdminRingkasanPage() {
  return (
    <>
      <AdminRingkasan />
    </>
  );
}
