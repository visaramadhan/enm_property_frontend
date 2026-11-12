import type { Metadata } from "next";

import { LandingHalaman, metadataLanding } from "@/components/landing/halaman-landing";

/**
 * Metadata halaman utama (Bahasa Indonesia).
 *
 * Nilai diambil dari modul Metadata SEO di CMS; rinciannya ada pada
 * `metadataLanding` agar halaman `/` dan `/en` memakai satu sumber logika.
 */
export function generateMetadata(): Promise<Metadata> {
  return metadataLanding("id");
}

/**
 * Landing page utama (rute `/`, Bahasa Indonesia).
 *
 * Dirender sebagai Server Component sehingga seluruh teks utama sudah ada di
 * HTML awal — syarat perayapan Googlebot (`standa_seo_web.txt` bagian 1.A).
 */
export default function Home() {
  return <LandingHalaman bahasa="id" />;
}
