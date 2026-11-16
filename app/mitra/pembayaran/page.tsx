import type { Metadata } from "next";

import { PembayaranMitra } from "@/components/mitra/pembayaran-mitra";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Riwayat Pembayaran",
    "Tagihan langganan dan invoice pembayaran paket Anda.",
  );
}

export default function MitraPembayaranPage() {
  return (
    <>
      <PembayaranMitra />
    </>
  );
}
