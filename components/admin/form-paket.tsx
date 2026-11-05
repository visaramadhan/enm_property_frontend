"use client";

import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { CheckboxField, KelompokField, TextField, TextareaField } from "@/components/shared/form-field";
import type { CreatePlanRequest, PlanView, UpdatePlanRequest } from "@/types/api";

/**
 * Skema & bidang formulir paket langganan bersama.
 *
 * Dipakai halaman Katalog Paket (buat & ubah) sehingga aturan validasi yang
 * sama dengan DTO `CreatePlanRequest` hanya ditulis satu kali (DRY). Nilai
 * numerik disimpan sebagai teks agar cocok dengan `<input>` lalu dikonversi
 * pada `keCreatePlan`/`keUpdatePlan`.
 */

function bilangan(label: string, min: number, maks?: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .refine((nilai) => /^-?\d+$/.test(nilai), `${label} harus berupa angka`)
    .refine(
      (nilai) => Number(nilai) >= min && (maks === undefined || Number(nilai) <= maks),
      `${label} harus antara ${min}${maks === undefined ? "" : ` dan ${maks}`}`,
    );
}

export const skemaPaket = z.object({
  name: z.string().trim().min(3, "Nama paket minimal 3 karakter").max(100, "Nama paket maksimal 100 karakter"),
  slug: z
    .string()
    .trim()
    .max(60, "Slug maksimal 60 karakter")
    .refine((nilai) => nilai === "" || /^[a-z0-9-]+$/.test(nilai), "Slug hanya huruf kecil, angka, dan tanda hubung"),
  description: z.string().trim().max(500, "Deskripsi maksimal 500 karakter"),
  price: bilangan("Harga", 0),
  duration_days: bilangan("Durasi", 1, 3650),
  listing_quota: bilangan("Kuota listing", -1, 100000),
  sort_order: bilangan("Urutan", 0, 9999),
  features: z.string().max(2000, "Fasilitas terlalu panjang"),
  is_free: z.boolean(),
  is_active: z.boolean(),
  level: bilangan("Level", 1, 99),
  boost_enabled: z.boolean(),
  keyword_access: z.boolean(),
  catalog_access: z.boolean(),
  whatsapp_access: z.boolean(),
});

export type NilaiPaket = z.infer<typeof skemaPaket>;

export const nilaiAwalPaket: NilaiPaket = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  duration_days: "30",
  listing_quota: "10",
  sort_order: "0",
  features: "",
  is_free: false,
  is_active: true,
  level: "1",
  boost_enabled: false,
  keyword_access: false,
  catalog_access: false,
  whatsapp_access: false,
};

/** Membentuk nilai awal form dari paket yang sedang diubah. */
export function nilaiDariPaket(paket: PlanView): NilaiPaket {
  return {
    name: paket.name,
    slug: paket.slug,
    description: paket.description,
    price: String(paket.price),
    duration_days: String(paket.duration_days),
    listing_quota: String(paket.listing_quota),
    sort_order: String(paket.sort_order),
    features: paket.features.join("\n"),
    is_free: paket.is_free,
    is_active: paket.is_active,
    level: String(paket.level),
    boost_enabled: paket.boost_enabled,
    keyword_access: paket.keyword_access,
    catalog_access: paket.catalog_access,
    whatsapp_access: paket.whatsapp_access,
  };
}

