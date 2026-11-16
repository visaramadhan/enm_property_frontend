import type { Metadata } from "next";

import { LanggananMitra } from "@/components/mitra/langganan-mitra";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Paket & Langganan",
    "Pilih paket langganan dan kelola masa aktif tayang properti Anda.",
  );
}

export default function MitraLanggananPage() {
  return (
    <>
      <LanggananMitra />
    </>
  );
}
