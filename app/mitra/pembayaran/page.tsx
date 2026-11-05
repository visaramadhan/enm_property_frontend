import type { Metadata } from "next";

import { PembayaranMitra } from "@/components/mitra/pembayaran-mitra";

export const metadata: Metadata = {
  title: "Riwayat Pembayaran",
  description: "Tagihan langganan dan invoice pembayaran paket Anda.",
};

export default function MitraPembayaranPage() {
  return <PembayaranMitra />;
}
