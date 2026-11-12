import type { Metadata } from "next";

import { LandingHalaman, metadataLanding } from "@/components/landing/halaman-landing";

/**
 * Metadata halaman landing versi Inggris.
 *
 * Memakai varian `*_en` dari CMS dan menautkan dirinya ke versi Indonesia
 * lewat `alternates.languages` (hreflang).
 */
export function generateMetadata(): Promise<Metadata> {
  return metadataLanding("en");
}

/**
 * Landing page versi Inggris (rute `/en`).
 *
 * Teks dari CMS memakai kolom `*_en`; bila kolom itu kosong, halaman memakai
 * teks bawaan kamus Inggris sehingga tidak pernah tampil campur bahasa.
 */
export default function HomeInggris() {
  return <LandingHalaman bahasa="en" />;
}
