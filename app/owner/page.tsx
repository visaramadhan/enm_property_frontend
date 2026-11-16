import type { Metadata } from "next";

import { RingkasanOwner } from "@/components/owner/ringkasan-owner";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Pemantauan Owner",
    "Ringkasan kinerja platform: mitra, properti, langganan, dan pendapatan.",
  );
}

export default function OwnerPage() {
  return (
    <>
      <RingkasanOwner />
    </>
  );
}
