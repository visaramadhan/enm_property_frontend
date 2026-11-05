/**
 * Pemusatan seluruh notifikasi toast.
 *
 * Halaman tidak memanggil `toast.*` langsung agar gaya, durasi, dan
 * pemetaan pesan error selalu seragam (DRY).
 */

import { toast } from "sonner";

import { pesanErrorApi } from "@/lib/api/client";
import { pesanErrorAuth } from "@/lib/firebase/errors";

export function toastSukses(judul: string, deskripsi?: string) {
  toast.success(judul, { description: deskripsi });
}

export function toastGagal(judul: string, error: unknown) {
  toast.error(judul, { description: pesanErrorApi(error) });
}

/** Gagal pada alur Firebase Auth (kode error `auth/*` diterjemahkan). */
export function toastGagalAuth(judul: string, error: unknown) {
  toast.error(judul, { description: pesanErrorAuth(error) });
}

export function toastInfo(judul: string, deskripsi?: string) {
  toast.info(judul, { description: deskripsi });
}

export function toastPeringatan(judul: string, deskripsi?: string) {
  toast.warning(judul, { description: deskripsi });
}

/**
 * Menjalankan operasi async lalu menampilkan toast sesuai hasilnya.
 * Mengembalikan `true` bila berhasil sehingga pemanggil dapat menutup modal.
 */
export async function jalankanDenganToast(
  aksi: () => Promise<unknown>,
  opsi: { memuat: string; sukses: string; gagal: string },
): Promise<boolean> {
  const id = toast.loading(opsi.memuat);
  try {
    await aksi();
    toast.success(opsi.sukses, { id });
    return true;
  } catch (error) {
    toast.error(opsi.gagal, { id, description: pesanErrorApi(error) });
    return false;
  }
}
