"use client";

import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import {
  KelompokField,
  SelectField,
  TextField,
  TextareaField,
  type OpsiSelect,
} from "@/components/shared/form-field";
import { OPSI_PERIODE_HARGA, OPSI_TIPE_PENAWARAN, OPSI_TIPE_PROPERTI } from "@/lib/enum";
import type {
  CreatePropertyRequest,
  ListingType,
  PricePeriod,
  PropertyDetail,
  PropertyType,
} from "@/types/api";

/**
 * Skema & bidang formulir properti bersama.
 *
 * Dipakai halaman mitra (tambah/ubah) dan admin sehingga aturan validasi yang
 * sama dengan DTO backend hanya ditulis satu kali (DRY). Nilai numerik disimpan
 * sebagai teks agar cocok dengan elemen `<input>` lalu dikonversi pada
 * `kePermintaan`.
 */

const OPSI_STATUS_SIMPAN: OpsiSelect[] = [
  { nilai: "draft", label: "Simpan sebagai draf" },
  { nilai: "active", label: "Ajukan & tayangkan" },
];

function bilangan(label: string, maks: number) {
  return z
    .string()
    .trim()
    .refine((nilai) => nilai === "" || /^\d+$/.test(nilai), `${label} harus berupa angka`)
    .refine((nilai) => nilai === "" || Number(nilai) <= maks, `${label} maksimal ${maks}`);
}

export const skemaProperti = z.object({
  title: z.string().trim().min(5, "Judul minimal 5 karakter").max(150, "Judul maksimal 150 karakter"),
  description: z
    .string()
    .trim()
    .min(20, "Deskripsi minimal 20 karakter")
    .max(5000, "Deskripsi maksimal 5000 karakter"),
  listing_type: z.enum(["dijual", "disewa"]),
  property_type: z.enum([
    "rumah",
    "apartemen",
    "ruko",
    "tanah",
    "villa",
    "kantor",
    "gudang",
    "lainnya",
  ]),
  address: z.string().trim().min(1, "Alamat wajib diisi").max(255, "Alamat maksimal 255 karakter"),
  city: z.string().trim().min(1, "Kota wajib diisi").max(100, "Kota maksimal 100 karakter"),
  province: z
    .string()
    .trim()
    .min(1, "Provinsi wajib diisi")
    .max(100, "Provinsi maksimal 100 karakter"),
  district: z.string().trim().max(100, "Kecamatan maksimal 100 karakter"),
  latitude: z
    .string()
    .trim()
    .refine(
      (nilai) =>
        nilai === "" ||
        (/^-?\d+(\.\d+)?$/.test(nilai) && Number(nilai) >= -90 && Number(nilai) <= 90),
      "Lintang harus antara -90 dan 90",
    ),
  longitude: z
    .string()
    .trim()
    .refine(
      (nilai) =>
        nilai === "" ||
        (/^-?\d+(\.\d+)?$/.test(nilai) && Number(nilai) >= -180 && Number(nilai) <= 180),
      "Bujur harus antara -180 dan 180",
    ),
  price: z
    .string()
    .trim()
    .min(1, "Harga wajib diisi")
    .refine((nilai) => /^\d+$/.test(nilai), "Harga harus berupa angka"),
  price_period: z.enum(["hari", "bulan", "tahun"]).or(z.literal("")),
  land_area: bilangan("Luas tanah", 1000000),
  building_area: bilangan("Luas bangunan", 1000000),
  bedrooms: bilangan("Kamar tidur", 50),
  bathrooms: bilangan("Kamar mandi", 50),
  units_total: bilangan("Jumlah unit", 10000),
  facilities: z.string().max(2000, "Fasilitas terlalu panjang"),
  status: z.enum(["draft", "active"]),
});

export type NilaiProperti = z.infer<typeof skemaProperti>;

export const nilaiAwalProperti: NilaiProperti = {
  title: "",
  description: "",
  listing_type: "dijual",
  property_type: "rumah",
  address: "",
  city: "",
  province: "",
  district: "",
  latitude: "",
  longitude: "",
  price: "",
  price_period: "",
  land_area: "",
  building_area: "",
  bedrooms: "",
  bathrooms: "",
  units_total: "",
  facilities: "",
  status: "draft",
};

function teksAngka(nilai?: number) {
  return nilai === undefined || nilai === 0 ? "" : String(nilai);
}

/** Membentuk nilai awal form dari detail properti (mode ubah). */
export function nilaiDariProperti(properti: PropertyDetail): NilaiProperti {
  return {
    title: properti.title,
    description: properti.description,
    listing_type: properti.listing_type,
    property_type: properti.property_type,
    address: properti.address,
    city: properti.city,
    province: properti.province,
    district: properti.district,
    latitude: properti.latitude ? String(properti.latitude) : "",
    longitude: properti.longitude ? String(properti.longitude) : "",
    price: String(properti.price),
    price_period: properti.price_period ?? "",
    land_area: teksAngka(properti.land_area),
    building_area: teksAngka(properti.building_area),
    bedrooms: teksAngka(properti.bedrooms),
    bathrooms: teksAngka(properti.bathrooms),
    units_total: teksAngka(properti.units_total),
    facilities: properti.facilities.join(", "),
    status: properti.status === "active" ? "active" : "draft",
  };
}

