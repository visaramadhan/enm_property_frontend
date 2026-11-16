import type { Metadata } from "next";

import { KatalogPaketPublik } from "@/components/paket/katalog-paket-publik";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Paket Langganan",
    "Bandingkan paket langganan ENM Property, lalu pilih paket yang sesuai kebutuhan Anda.",
  );
}

export default function PaketPage() {
  return (
    <>
      <KatalogPaketPublik />
    </>
  );
}
