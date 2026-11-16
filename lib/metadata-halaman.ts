import { cookies } from "next/headers";
import type { Metadata } from "next";

import { terjemah } from "@/lib/app-i18n";
import { COOKIE_BAHASA, keBahasa } from "@/lib/bahasa";

/**
 * Metadata halaman yang mengikuti bahasa aktif pengunjung.
 *
 * Judul dan deskripsi ditulis dalam bahasa Indonesia (kunci kamus `app-i18n`)
 * lalu diterjemahkan sesuai cookie bahasa (`enm_bahasa`) yang sama dengan yang
 * dipakai `BahasaProvider`. Bahasa Indonesia dikembalikan apa adanya sehingga
 * tidak pernah tampil kosong saat padanan Inggris belum tersedia.
 *
 * Karena membaca cookie (data runtime), halaman pemakainya wajib menandai rute
 * sebagai dinamis lewat `<MetadataDinamis />` agar prerender tidak diblokir
 * (lihat `components/shared/metadata-dinamis.tsx`).
 */
export async function metadataHalaman(judul: string, deskripsi?: string): Promise<Metadata> {
  const bahasa = keBahasa((await cookies()).get(COOKIE_BAHASA)?.value);

  return {
    title: terjemah(bahasa, judul),
    description: deskripsi ? terjemah(bahasa, deskripsi) : undefined,
  };
}