function daftarFasilitas(nilai: string) {
  return nilai
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Mengubah nilai form menjadi body `CreatePlanRequest`. */
export function keCreatePlan(nilai: NilaiPaket): CreatePlanRequest {
  const fasilitas = daftarFasilitas(nilai.features);
  return {
    slug: nilai.slug.trim() || undefined,
    name: nilai.name.trim(),
    description: nilai.description.trim() || undefined,
    price: nilai.is_free ? 0 : Number(nilai.price),
    duration_days: Number(nilai.duration_days),
    listing_quota: Number(nilai.listing_quota),
    features: fasilitas.length > 0 ? fasilitas : undefined,
    is_free: nilai.is_free,
    is_active: nilai.is_active,
    sort_order: Number(nilai.sort_order),
    level: Number(nilai.level),
    // Paket gratis tidak memperoleh boost maupun akses pengaturan lanjutan;
    // backend menegakkan aturan yang sama (ApplyAccessRules).
    boost_enabled: nilai.is_free ? false : nilai.boost_enabled,
    keyword_access: nilai.is_free ? false : nilai.keyword_access,
    catalog_access: nilai.is_free ? false : nilai.catalog_access,
    whatsapp_access: nilai.is_free ? false : nilai.whatsapp_access,
  };
}

/** Mengubah nilai form menjadi body `UpdatePlanRequest` (tanpa slug). */
export function keUpdatePlan(nilai: NilaiPaket): UpdatePlanRequest {
  const isi = keCreatePlan(nilai);
  const { slug: _slug, ...rest } = isi;
  return rest;
}

/** Seluruh bidang formulir paket; hanya butuh `control` dari `useForm`. */
export function BidangPaket({
  control,
  modeUbah = false,
}: {
  control: Control<NilaiPaket>;
  /** Slug hanya dapat ditentukan saat pembuatan paket. */
  modeUbah?: boolean;
}) {
  const gratis = Boolean(useWatch({ control, name: "is_free" }));

  return (
    <div className="flex flex-col gap-6">
      <KelompokField judul="Identitas paket" kolom={2}>
        <TextField
          control={control}
          name="name"
          label="Nama paket"
          wajib
          placeholder="Contoh: Paket Pro"
          className="sm:col-span-2"
        />
        {modeUbah ? null : (
          <TextField
            control={control}
            name="slug"
            label="Slug"
            placeholder="opsional, dibuat otomatis bila kosong"
            className="sm:col-span-2"
          />
        )}
        <TextareaField
          control={control}
          name="description"
          label="Deskripsi"
          rows={3}
          className="sm:col-span-2"
        />
      </KelompokField>

      <KelompokField judul="Harga & masa aktif" kolom={2}>
        <TextField
          control={control}
          name="price"
          label="Harga"
          wajib
          inputMode="numeric"
          deskripsi="Tanpa tanda titik atau koma. Diabaikan bila paket gratis."
        />
        <TextField control={control} name="duration_days" label="Durasi (hari)" wajib inputMode="numeric" />
        <TextField
          control={control}
          name="listing_quota"
          label="Kuota listing"
          wajib
          inputMode="numeric"
          deskripsi="Isi -1 untuk kuota tanpa batas."
        />
        <TextField control={control} name="sort_order" label="Urutan tampil" inputMode="numeric" />
      </KelompokField>

      <KelompokField judul="Fasilitas" deskripsi="Pisahkan tiap fasilitas dengan koma atau baris baru.">
        <TextareaField control={control} name="features" label="Fasilitas" rows={4} />
      </KelompokField>

      <KelompokField
        judul="Level & boost"
        kolom={2}
        deskripsi="Level menentukan prioritas tampil di katalog; boost hanya berlaku bila paket mengizinkan."
      >
        <TextField
          control={control}
          name="level"
          label="Level paket"
          wajib
          inputMode="numeric"
          deskripsi="1 terendah. Makin tinggi makin diprioritaskan (1, 2, 3, ...)."
        />
        <CheckboxField
          control={control}
          name="boost_enabled"
          label="Boost listing aktif"
          deskripsi="Mitra dapat menaikkan peringkat listing sesuai level paket."
          disabled={gratis}
        />
      </KelompokField>

      <KelompokField
        judul="Akses pengaturan mitra"
        deskripsi="Paket gratis tidak memperoleh akses keyword, katalog, maupun nomor WhatsApp."
      >
        <CheckboxField
          control={control}
          name="keyword_access"
          label="Akses pengaturan keyword"
          deskripsi="Mitra dapat mengatur kata kunci pencarian listing."
          disabled={gratis}
        />
        <CheckboxField
          control={control}
          name="catalog_access"
          label="Akses pengaturan katalog"
          deskripsi="Mitra dapat mengatur tampilan katalog propertinya."
          disabled={gratis}
        />
        <CheckboxField
          control={control}
          name="whatsapp_access"
          label="Akses pengaturan nomor WhatsApp"
          deskripsi="Mitra dapat mengatur nomor WhatsApp untuk lead."
          disabled={gratis}
        />
      </KelompokField>

      <KelompokField judul="Status">
        <CheckboxField control={control} name="is_free" label="Paket gratis" deskripsi="Mitra dapat mengaktifkan paket ini tanpa pembayaran." />
        <CheckboxField control={control} name="is_active" label="Aktifkan paket" deskripsi="Paket aktif akan tampil pada halaman katalog publik." />
      </KelompokField>
    </div>
  );
}