function keAngka(nilai: string) {
  const teks = nilai.trim();
  return teks === "" ? undefined : Number(teks);
}

/** Mengubah nilai form menjadi body `CreatePropertyRequest`. */
export function kePermintaan(nilai: NilaiProperti): CreatePropertyRequest {
  const fasilitas = nilai.facilities
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    title: nilai.title.trim(),
    description: nilai.description.trim(),
    listing_type: nilai.listing_type as ListingType,
    property_type: nilai.property_type as PropertyType,
    address: nilai.address.trim(),
    city: nilai.city.trim(),
    province: nilai.province.trim(),
    district: nilai.district.trim() || undefined,
    latitude: keAngka(nilai.latitude),
    longitude: keAngka(nilai.longitude),
    price: Number(nilai.price),
    price_period:
      nilai.listing_type === "disewa"
        ? ((nilai.price_period || "bulan") as PricePeriod)
        : undefined,
    land_area: keAngka(nilai.land_area),
    building_area: keAngka(nilai.building_area),
    bedrooms: keAngka(nilai.bedrooms),
    bathrooms: keAngka(nilai.bathrooms),
    units_total: keAngka(nilai.units_total),
    facilities: fasilitas.length > 0 ? fasilitas : undefined,
    status: nilai.status === "active" ? "active" : "draft",
  };
}

/** Seluruh bidang formulir properti; hanya butuh `control` dari `useForm`. */
export function BidangProperti({ control }: { control: Control<NilaiProperti> }) {
  const tipePenawaran = useWatch({ control, name: "listing_type" });

  return (
    <div className="flex flex-col gap-6">
      <KelompokField
        judul="Informasi dasar"
        deskripsi="Judul dan deskripsi yang dilihat calon penyewa/pembeli."
      >
        <TextField
          control={control}
          name="title"
          label="Judul properti"
          wajib
          placeholder="Contoh: Rumah 2 Lantai Dekat Kampus"
        />
        <TextareaField
          control={control}
          name="description"
          label="Deskripsi"
          wajib
          rows={5}
          deskripsi="Minimal 20 karakter, jelaskan keunggulan properti."
        />
      </KelompokField>

      <KelompokField judul="Klasifikasi" kolom={2}>
        <SelectField
          control={control}
          name="listing_type"
          label="Jenis penawaran"
          opsi={OPSI_TIPE_PENAWARAN}
          wajib
        />
        <SelectField
          control={control}
          name="property_type"
          label="Jenis properti"
          opsi={OPSI_TIPE_PROPERTI}
          wajib
        />
        <SelectField
          control={control}
          name="status"
          label="Status penyimpanan"
          opsi={OPSI_STATUS_SIMPAN}
        />
      </KelompokField>

      <KelompokField judul="Lokasi" kolom={2}>
        <TextField
          control={control}
          name="address"
          label="Alamat"
          wajib
          placeholder="Nama jalan, nomor"
          className="sm:col-span-2"
        />
        <TextField control={control} name="district" label="Kecamatan" />
        <TextField control={control} name="city" label="Kota/Kabupaten" wajib />
        <TextField control={control} name="province" label="Provinsi" wajib />
        <TextField control={control} name="latitude" label="Lintang" placeholder="-6.2000" />
        <TextField control={control} name="longitude" label="Bujur" placeholder="106.8166" />
      </KelompokField>

      <KelompokField judul="Harga & ukuran" kolom={2}>
        <TextField
          control={control}
          name="price"
          label="Harga"
          wajib
          inputMode="numeric"
          placeholder="1500000000"
          deskripsi="Tanpa tanda titik atau koma."
        />
        {tipePenawaran === "disewa" ? (
          <SelectField
            control={control}
            name="price_period"
            label="Periode harga"
            opsi={OPSI_PERIODE_HARGA}
            placeholder="Pilih periode"
          />
        ) : null}
        <TextField control={control} name="land_area" label="Luas tanah (m²)" inputMode="numeric" />
        <TextField
          control={control}
          name="building_area"
          label="Luas bangunan (m²)"
          inputMode="numeric"
        />
        <TextField control={control} name="bedrooms" label="Kamar tidur" inputMode="numeric" />
        <TextField control={control} name="bathrooms" label="Kamar mandi" inputMode="numeric" />
        <TextField
          control={control}
          name="units_total"
          label="Jumlah unit"
          inputMode="numeric"
          deskripsi="Isi bila properti memiliki beberapa unit."
        />
      </KelompokField>

      <KelompokField judul="Fasilitas" deskripsi="Pisahkan tiap fasilitas dengan koma.">
        <TextareaField
          control={control}
          name="facilities"
          label="Fasilitas"
          rows={3}
          placeholder="Carport, Taman, Keamanan 24 jam"
        />
      </KelompokField>
    </div>
  );
}
