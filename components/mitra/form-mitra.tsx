"use client";

import type { Control } from "react-hook-form";
import { z } from "zod";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { KelompokField, TextField } from "@/components/shared/form-field";
import type { PartnerView, RegisterPartnerRequest } from "@/types/api";

/**
 * Skema & bidang formulir data mitra bersama.
 *
 * Dipakai halaman Profil Mitra (dan halaman lain yang menyunting data badan
 * usaha) sehingga aturan validasi yang sama dengan DTO backend hanya ditulis
 * satu kali (DRY).
 */

export function buatSkemaMitra(t: (teks: string) => string) {
  return z.object({
    business_name: z
      .string()
      .trim()
      .min(3, t("Nama bisnis minimal 3 karakter"))
      .max(150, t("Nama bisnis maksimal 150 karakter")),
    pic_name: z
      .string()
      .trim()
      .min(3, t("Nama penanggung jawab minimal 3 karakter"))
      .max(100, t("Nama penanggung jawab maksimal 100 karakter")),
    phone: z
      .string()
      .trim()
      .min(8, t("Nomor telepon minimal 8 digit"))
      .max(20, t("Nomor telepon maksimal 20 digit")),
    email: z.union([z.literal(""), z.email(t("Format email tidak valid"))]),
    address: z.string().trim().min(1, t("Alamat wajib diisi")).max(255, t("Alamat maksimal 255 karakter")),
    city: z.string().trim().min(1, t("Kota wajib diisi")).max(100, t("Kota maksimal 100 karakter")),
    province: z
      .string()
      .trim()
      .min(1, t("Provinsi wajib diisi"))
      .max(100, t("Provinsi maksimal 100 karakter")),
  });
}

export type NilaiMitra = z.infer<ReturnType<typeof buatSkemaMitra>>;

export const nilaiAwalMitra: NilaiMitra = {
  business_name: "",
  pic_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  province: "",
};

/** Membentuk nilai awal form dari profil mitra (mode ubah). */
export function nilaiDariMitra(mitra: PartnerView): NilaiMitra {
  return {
    business_name: mitra.business_name,
    pic_name: mitra.pic_name,
    phone: mitra.phone,
    email: mitra.email ?? "",
    address: mitra.address,
    city: mitra.city,
    province: mitra.province,
  };
}

/** Mengubah nilai form menjadi body `RegisterPartnerRequest`/`UpdatePartnerRequest`. */
export function keRegisterPartner(nilai: NilaiMitra): RegisterPartnerRequest {
  return {
    business_name: nilai.business_name.trim(),
    pic_name: nilai.pic_name.trim(),
    phone: nilai.phone.trim(),
    email: nilai.email.trim() || undefined,
    address: nilai.address.trim(),
    city: nilai.city.trim(),
    province: nilai.province.trim(),
  };
}

/**
 * Seluruh bidang data mitra; hanya butuh `control` dari `useForm`.
 *
 * Bila paket mitra tidak memberi akses nomor WhatsApp (mis. paket Gratis),
 * bidang nomor dikunci dan diisi nomor sistem supaya lead tetap terarah.
 */
export function BidangMitra({
  control,
  whatsappAktif = true,
  nomorSistem = "",
}: {
  control: Control<NilaiMitra>;
  whatsappAktif?: boolean;
  nomorSistem?: string;
}) {
  const { t } = useBahasa();
  const dibatasi = !whatsappAktif && nomorSistem.trim() !== "";

  return (
    <KelompokField judul={t("Data badan usaha")} kolom={2}>
      <TextField
        control={control}
        name="business_name"
        label={t("Nama bisnis / agensi")}
        wajib
        placeholder={t("Contoh: Griya Utama Property")}
        className="sm:col-span-2"
      />
      <TextField control={control} name="pic_name" label={t("Nama penanggung jawab")} wajib />
      <TextField
        control={control}
        name="phone"
        label={t("Nomor WhatsApp")}
        type="tel"
        inputMode="tel"
        wajib={!dibatasi}
        disabled={dibatasi}
        placeholder={dibatasi ? undefined : "0812xxxxxxx"}
        deskripsi={
          dibatasi
            ? t("Dikelola sistem. Calon penyewa/pembeli diarahkan ke nomor ini karena paket Anda belum mendukung nomor WhatsApp sendiri.")
            : undefined
        }
      />
      <TextField
        control={control}
        name="email"
        label={t("Email bisnis")}
        type="email"
        inputMode="email"
        placeholder={t("opsional")}
        className="sm:col-span-2"
      />
      <TextField
        control={control}
        name="address"
        label={t("Alamat")}
        wajib
        placeholder={t("Jalan, nomor, kelurahan")}
        className="sm:col-span-2"
      />
      <TextField control={control} name="city" label={t("Kota / kabupaten")} wajib />
      <TextField control={control} name="province" label={t("Provinsi")} wajib />
    </KelompokField>
  );
}
