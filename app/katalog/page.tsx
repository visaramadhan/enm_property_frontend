import type { Metadata } from "next";

import { KatalogPublik } from "@/components/katalog/katalog-publik";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Katalog Properti",
    "Jelajahi properti rumah, apartemen, ruko, dan tanah yang tayang di ENM Property.",
  );
}

/** Halaman katalog properti publik. */
export default function KatalogPage() {
  return (
    <>
      <KatalogPublik />
    </>
  );
}
