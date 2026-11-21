"use client";

import * as React from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  KelompokField,
  SelectField,
  TextField,
  TextareaField,
  type OpsiSelect,
} from "@/components/shared/form-field";
import { useFasilitasPublik } from "@/lib/api/hooks";
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

/** Menerjemahkan label pada daftar opsi select tanpa mengubah `nilai`-nya. */
function terjemahOpsi(
  t: (teks: string) => string,
  opsi: readonly OpsiSelect[],
): OpsiSelect[] {
  return opsi.map((item) => ({ ...item, label: t(item.label) }));
}

/** Opsi penyimpanan dibuat lewat fungsi agar label mengikuti bahasa aktif. */
function opsiStatusSimpan(t: (teks: string) => string): OpsiSelect[] {
  return [
    /* Tayang lebih dulu karena menjadi pilihan bawaan pada formulir listing baru. */
    { nilai: "active", label: t("Tayangkan sekarang") },
    { nilai: "draft", label: t("Simpan sebagai draf") },
  ];
}

function bilangan(
  t: (teks: string, nilai?: Record<string, string | number>) => string,
  label: string,
  maks: number,
) {
  return z
    .string()
    .trim()
    .refine(
      (nilai) => nilai === "" || /^\d+$/.test(nilai),
      t("{label} harus berupa angka", { label }),
    )
    .refine(
      (nilai) => nilai === "" || Number(nilai) <= maks,
      t("{label} maksimal {maks}", { label, maks }),
    );
}

/** Skema dibuat per pemanggil agar pesan error mengikuti bahasa aktif. */
export function buatSkemaProperti(t: (teks: string) => string) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(5, t("Judul minimal 5 karakter"))
      .max(150, t("Judul maksimal 150 karakter")),
    description: z
      .string()
      .trim()
      .min(20, t("Deskripsi minimal 20 karakter"))
      .max(5000, t("Deskripsi maksimal 5000 karakter")),
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
    address: z
      .string()
      .trim()
      .min(1, t("Alamat wajib diisi"))
      .max(255, t("Alamat maksimal 255 karakter")),
    city: z.string().trim().min(1, t("Kota wajib diisi")).max(100, t("Kota maksimal 100 karakter")),
    province: z
      .string()
      .trim()
      .min(1, t("Provinsi wajib diisi"))
      .max(100, t("Provinsi maksimal 100 karakter")),
    district: z.string().trim().max(100, t("Kecamatan maksimal 100 karakter")),
    latitude: z
      .string()
      .trim()
      .refine(
        (nilai) =>
          nilai === "" ||
          (/^-?\d+(\.\d+)?$/.test(nilai) && Number(nilai) >= -90 && Number(nilai) <= 90),
        t("Lintang harus antara -90 dan 90"),
      ),
    longitude: z
      .string()
      .trim()
      .refine(
        (nilai) =>
          nilai === "" ||
          (/^-?\d+(\.\d+)?$/.test(nilai) && Number(nilai) >= -180 && Number(nilai) <= 180),
        t("Bujur harus antara -180 dan 180"),
      ),
    price: z
      .string()
      .trim()
      .min(1, t("Harga wajib diisi"))
      .refine((nilai) => /^\d+$/.test(nilai), t("Harga harus berupa angka")),
    price_period: z.enum(["hari", "bulan", "tahun"]).or(z.literal("")),
    land_area: bilangan(t, t("Luas tanah"), 1000000),
    building_area: bilangan(t, t("Luas bangunan"), 1000000),
    bedrooms: bilangan(t, t("Kamar tidur"), 50),
    bathrooms: bilangan(t, t("Kamar mandi"), 50),
    units_total: bilangan(t, t("Jumlah unit"), 10000),
    facilities: z.string().max(2000, t("Fasilitas terlalu panjang")),
    status: z.enum(["draft", "active"]),
  });
}

export type NilaiProperti = z.infer<ReturnType<typeof buatSkemaProperti>>;

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
  /* Listing baru langsung tayang secara bawaan; mitra dapat memilih "draft". */
  status: "active",
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

