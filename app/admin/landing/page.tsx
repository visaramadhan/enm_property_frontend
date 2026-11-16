import type { Metadata } from "next";

import { LandingCmsEditor } from "@/components/admin/landing-cms";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Landing Page",
    "Kelola konten halaman utama ENMProperty: hero, metadata SEO, dan wilayah unggulan.",
  );
}

export default function AdminLandingPage() {
  return (
    <>
      <LandingCmsEditor />
    </>
  );
}
