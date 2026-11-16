import type { Metadata } from "next";

import { MitraRingkasan } from "@/components/dashboard/mitra-ringkasan";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Ringkasan Mitra",
    "Pantau performa listing, kuota, dan status paket langganan Anda.",
  );
}

export default function MitraRingkasanPage() {
  return (
    <>
      <MitraRingkasan />
    </>
  );
}
