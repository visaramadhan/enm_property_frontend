import type { Metadata } from "next";

import { KatalogPublik } from "@/components/katalog/katalog-publik";

export const metadata: Metadata = {
  title: "Katalog Properti",
  description:
    "Jelajahi properti rumah, apartemen, ruko, dan tanah yang tayang di ENM Property.",
};

/** Halaman katalog properti publik. */
export default function KatalogPage() {
  return <KatalogPublik />;
}
