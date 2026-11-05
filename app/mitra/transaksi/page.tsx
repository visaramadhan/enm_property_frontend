import type { Metadata } from "next";

import { TransaksiMitra } from "@/components/mitra/transaksi-mitra";

export const metadata: Metadata = {
  title: "Transaksi",
  description: "Riwayat transaksi langganan dan status pembayarannya.",
};

export default function MitraTransaksiPage() {
  return <TransaksiMitra />;
}
