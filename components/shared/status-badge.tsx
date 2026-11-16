"use client";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { Badge } from "@/components/ui/badge";
import { labelStatus, varianStatus, type JenisStatus } from "@/lib/enum";

/**
 * Badge status tunggal untuk seluruh tabel.
 *
 * Label diambil dari backend bila tersedia (`status_label`), sehingga tidak
 * perlu duplikasi peta label di setiap halaman. Teks label diterjemahkan sesuai
 * bahasa aktif agar badge ikut berganti ketika pengguna memilih Inggris.
 */
export function StatusBadge({
  jenis,
  status,
  label,
}: {
  jenis: JenisStatus;
  status: string;
  label?: string;
}) {
  const { t } = useBahasa();
  return <Badge variant={varianStatus(jenis, status)}>{t(label ?? labelStatus(status))}</Badge>;
}
