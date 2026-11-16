import type { Metadata } from "next";

import { StatistikMitra } from "@/components/mitra/statistik-mitra";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Statistik Properti",
    "Statistik performa listing dan interaksi katalog properti Anda.",
  );
}

export default function MitraStatistikPage() {
  return (
    <>
      <StatistikMitra />
    </>
  );
}
