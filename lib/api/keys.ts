/**
 * Pabrik kunci cache TanStack Query.
 *
 * Bentuk kunci dibuat seragam (`[sumber, jenis, ...argumen]`) agar pembatalan
 * cache dapat dilakukan per sumber data tanpa menulis daftar key panjang.
 */

export type KunciQuery = readonly unknown[];

const tunggal = (sumber: string) => [sumber] as const;
const daftar = (sumber: string, query?: Record<string, unknown>) =>
  [sumber, "daftar", query ?? {}] as const;
const detail = (sumber: string, id: string) => [sumber, "detail", id] as const;

export const kunci = {
  sesi: () => tunggal("sesi"),
  profilSaya: () => tunggal("me"),

  /* Admin */
  dashboardAdmin: () => tunggal("admin/dashboard"),
  mitraAdmin: (query?: Record<string, unknown>) => daftar("admin/mitra", query),
  detailMitraAdmin: (id: string) => detail("admin/mitra", id),
  propertiAdmin: (query?: Record<string, unknown>) => daftar("admin/properti", query),
  paketAdmin: (query?: Record<string, unknown>) => daftar("admin/paket", query),
  kategoriAdmin: (query?: Record<string, unknown>) => daftar("admin/kategori", query),
  pengguna: (query?: Record<string, unknown>) => daftar("admin/pengguna", query),
  perjanjian: (query?: Record<string, unknown>) => daftar("admin/perjanjian", query),
  audit: (query?: Record<string, unknown>) => daftar("admin/audit", query),
  pengaturan: () => tunggal("admin/pengaturan"),
  laporanLangganan: (query?: Record<string, unknown>) => daftar("laporan/langganan", query),

  /* Mitra */
  dashboardMitra: () => tunggal("vendor/dashboard"),
  langgananMitra: () => tunggal("vendor/langganan"),
  profilMitra: () => tunggal("vendor/profil"),
  perjanjianMitra: () => tunggal("vendor/perjanjian"),
  propertiMitra: (query?: Record<string, unknown>) => daftar("vendor/properti", query),
  detailPropertiMitra: (id: string) => detail("vendor/properti", id),
  transaksiMitra: (query?: Record<string, unknown>) => daftar("vendor/transaksi", query),
  favorit: (query?: Record<string, unknown>) => daftar("favorit", query),

  /* Publik */
  paketPublik: () => tunggal("paket/publik"),
  detailPaketPublik: (slug: string) => detail("paket/publik", slug),
  kategoriPublik: () => tunggal("kategori/publik"),
  propertiPublik: (query?: Record<string, unknown>) => daftar("properti/publik", query),
  detailPropertiPublik: (slug: string) => detail("properti/publik", slug),
  pengaturanPublik: () => tunggal("pengaturan/publik"),

  /* Owner */
  dashboardOwner: () => tunggal("owner/dashboard"),
  laporanLanggananOwner: (query?: Record<string, unknown>) =>
    daftar("owner/laporan-langganan", query),
  laporanMitraOwner: (query?: Record<string, unknown>) => daftar("owner/laporan-mitra", query),

  /* Invoice */
  invoice: (orderCode: string) => detail("invoice", orderCode),
  statusOrder: (orderCode: string) => detail("order/status", orderCode),
  pembayaranOrder: (orderCode: string) => detail("order/pembayaran", orderCode),
} as const;

/**
 * Prefiks sumber data untuk membatalkan seluruh entri (daftar + detail)
 * milik satu modul sekaligus setelah mutasi.
 */
export const awalan = {
  sesi: ["sesi"],
  profilSaya: ["me"],
  dashboardAdmin: ["admin/dashboard"],
  mitraAdmin: ["admin/mitra"],
  propertiAdmin: ["admin/properti"],
  paketAdmin: ["admin/paket"],
  kategoriAdmin: ["admin/kategori"],
  pengguna: ["admin/pengguna"],
  perjanjian: ["admin/perjanjian"],
  audit: ["admin/audit"],
  pengaturan: ["admin/pengaturan"],
  laporanLangganan: ["laporan/langganan"],
  laporanLanggananOwner: ["owner/laporan-langganan"],
  laporanMitraOwner: ["owner/laporan-mitra"],
  dashboardMitra: ["vendor/dashboard"],
  langgananMitra: ["vendor/langganan"],
  profilMitra: ["vendor/profil"],
  propertiMitra: ["vendor/properti"],
  transaksiMitra: ["vendor/transaksi"],
  favorit: ["favorit"],
  paketPublik: ["paket/publik"],
  kategoriPublik: ["kategori/publik"],
  pengaturanPublik: ["pengaturan/publik"],
  pembayaranOrder: ["order/pembayaran"],
} as const satisfies Record<string, readonly string[]>;
