import type { Metadata } from "next";

import { LandingCmsPeninjau } from "@/components/admin/landing-cms";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Landing Page",
    "Pantau konten halaman utama ENMProperty (mode baca-saja).",
  );
}

export default function OwnerLandingPage() {
  return (
    <>
      <LandingCmsPeninjau />
    </>
  );
}
