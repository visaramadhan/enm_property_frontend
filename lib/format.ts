import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

/** Zona waktu acuan seluruh platform. Indonesia tidak memakai DST. */
export const WIB_TIME_ZONE = "Asia/Jakarta";

type DateInput = Date | string | number;

function toDate(value: DateInput) {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Format tanggal/waktu ke zona waktu WIB (Asia/Jakarta) memakai Intl,
 * sehingga hasilnya konsisten walau server berjalan di zona waktu lain.
 */
export function formatWib(value: DateInput, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WIB_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(toDate(value));
}

export function formatTanggalWib(value: DateInput) {
  return formatWib(value, { hour: undefined, minute: undefined });
}

export function formatJamWib(value: DateInput) {
  return formatWib(value, { day: undefined, month: undefined, year: undefined });
}

/** Rupiah tanpa desimal, contoh: "Rp 1.500.000". */
export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Rupiah ringkas untuk kartu statistik, contoh: "Rp 1,5 jt". */
export function formatRupiahRingkas(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatAngka(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Label bulan singkat untuk sumbu grafik, contoh: "Jan". */
export function formatBulanSingkat(date: Date) {
  return format(date, "MMM", { locale: localeId });
}
