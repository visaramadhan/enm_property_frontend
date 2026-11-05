import type { Metadata } from "next";

import { MitraRingkasan } from "@/components/dashboard/mitra-ringkasan";

export const metadata: Metadata = {
  title: "Ringkasan Mitra",
  description: "Pantau performa listing, kuota, dan status paket langganan Anda.",
};

export default function MitraRingkasanPage() {
  return <MitraRingkasan />;
}
