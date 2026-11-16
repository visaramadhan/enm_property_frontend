/**
 * Primitif bahasa yang dipakai bersama seluruh aplikasi.
 *
 * Dipisahkan dari kamus halaman landing agar halaman lain (autentikasi,
 * checkout, dashboard) memakai tipe, nama cookie, dan penormalan yang sama
 * tanpa menggandakan definisinya (DRY).
 */

export type Bahasa = "id" | "en";

/** Kunci bahasa yang dikenali; selain ini selalu jatuh ke Indonesia. */
export const BAHASA_BAWAAN: Bahasa = "id";

/** Nama cookie penyimpan pilihan bahasa pengunjung. */
export const COOKIE_BAHASA = "enm_bahasa";

/** Menormalkan string apa pun menjadi kunci bahasa yang sah. */
export function keBahasa(nilai: string | undefined | null): Bahasa {
  return nilai === "en" ? "en" : BAHASA_BAWAAN;
}
