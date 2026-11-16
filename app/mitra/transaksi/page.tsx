import type { Metadata } from "next";

import { TransaksiMitra } from "@/components/mitra/transaksi-mitra";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Transaksi", "Riwayat transaksi langganan dan status pembayarannya.");
}

export default function MitraTransaksiPage() {
  return (
    <>
      <TransaksiMitra />
    </>
  );
}
