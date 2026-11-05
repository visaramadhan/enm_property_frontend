/**
 * Utilitas papan klip (clipboard).
 *
 * Dipusatkan di sini agar seluruh tombol "Salin" (nomor virtual account, kode
 * QRIS, tautan checkout) memakai perilaku yang sama: memakai Clipboard API bila
 * tersedia, dengan fallback `execCommand` untuk konteks non-secure (localhost
 * tanpa HTTPS) supaya fitur salin tetap bekerja saat pengembangan.
 */
import { toastGagal, toastSukses } from "@/lib/toast";

export async function salinKePapanKlip(teks: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(teks);
      return true;
    } catch {
      // Lanjut ke fallback di bawah bila izin clipboard ditolak.
    }
  }

  if (typeof document === "undefined") return false;

  const area = document.createElement("textarea");
  area.value = teks;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

/**
 * Menyalin teks sekaligus menampilkan notifikasi hasilnya.
 *
 * Dipakai oleh tombol salin berbasis `Button` maupun aksi pada menu baris tabel
 * agar umpan balik sukses/gagal seragam tanpa menulis ulang logika toast (DRY).
 */
export async function salinDenganToast(
  teks: string,
  judulSukses = "Tersalin ke papan klip",
): Promise<boolean> {
  const berhasil = await salinKePapanKlip(teks);
  if (!berhasil) {
    toastGagal("Gagal menyalin", new Error("Papan klip tidak tersedia pada peramban ini."));
    return false;
  }
  toastSukses(judulSukses);
  return true;
}
