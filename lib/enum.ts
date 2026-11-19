/**
 * Pustaka label & varian warna untuk seluruh enum domain.
 *
 * Dipakai bersama oleh `StatusBadge` dan seluruh dropdown filter/form agar
 * daftar pilihan hanya ditulis satu kali (DRY).
 */

import { formatRupiah } from "@/lib/format";
import type {
  AuditAction,
  ListingType,
  OrderStatus,
  PartnerStatus,
  PricePeriod,
  PropertyStatus,
  PropertyType,
  Role,
  SubscriptionStatus,
  UserStatus,
} from "@/types/api";

export type VarianBadge =
  | "accent"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "outline";

/** Kelompok status agar varian warna dapat dibedakan antar domain. */
export type JenisStatus =
  | "mitra"
  | "pengguna"
  | "properti"
  | "langganan"
  | "order"
  | "audit"
  | "peran";

const PETA_VARIAN: Record<JenisStatus, Record<string, VarianBadge>> = {
  mitra: {
    pending: "warning",
    active: "success",
    suspended: "danger",
    expired: "neutral",
  },
  pengguna: { active: "success", disabled: "danger" },
  properti: {
    draft: "neutral",
    pending_review: "warning",
    active: "success",
    inactive: "outline",
    expired: "danger",
  },
  langganan: { active: "success", expired: "danger", cancelled: "neutral" },
  order: {
    pending: "warning",
    paid: "success",
    failed: "danger",
    expired: "neutral",
    cancelled: "neutral",
  },
  audit: {
    create: "success",
    update: "info",
    delete: "danger",
    activate: "success",
    deactivate: "warning",
    reset_password: "warning",
    export: "info",
    login: "neutral",
  },
  peran: {
    customer: "neutral",
    mitra: "info",
    admin: "secondary",
    superadmin: "primary",
    owner: "accent",
  },
};

/** Menentukan varian warna badge dari jenis dan status domain. */
export function varianStatus(jenis: JenisStatus, status: string): VarianBadge {
  return PETA_VARIAN[jenis][status] ?? "neutral";
}

/** Mengubah `pending_review` menjadi `Pending review`. */
export function labelStatus(status: string): string {
  if (!status) return "-";
  const teks = status.replace(/_/g, " ");
  return teks.charAt(0).toUpperCase() + teks.slice(1);
}

export interface Opsi {
  nilai: string;
  label: string;
}

/** Membentuk daftar opsi dropdown dari pasangan label. */
export function buatOpsi<T extends string>(
  label: Record<T, string>,
): { nilai: T; label: string }[] {
  return (Object.keys(label) as T[]).map((nilai) => ({ nilai, label: label[nilai] }));
}

const LABEL_TIPE_PROPERTI: Record<PropertyType, string> = {
  rumah: "Rumah",
  apartemen: "Apartemen",
  ruko: "Ruko",
  tanah: "Tanah",
  villa: "Villa",
  kantor: "Kantor",
  gudang: "Gudang",
  lainnya: "Lainnya",
};

const LABEL_TIPE_PENAWARAN: Record<ListingType, string> = {
  dijual: "Dijual",
  disewa: "Disewa",
};

const LABEL_PERIODE_HARGA: Record<PricePeriod, string> = {
  hari: "Per hari",
  bulan: "Per bulan",
  tahun: "Per tahun",
};

const LABEL_STATUS_PROPERTI: Record<PropertyStatus, string> = {
  draft: "Draf",
  pending_review: "Menunggu review",
  active: "Tayang",
  inactive: "Nonaktif",
  expired: "Kedaluwarsa",
};

const LABEL_STATUS_MITRA: Record<PartnerStatus, string> = {
  pending: "Menunggu verifikasi",
  active: "Aktif",
  suspended: "Ditangguhkan",
  expired: "Kedaluwarsa",
};

const LABEL_STATUS_PENGGUNA: Record<UserStatus, string> = {
  active: "Aktif",
  disabled: "Nonaktif",
};

