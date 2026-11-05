/**
 * Akun demo (dummy) untuk pengujian antarmuka tanpa akun Firebase.
 *
 * Backend pada mode pengembangan (`AUTH_DEV_MODE=true`) menerima token uji
 * berformat `<AUTH_DEV_TOKEN>:<firebaseUID>`. Setiap entri di bawah memakai
 * `firebaseUID` yang sama dengan data seed backend (`backend/database/seed.go`)
 * sehingga dashboard langsung terisi data contoh.
 *
 * Pilihan akun disimpan pada `localStorage` agar sesi demo bertahan saat
 * halaman dimuat ulang; token dibentuk dari awalan pada `NEXT_PUBLIC_DEV_AUTH_TOKEN`.
 */

import type { Role } from "@/types/api";

export interface AkunDummy {
  /** `firebaseUID` pada data seed backend. */
  uid: string;
  nama: string;
  email: string;
  peran: Role;
}

/**
 * Awalan token uji; nilainya harus sama dengan `AUTH_DEV_TOKEN` backend.
 *
 * Variabel `NEXT_PUBLIC_*` di-inline saat proses build/start sehingga perubahan
 * `.env.local` baru berlaku setelah server dijalankan ulang. Untuk berjaga bila
 * server masih memakai nilai lama yang sudah memuat pemisah (mis.
 * `dev-token:dev-admin`), awalan dinormalkan ke segmen sebelum `:` pertama —
 * bentuk yang sama dengan `AUTH_DEV_TOKEN` backend.
 */
const AWALAN_TOKEN = (process.env.NEXT_PUBLIC_DEV_AUTH_TOKEN ?? "").trim().split(":")[0];

const KUNCI_SIMPAN = "enm.akun-demo";

/** Panel akun demo hanya berfungsi bila awalan token uji tersedia. */
export const akunDummyTersedia = AWALAN_TOKEN.length > 0;

/** Label singkat peran untuk ditampilkan pada daftar akun demo. */
export const LABEL_PERAN: Record<Role, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  owner: "Owner",
  mitra: "Mitra",
  customer: "Pembeli",
};

export const AKUN_DUMMY: readonly AkunDummy[] = [
  {
    uid: "dev-superadmin",
    nama: "Bagas Superadmin",
    email: "superadmin@enmproperty.id",
    peran: "superadmin",
  },
  { uid: "dev-admin", nama: "Rani Admin", email: "admin@enmproperty.id", peran: "admin" },
  { uid: "dev-owner", nama: "Yusuf Pemilik", email: "owner@enmproperty.id", peran: "owner" },
  {
    uid: "dev-mitra-bali",
    nama: "Wayan Sudira",
    email: "mitra.bali@enmproperty.id",
    peran: "mitra",
  },
  {
    uid: "dev-mitra-jogja",
    nama: "Sri Handayani",
    email: "mitra.jogja@enmproperty.id",
    peran: "mitra",
  },
  {
    uid: "dev-customer",
    nama: "Dewi Lestari",
    email: "customer@example.com",
    peran: "customer",
  },
];

/** Token uji akun demo yang sedang dipilih, atau `null` bila belum ada. */
export function tokenAkunDummy(): string | null {
  if (typeof window === "undefined" || !akunDummyTersedia) return null;
  const uid = window.localStorage.getItem(KUNCI_SIMPAN);
  return uid ? `${AWALAN_TOKEN}:${uid}` : null;
}

/** Menyimpan pilihan akun demo sebagai sesi aktif. */
export function simpanAkunDummy(uid: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KUNCI_SIMPAN, uid);
}

/** Menghapus sesi demo sehingga pengguna kembali memakai alur Firebase. */
export function hapusAkunDummy(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KUNCI_SIMPAN);
}
