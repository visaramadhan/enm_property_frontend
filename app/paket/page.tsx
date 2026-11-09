import type { Metadata } from "next";

import { KatalogPaketPublik } from "@/components/paket/katalog-paket-publik";

export const metadata: Metadata = {
  title: "Paket Langganan",
  description: "Bandingkan paket langganan ENM Property, lalu pilih paket yang sesuai kebutuhan Anda.",
};

export default function PaketPage() {
  return <KatalogPaketPublik />;
}
