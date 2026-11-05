import type { Metadata } from "next";

import { KatalogPaket } from "@/components/admin/katalog-paket";

export const metadata: Metadata = {
  title: "Katalog Paket",
  description: "Kelola paket langganan yang ditawarkan kepada mitra.",
};

export default function AdminPaketPage() {
  return <KatalogPaket />;
}