export const LABEL_PERAN: Record<Role, string> = {
  customer: "Customer",
  mitra: "Mitra",
  admin: "Admin",
  superadmin: "Superadmin",
  owner: "Owner",
};

const LABEL_STATUS_LANGGANAN: Record<SubscriptionStatus, string> = {
  active: "Aktif",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

const LABEL_STATUS_ORDER: Record<OrderStatus, string> = {
  pending: "Menunggu",
  paid: "Berhasil",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

const LABEL_AKSI_AUDIT: Record<AuditAction, string> = {
  create: "Membuat",
  update: "Memperbarui",
  delete: "Menghapus",
  activate: "Mengaktifkan",
  deactivate: "Menonaktifkan",
  reset_password: "Reset sandi",
  export: "Ekspor",
  login: "Masuk",
};

export const OPSI_TIPE_PROPERTI = buatOpsi(LABEL_TIPE_PROPERTI);
export const OPSI_TIPE_PENAWARAN = buatOpsi(LABEL_TIPE_PENAWARAN);
export const OPSI_PERIODE_HARGA = buatOpsi(LABEL_PERIODE_HARGA);
export const OPSI_STATUS_PROPERTI = buatOpsi(LABEL_STATUS_PROPERTI);
export const OPSI_STATUS_MITRA = buatOpsi(LABEL_STATUS_MITRA);
export const OPSI_STATUS_PENGGUNA = buatOpsi(LABEL_STATUS_PENGGUNA);
export const OPSI_PERAN = buatOpsi(LABEL_PERAN);
export const OPSI_STATUS_LANGGANAN = buatOpsi(LABEL_STATUS_LANGGANAN);
export const OPSI_STATUS_ORDER = buatOpsi(LABEL_STATUS_ORDER);
export const OPSI_AKSI_AUDIT = buatOpsi(LABEL_AKSI_AUDIT);

export const LABEL = {
  tipeProperti: LABEL_TIPE_PROPERTI,
  tipePenawaran: LABEL_TIPE_PENAWARAN,
  periodeHarga: LABEL_PERIODE_HARGA,
  statusProperti: LABEL_STATUS_PROPERTI,
  statusMitra: LABEL_STATUS_MITRA,
  statusPengguna: LABEL_STATUS_PENGGUNA,
  peran: LABEL_PERAN,
  statusLangganan: LABEL_STATUS_LANGGANAN,
  statusOrder: LABEL_STATUS_ORDER,
  aksiAudit: LABEL_AKSI_AUDIT,
} as const;

/**
 * Label harga properti yang sudah diterjemahkan, mis. "Rp 5.000.000 / Per bulan".
 *
 * Dipakai agar satuan periode (bulan/tahun) ikut berganti bahasa; nilai
 * `price_label` dari API selalu berbahasa Indonesia sehingga tidak dipakai.
 */
export function labelHargaProperti(
  price: number,
  period: PricePeriod | undefined,
  t: (teks: string) => string,
): string {
  const nominal = formatRupiah(price);
  if (!period) return nominal;
  return `${nominal} / ${t(LABEL_PERIODE_HARGA[period])}`;
}

/**
 * Label satu fasilitas paket langganan.
 *
 * Fasilitas disimpan sebagai teks bebas di basis data, sehingga pola berangka
 * (mis. "15 listing aktif") diterjemahkan lebih dulu, lalu sisanya dicocokkan
 * dengan kamus (teks yang belum punya padanan tampil apa adanya).
 */
export function labelFiturPaket(
  fitur: string,
  t: (teks: string, nilai?: Record<string, string | number>) => string,
): string {
  const listing = /^(\d+)\s+listing aktif$/i.exec(fitur);
  if (listing) return t("{n} listing aktif", { n: listing[1] });

  const masa = /^masa aktif (\d+)\s+hari$/i.exec(fitur);
  if (masa) return t("Masa aktif {n} hari", { n: masa[1] });

  return t(fitur);
}
