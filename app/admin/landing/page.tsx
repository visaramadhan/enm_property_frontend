import type { Metadata } from "next";

import { LandingCmsEditor } from "@/components/admin/landing-cms";

export const metadata: Metadata = {
  title: "Landing Page",
  description: "Kelola konten halaman utama ENMProperty: hero, metadata SEO, dan wilayah unggulan.",
};

export default function AdminLandingPage() {
  return <LandingCmsEditor />;
}
