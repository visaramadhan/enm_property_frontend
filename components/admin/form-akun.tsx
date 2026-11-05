"use client";

import type { Control } from "react-hook-form";
import { z } from "zod";

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

const telepon = z
  .string()
  .trim()
  .refine(
    (nilai) => nilai === "" || (nilai.length >= 8 && nilai.length <= 20),
    "Nomor telepon 8-20 digit",
  );

export const skemaPenggunaBaru = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  phone: telepon,
  role: peran,
});

export type NilaiPenggunaBaru = z.infer<typeof skemaPenggunaBaru>;

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
  return (
    <KelompokField judul="Akun baru" kolom={2}>
      <TextField
        control={control}
        name="name"
        label="Nama lengkap"
        wajib
        className="sm:col-span-2"
        autoComplete="off"
      />
      <TextField
        control={control}
        name="email"
        label="Email"
        type="email"
        inputMode="email"
        wajib
        className="sm:col-span-2"
        autoComplete="off"
      />
      <PasswordField
        control={control}
        name="password"
        label="Kata sandi awal"
        wajib
        autoComplete="new-password"
        deskripsi="Minimal 8 karakter; mintalah pengguna menggantinya."
        className="sm:col-span-2"
      />
      <TextField control={control} name="phone" label="Nomor telepon" type="tel" inputMode="tel" deskripsi="Opsional." />
      <SelectField control={control} name="role" label="Peran" opsi={OPSI_PERAN} wajib />
    </KelompokField>
  );
}

export const skemaPenggunaUbah = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  phone: telepon,
  role: peran,
});

export type NilaiPenggunaUbah = z.infer<typeof skemaPenggunaUbah>;

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
  return (
    <KelompokField judul="Data akun" kolom={2}>
      <TextField control={control} name="name" label="Nama lengkap" wajib className="sm:col-span-2" />
      <TextField control={control} name="phone" label="Nomor telepon" type="tel" inputMode="tel" deskripsi="Opsional." />
      <SelectField control={control} name="role" label="Peran" opsi={OPSI_PERAN} wajib />
    </KelompokField>
  );
}
