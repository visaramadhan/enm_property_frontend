"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { FormDialog } from "@/components/shared/form-dialog";
import { SelectField, TextareaField, type OpsiSelect } from "@/components/shared/form-field";

/**
 * Dialog ubah status bersama.
 *
 * Dipakai seluruh aksi pengubahan status (properti, mitra, akun) sehingga
 * validasi, susunan field, dan penanganan status memuatnya seragam (DRY).
 * Pemanggil cukup memetakan `{ status, reason }` ke body endpoint masing-masing.
 *
 * Catatan: render komponen ini secara kondisional dengan `key` unik per target
 * agar nilai awal terisi tanpa memerlukan effect sinkronisasi.
 */

/** Skema validasi dibuat per pemanggil agar pesan error mengikuti bahasa aktif. */
function buatSkema(t: (teks: string) => string) {
  return z.object({
    status: z.string().min(1, t("Pilih status terlebih dahulu")),
    reason: z.string().trim().max(255, t("Alasan maksimal 255 karakter")),
  });
}

export type NilaiStatus = z.infer<ReturnType<typeof buatSkema>>;

export function DialogUbahStatus({
  terbuka,
  onUbahTerbuka,
  judul,
  deskripsi,
  opsi,
  nilaiAwal = "",
  labelStatus,
  denganAlasan = false,
  labelAlasan,
  labelKirim,
  memuat = false,
  onKirim,
}: {
  terbuka: boolean;
  onUbahTerbuka: (terbuka: boolean) => void;
  judul: string;
  deskripsi?: string;
  opsi: readonly OpsiSelect[];
  nilaiAwal?: string;
  labelStatus?: string;
  denganAlasan?: boolean;
  labelAlasan?: string;
  labelKirim?: string;
  memuat?: boolean;
  onKirim: (nilai: NilaiStatus) => void;
}) {
  const { t } = useBahasa();
  const skema = React.useMemo(() => buatSkema(t), [t]);
  const teksLabelStatus = labelStatus ?? t("Status baru");
  const teksLabelAlasan = labelAlasan ?? t("Alasan");
  const teksLabelKirim = labelKirim ?? t("Perbarui status");

  const form = useForm<NilaiStatus>({
    resolver: zodResolver(skema),
    defaultValues: { status: nilaiAwal, reason: "" },
  });

  return (
    <FormDialog
      terbuka={terbuka}
      onUbahTerbuka={onUbahTerbuka}
      judul={judul}
      deskripsi={deskripsi}
      memuat={memuat}
      labelKirim={teksLabelKirim}
      onSubmit={form.handleSubmit(onKirim)}
    >
      <SelectField
        control={form.control}
        name="status"
        label={teksLabelStatus}
        opsi={opsi}
        wajib
        placeholder={t("Pilih status")}
      />
      {denganAlasan ? (
        <TextareaField
          control={form.control}
          name="reason"
          label={teksLabelAlasan}
          rows={3}
          deskripsi={t("Opsional, akan dicatat pada audit log.")}
        />
      ) : null}
    </FormDialog>
  );
}
