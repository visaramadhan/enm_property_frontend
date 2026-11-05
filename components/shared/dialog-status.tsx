"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const skema = z.object({
  status: z.string().min(1, "Pilih status terlebih dahulu"),
  reason: z.string().trim().max(255, "Alasan maksimal 255 karakter"),
});

export type NilaiStatus = z.infer<typeof skema>;

export function DialogUbahStatus({
  terbuka,
  onUbahTerbuka,
  judul,
  deskripsi,
  opsi,
  nilaiAwal = "",
  labelStatus = "Status baru",
  denganAlasan = false,
  labelAlasan = "Alasan",
  labelKirim = "Perbarui status",
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
      labelKirim={labelKirim}
      onSubmit={form.handleSubmit(onKirim)}
    >
      <SelectField
        control={form.control}
        name="status"
        label={labelStatus}
        opsi={opsi}
        wajib
        placeholder="Pilih status"
      />
      {denganAlasan ? (
        <TextareaField
          control={form.control}
          name="reason"
          label={labelAlasan}
          rows={3}
          deskripsi="Opsional, akan dicatat pada audit log."
        />
      ) : null}
    </FormDialog>
  );
}
