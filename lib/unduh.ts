/**
 * Pemusatan unduhan berkas dari backend.
 *
 * Endpoint ekspor (XLSX/PDF) mengembalikan Blob; seluruh halaman memakai
 * fungsi ini agar mekanisme tautan sementara dan pembersihannya identik (DRY).
 */

/** Memicu unduhan berkas di browser dari `Blob` hasil endpoint ekspor. */
export function unduhBerkas(blob: Blob, namaBerkas: string) {
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = namaBerkas;
  document.body.appendChild(tautan);
  tautan.click();
  tautan.remove();
  URL.revokeObjectURL(url);
}
