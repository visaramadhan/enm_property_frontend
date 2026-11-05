import type { Metadata } from "next";

import { RingkasanOwner } from "@/components/owner/ringkasan-owner";

export const metadata: Metadata = {
  title: "Pemantauan Owner",
  description: "Ringkasan kinerja platform: mitra, properti, langganan, dan pendapatan.",
};

export default function OwnerPage() {
  return <RingkasanOwner />;
}
