import type { Metadata } from "next";

import { LanggananMitra } from "@/components/mitra/langganan-mitra";

export const metadata: Metadata = {
  title: "Paket & Langganan",
  description: "Pilih paket langganan dan kelola masa aktif tayang properti Anda.",
};

export default function MitraLanggananPage() {
  return <LanggananMitra />;
}
