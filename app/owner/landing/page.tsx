import type { Metadata } from "next";

import { LandingCmsPeninjau } from "@/components/admin/landing-cms";

export const metadata: Metadata = {
  title: "Landing Page",
  description: "Pantau konten halaman utama ENMProperty (mode baca-saja).",
};

export default function OwnerLandingPage() {
  return <LandingCmsPeninjau />;
}
