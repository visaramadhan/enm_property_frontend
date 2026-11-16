"use client";

import type { Control } from "react-hook-form";
import { z } from "zod";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { KelompokField, PasswordField, SelectField, TextField } from "@/components/shared/form-field";
import { OPSI_PERAN } from "@/lib/enum";
import type { AdminCreateUserRequest, AdminUpdateUserRequest, Role, UserView } from "@/types/api";

/**
 * Skema & bidang formulir akun pengguna bersama.
 *
 * Dipakai halaman Manajemen Akun (buat & ubah) sehingga validasi yang sama
 * dengan DTO `AdminCreateUserRequest`/`AdminUpdateUserRequest` hanya ditulis
 * satu kali (DRY).
 */

const peran = z.enum(["customer", "mitra", "admin", "superadmin", "owner"]);

/** Penerjemah teks dari konteks bahasa. */
type Terjemah = (teks: string) => string;

function buatTelepon(t: Terjemah) {
  return z
    .string()
    .trim()
    .refine(
      (nilai) => nilai === "" || (nilai.length >= 8 && nilai.length <= 20),
      t("Nomor telepon 8-20 digit"),
    );
}

export function buatSkemaPenggunaBaru(t: Terjemah) {
  return z.object({
    email: z.email(t("Format email tidak valid")),
    password: z.string().min(8, t("Kata sandi minimal 8 karakter")),
    name: z.string().trim().min(3, t("Nama minimal 3 karakter")).max(100, t("Nama maksimal 100 karakter")),
    phone: buatTelepon(t),
    role: peran,
  });
}

export type NilaiPenggunaBaru = z.infer<ReturnType<typeof buatSkemaPenggunaBaru>>;

export const nilaiAwalPenggunaBaru: NilaiPenggunaBaru = {
  email: "",
  password: "",
  name: "",
  phone: "",
  role: "mitra",
};

export function keBuatPengguna(nilai: NilaiPenggunaBaru): AdminCreateUserRequest {
  return {
    email: nilai.email.trim(),
    password: nilai.password,
    name: nilai.name.trim(),
    phone: nilai.phone.trim() || undefined,
    role: nilai.role as Role,
  };
}

/** Bidang formulir pembuatan akun baru. */
export function BidangPenggunaBaru({ control }: { control: Control<NilaiPenggunaBaru> }) {
  const { t } = useBahasa();
  return (
    <KelompokField judul={t("Akun baru")} kolom={2}>
      <TextField
        control={control}
        name="name"
        label={t("Nama lengkap")}
        wajib
        className="sm:col-span-2"
        autoComplete="off"
      />
      <TextField
        control={control}
        name="email"
        label={t("Email")}
        type="email"
        inputMode="email"
        wajib
        className="sm:col-span-2"
        autoComplete="off"
      />
      <PasswordField
        control={control}
        name="password"
        label={t("Kata sandi awal")}
        wajib
        autoComplete="new-password"
        deskripsi={t("Minimal 8 karakter; mintalah pengguna menggantinya.")}
        className="sm:col-span-2"
      />
      <TextField control={control} name="phone" label={t("Nomor telepon")} type="tel" inputMode="tel" deskripsi={t("Opsional.")} />
      <SelectField
        control={control}
        name="role"
        label={t("Peran")}
        opsi={OPSI_PERAN.map((o) => ({ ...o, label: t(o.label) }))}
        wajib
      />
    </KelompokField>
  );
}

export function buatSkemaPenggunaUbah(t: Terjemah) {
  return z.object({
    name: z.string().trim().min(3, t("Nama minimal 3 karakter")).max(100, t("Nama maksimal 100 karakter")),
    phone: buatTelepon(t),
    role: peran,
  });
}

export type NilaiPenggunaUbah = z.infer<ReturnType<typeof buatSkemaPenggunaUbah>>;

/** Membentuk nilai awal form ubah dari data pengguna. */
export function nilaiDariPengguna(pengguna: UserView): NilaiPenggunaUbah {
  return {
    name: pengguna.name,
    phone: pengguna.phone ?? "",
    role: pengguna.role,
  };
}

export function keUpdatePengguna(nilai: NilaiPenggunaUbah): AdminUpdateUserRequest {
  return {
    name: nilai.name.trim(),
    phone: nilai.phone.trim() || undefined,
    role: nilai.role as Role,
  };
}

/** Bidang formulir penyuntingan akun (tanpa email & kata sandi). */
export function BidangPenggunaUbah({ control }: { control: Control<NilaiPenggunaUbah> }) {
  const { t } = useBahasa();
  return (
    <KelompokField judul={t("Data akun")} kolom={2}>
      <TextField control={control} name="name" label={t("Nama lengkap")} wajib className="sm:col-span-2" />
      <TextField control={control} name="phone" label={t("Nomor telepon")} type="tel" inputMode="tel" deskripsi={t("Opsional.")} />
      <SelectField
        control={control}
        name="role"
        label={t("Peran")}
        opsi={OPSI_PERAN.map((o) => ({ ...o, label: t(o.label) }))}
        wajib
      />
    </KelompokField>
  );
}