/** Seluruh bidang formulir properti; hanya butuh `control` dan `setValue` dari `useForm`. */
export function BidangProperti({
  control,
  setValue,
}: {
  control: Control<NilaiProperti>;
  setValue: UseFormSetValue<NilaiProperti>;
}) {
  const { t } = useBahasa();
  const tipePenawaran = useWatch({ control, name: "listing_type" });
  const fasilitasAktif = useWatch({ control, name: "facilities" });
  const fasilitasMaster = useFasilitasPublik();

  const opsiStatus = React.useMemo(() => opsiStatusSimpan(t), [t]);
  const opsiPenawaran = React.useMemo(() => terjemahOpsi(t, OPSI_TIPE_PENAWARAN), [t]);
  const opsiProperti = React.useMemo(() => terjemahOpsi(t, OPSI_TIPE_PROPERTI), [t]);
  const opsiPeriode = React.useMemo(() => terjemahOpsi(t, OPSI_PERIODE_HARGA), [t]);

  // Daftar fasilitas yang sudah tercentang (dari master maupun kustom).
  const terpilih = new Set(
    (fasilitasAktif || "")
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
  );

  function toggleFasilitas(nama: string, checked: boolean) {
    const daftar = Array.from(terpilih);
    if (checked) {
      if (!daftar.includes(nama)) daftar.push(nama);
    } else {
      const idx = daftar.indexOf(nama);
      if (idx >= 0) daftar.splice(idx, 1);
    }
    setValue("facilities", daftar.join(", "), { shouldDirty: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <KelompokField
        judul={t("Informasi dasar")}
        deskripsi={t("Judul dan deskripsi yang dilihat calon penyewa/pembeli.")}
      >
        <TextField
          control={control}
          name="title"
          label={t("Judul properti")}
          wajib
          placeholder={t("Contoh: Rumah 2 Lantai Dekat Kampus")}
        />
        <TextareaField
          control={control}
          name="description"
          label={t("Deskripsi")}
          wajib
          rows={5}
          deskripsi={t("Minimal 20 karakter, jelaskan keunggulan properti.")}
        />
      </KelompokField>

      <KelompokField judul={t("Klasifikasi")} kolom={2}>
        <SelectField
          control={control}
          name="listing_type"
          label={t("Jenis penawaran")}
          opsi={opsiPenawaran}
          wajib
        />
        <SelectField
          control={control}
          name="property_type"
          label={t("Jenis properti")}
          opsi={opsiProperti}
          wajib
        />
        <SelectField
          control={control}
          name="status"
          label={t("Status penyimpanan")}
          opsi={opsiStatus}
        />
      </KelompokField>

      <KelompokField judul={t("Lokasi")} kolom={2}>
        <TextField
          control={control}
          name="address"
          label={t("Alamat")}
          wajib
          placeholder={t("Nama jalan, nomor")}
          className="sm:col-span-2"
        />
        <TextField control={control} name="district" label={t("Kecamatan")} />
        <TextField control={control} name="city" label={t("Kota/Kabupaten")} wajib />
        <TextField control={control} name="province" label={t("Provinsi")} wajib />
        <TextField control={control} name="latitude" label={t("Lintang")} placeholder="-6.2000" />
        <TextField control={control} name="longitude" label={t("Bujur")} placeholder="106.8166" />
      </KelompokField>

      <KelompokField judul={t("Harga & ukuran")} kolom={2}>
        <TextField
          control={control}
          name="price"
          label={t("Harga")}
          wajib
          inputMode="numeric"
          placeholder="1500000000"
          deskripsi={t("Tanpa tanda titik atau koma.")}
        />
        {tipePenawaran === "disewa" ? (
          <SelectField
            control={control}
            name="price_period"
            label={t("Periode harga")}
            opsi={opsiPeriode}
            placeholder={t("Pilih periode")}
          />
        ) : null}
        <TextField
          control={control}
          name="land_area"
          label={t("Luas tanah (m²)")}
          inputMode="numeric"
        />
        <TextField
          control={control}
          name="building_area"
          label={t("Luas bangunan (m²)")}
          inputMode="numeric"
        />
        <TextField control={control} name="bedrooms" label={t("Kamar tidur")} inputMode="numeric" />
        <TextField control={control} name="bathrooms" label={t("Kamar mandi")} inputMode="numeric" />
        <TextField
          control={control}
          name="units_total"
          label={t("Jumlah unit")}
          inputMode="numeric"
          deskripsi={t("Isi bila properti memiliki beberapa unit.")}
        />
      </KelompokField>

      <KelompokField
        judul={t("Fasilitas")}
        deskripsi={t("Pilih fasilitas dari daftar atau tambahkan fasilitas kustom dipisah koma.")}
      >
        {fasilitasMaster.data && fasilitasMaster.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {fasilitasMaster.data.map((fasilitas) => (
              <label
                key={fasilitas.id}
                className="flex items-center gap-2 rounded-field border border-line bg-hover/30 px-3 py-2 text-[13px] text-ink"
              >
                <Checkbox
                  checked={terpilih.has(fasilitas.name)}
                  onCheckedChange={(nilai) => toggleFasilitas(fasilitas.name, nilai === true)}
                />
                <span className="truncate">{fasilitas.name}</span>
              </label>
            ))}
          </div>
        ) : null}
        <TextareaField
          control={control}
          name="facilities"
          label={t("Fasilitas kustom (opsional)")}
          rows={2}
          placeholder={t("Contoh: Smart Lock, Lift Barang")}
          deskripsi={t("Fasilitas yang dipilih dari daftar di atas otomatis masuk ke sini.")}
        />
      </KelompokField>
    </div>
  );
}
