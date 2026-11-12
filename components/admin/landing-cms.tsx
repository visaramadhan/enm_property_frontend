"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, LoaderCircle, Plus, Rocket, Save, Trash2 } from "lucide-react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { FormField, KelompokField, TextareaField, TextField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useLandingAdmin,
  useLandingOwner,
  usePerbaruiLanding,
  usePublikasikanLanding,
  useUnggahGambarLanding,
} from "@/lib/api/hooks";
import { formatWib } from "@/lib/format";
import type { LandingContentView, LandingFAQItem, LandingImageKind } from "@/types/api";

/** Jumlah area prioritas yang diwajibkan skema: minimal 4, maksimal 6. */
const AREA_MINIMAL = 4;
const AREA_MAKSIMAL = 6;
/** Batas gambar kolase hero dan jumlah pertanyaan FAQ (selaras `backend/dto`). */
const KOLASE_MAKSIMAL = 4;
const FAQ_MAKSIMAL = 12;

/**
 * Batas panjang mengikuti `backend/dto/landing.go` sekaligus aturan SEO pada
 * `standar_cms.txt`: meta_title 50-60 karakter, meta_description 120-160,
 * hero_title maksimal 70, dan 4-6 area prioritas berisi maksimal 60 karakter.
 */
const skemaLanding = z.object({
  hero_title: z.string().trim().min(1, "Judul hero wajib diisi").max(70, "Maksimal 70 karakter"),
  hero_subtitle: z.string().trim().max(150, "Maksimal 150 karakter"),
  hero_cta_text: z.string().trim().max(40, "Maksimal 40 karakter"),
  hero_image_url: z.string().trim().max(500, "Maksimal 500 karakter"),
  hero_images: z
    .array(z.string().trim().max(500, "Maksimal 500 karakter"))
    .max(KOLASE_MAKSIMAL, `Maksimal ${KOLASE_MAKSIMAL} gambar kolase`),
  meta_title: z.string().trim().min(50, "Minimal 50 karakter").max(60, "Maksimal 60 karakter"),
  meta_description: z
    .string()
    .trim()
    .min(120, "Minimal 120 karakter")
    .max(160, "Maksimal 160 karakter"),
  meta_og_image: z.string().trim().max(500, "Maksimal 500 karakter"),
  highlight_areas: z
    .array(
      z.string().trim().min(1, "Nama area tidak boleh kosong").max(60, "Maksimal 60 karakter"),
    )
    .min(AREA_MINIMAL, "Minimal 4 area prioritas")
    .max(AREA_MAKSIMAL, "Maksimal 6 area prioritas"),
  cta_title: z.string().trim().max(70, "Maksimal 70 karakter"),
  cta_description: z.string().trim().max(200, "Maksimal 200 karakter"),
  keunggulan_title: z.string().trim().max(70, "Maksimal 70 karakter"),
  keunggulan_subtitle: z.string().trim().max(200, "Maksimal 200 karakter"),
  properti_title: z.string().trim().max(70, "Maksimal 70 karakter"),
  properti_subtitle: z.string().trim().max(200, "Maksimal 200 karakter"),
  paket_title: z.string().trim().max(70, "Maksimal 70 karakter"),
  paket_subtitle: z.string().trim().max(200, "Maksimal 200 karakter"),
  panduan_title: z.string().trim().max(70, "Maksimal 70 karakter"),
  panduan_subtitle: z.string().trim().max(200, "Maksimal 200 karakter"),
  faq_title: z.string().trim().max(70, "Maksimal 70 karakter"),
  faq_subtitle: z.string().trim().max(200, "Maksimal 200 karakter"),
  // Daftar pertanyaan-jawaban. Baris yang tidak lengkap dibuang backend, jadi
  // di sini cukup dibatasi panjang dan jumlahnya saja.
  faq_items: z
    .array(
      z.object({
        tanya: z.string().trim().max(200, "Maksimal 200 karakter"),
        jawab: z.string().trim().max(1000, "Maksimal 1000 karakter"),
      }),
    )
    .max(FAQ_MAKSIMAL, `Maksimal ${FAQ_MAKSIMAL} pertanyaan`),
  // Varian bahasa Inggris (khusus halaman `/en`). Semua opsional: bila
  // dikosongkan, halaman Inggris memakai teks bawaan komponen.
  hero_title_en: z.string().trim().max(70, "Maksimal 70 karakter"),
  hero_subtitle_en: z.string().trim().max(150, "Maksimal 150 karakter"),
  hero_cta_text_en: z.string().trim().max(40, "Maksimal 40 karakter"),
  meta_title_en: z.string().trim().max(60, "Maksimal 60 karakter"),
  meta_description_en: z.string().trim().max(160, "Maksimal 160 karakter"),
  cta_title_en: z.string().trim().max(70, "Maksimal 70 karakter"),
  cta_description_en: z.string().trim().max(200, "Maksimal 200 karakter"),
  keunggulan_title_en: z.string().trim().max(70, "Maksimal 70 karakter"),
  keunggulan_subtitle_en: z.string().trim().max(200, "Maksimal 200 karakter"),
  properti_title_en: z.string().trim().max(70, "Maksimal 70 karakter"),
  properti_subtitle_en: z.string().trim().max(200, "Maksimal 200 karakter"),
  paket_title_en: z.string().trim().max(70, "Maksimal 70 karakter"),
  paket_subtitle_en: z.string().trim().max(200, "Maksimal 200 karakter"),
  panduan_title_en: z.string().trim().max(70, "Maksimal 70 karakter"),
  panduan_subtitle_en: z.string().trim().max(200, "Maksimal 200 karakter"),
  faq_title_en: z.string().trim().max(70, "Maksimal 70 karakter"),
  faq_subtitle_en: z.string().trim().max(200, "Maksimal 200 karakter"),
  faq_items_en: z
    .array(
      z.object({
        tanya: z.string().trim().max(200, "Maksimal 200 karakter"),
        jawab: z.string().trim().max(1000, "Maksimal 1000 karakter"),
      }),
    )
    .max(FAQ_MAKSIMAL, `Maksimal ${FAQ_MAKSIMAL} pertanyaan`),
});

type NilaiLanding = z.infer<typeof skemaLanding>;

/**
 * Bagian landing page yang judul dan deskripsinya dapat disesuaikan.
 * Nilai kosong berarti halaman memakai teks bawaan komponen.
 */
const BAGIAN_LANDING = [
  { kunci: "keunggulan", label: "Keunggulan" },
  { kunci: "properti", label: "Properti Pilihan" },
  { kunci: "paket", label: "Paket Kemitraan" },
  { kunci: "panduan", label: "Panduan Mitra" },
  { kunci: "faq", label: "FAQ" },
] as const;

/** Dua jenis gambar landing yang didukung backend (konversi WebP otomatis). */
const OPSI_GAMBAR = [
  {
    nama: "hero_image_url",
    kind: "hero",
    label: "Gambar hero",
    deskripsi: "Rasio 16:9; dikonversi otomatis ke WebP, lebar maksimal 1920px, berkas di bawah 250 KB.",
  },
  {
    nama: "meta_og_image",
    kind: "og",
    label: "Gambar Open Graph",
    deskripsi: "Ukuran 1200×630 untuk pratinjau tautan saat dibagikan di media sosial.",
  },
] as const satisfies readonly {
  nama: "hero_image_url" | "meta_og_image";
  kind: LandingImageKind;
  label: string;
  deskripsi: string;
}[];

/** Nilai awal formulir; area kosong diberi empat slot agar langsung dapat diisi. */
function nilaiAwal(konten: LandingContentView): NilaiLanding {
  return {
    hero_title: konten.hero_title,
    hero_subtitle: konten.hero_subtitle,
    hero_cta_text: konten.hero_cta_text,
    hero_image_url: konten.hero_image_url,
    hero_images: konten.hero_images ?? [],
    meta_title: konten.meta_title,
    meta_description: konten.meta_description,
    meta_og_image: konten.meta_og_image,
    highlight_areas:
      konten.highlight_areas.length >= AREA_MINIMAL ? konten.highlight_areas : ["", "", "", ""],
    cta_title: konten.cta_title,
    cta_description: konten.cta_description,
    keunggulan_title: konten.keunggulan_title,
    keunggulan_subtitle: konten.keunggulan_subtitle,
    properti_title: konten.properti_title,
    properti_subtitle: konten.properti_subtitle,
    paket_title: konten.paket_title,
    paket_subtitle: konten.paket_subtitle,
    panduan_title: konten.panduan_title,
    panduan_subtitle: konten.panduan_subtitle,
    faq_title: konten.faq_title,
    faq_subtitle: konten.faq_subtitle,
    faq_items: konten.faq_items ?? [],
    hero_title_en: konten.hero_title_en,
    hero_subtitle_en: konten.hero_subtitle_en,
    hero_cta_text_en: konten.hero_cta_text_en,
    meta_title_en: konten.meta_title_en,
    meta_description_en: konten.meta_description_en,
    cta_title_en: konten.cta_title_en,
    cta_description_en: konten.cta_description_en,
    keunggulan_title_en: konten.keunggulan_title_en,
    keunggulan_subtitle_en: konten.keunggulan_subtitle_en,
    properti_title_en: konten.properti_title_en,
    properti_subtitle_en: konten.properti_subtitle_en,
    paket_title_en: konten.paket_title_en,
    paket_subtitle_en: konten.paket_subtitle_en,
    panduan_title_en: konten.panduan_title_en,
    panduan_subtitle_en: konten.panduan_subtitle_en,
    faq_title_en: konten.faq_title_en,
    faq_subtitle_en: konten.faq_subtitle_en,
    faq_items_en: konten.faq_items_en ?? [],
  };
}

/** Pratinjau + pengunggah gambar landing yang otomatis mengisi URL pada form. */
function FieldGambar({
  form,
  nama,
  kind,
  label,
  deskripsi,
}: {
  form: UseFormReturn<NilaiLanding>;
  nama: "hero_image_url" | "meta_og_image";
  kind: LandingImageKind;
  label: string;
  deskripsi: string;
}) {
  const unggah = useUnggahGambarLanding();
  const berkasRef = React.useRef<HTMLInputElement>(null);
  const nilai = useWatch({ control: form.control, name: nama });

  async function pilih(berkas: File) {
    try {
      const hasil = await unggah.mutateAsync({ kind, file: berkas });
      form.setValue(nama, hasil.url, { shouldDirty: true, shouldValidate: true });
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        {nilai ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={nilai}
            alt=""
            className="h-24 w-40 shrink-0 rounded-sm border border-line bg-canvas object-cover"
          />
        ) : (
          <span className="grid h-24 w-40 shrink-0 place-items-center rounded-sm border border-dashed border-line text-xs text-ink-subtle">
            Belum ada gambar
          </span>
        )}

        <div className="flex min-w-52 flex-1 flex-col gap-2">
          <input
            ref={berkasRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const berkas = event.target.files?.[0];
              if (berkas) void pilih(berkas);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            disabled={unggah.isPending}
            onClick={() => berkasRef.current?.click()}
          >
            {unggah.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <ImageUp aria-hidden="true" />
            )}
            {unggah.isPending ? "Mengunggah..." : "Unggah gambar"}
          </Button>
          <span className="text-xs text-ink-muted">{deskripsi}</span>
        </div>
      </div>

      <TextField
        control={form.control}
        name={nama}
        label="URL gambar"
        deskripsi="Terisi otomatis setelah unggahan berhasil; dapat juga diisi tautan gambar eksternal."
      />
    </div>
  );
}

/**
 * Editor daftar 4-6 area prioritas yang menjadi tautan internal katalog.
 *
 * Catatan teknis: `useFieldArray` react-hook-form hanya mengenali larik
 * berisi objek (`ArrayPath` mengabaikan larik primitif), sedangkan
 * `highlight_areas` adalah larik string. Karena itu daftar dikelola lewat
 * `useWatch` + `setValue` agar tetap tervalidasi skema zod dan tetap dapat
 * ditambah/dihapus.
 */
function FieldArea({ form }: { form: UseFormReturn<NilaiLanding> }) {
  const tersimpan = useWatch({ control: form.control, name: "highlight_areas" }) ?? [];
  // Lengkapi menjadi minimal empat baris agar pengguna langsung dapat mengisi.
  const area = [
    ...tersimpan,
    ...Array.from({ length: Math.max(0, AREA_MINIMAL - tersimpan.length) }, () => ""),
  ];

  function simpan(berikut: string[]) {
    form.setValue("highlight_areas", berikut, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <KelompokField
      judul="Highlight Wilayah"
      deskripsi="4-6 area prioritas yang ditonjolkan pada landing page dan menjadi tautan internal ke katalog wilayah."
    >
      {area.map((_, index) => (
        <div key={index} className="flex items-end gap-2">
          <TextField
            control={form.control}
            name={`highlight_areas.${index}`}
            label={`Area ${index + 1}`}
            className="flex-1"
            placeholder="Contoh: Denpasar"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Hapus area ${index + 1}`}
            disabled={area.length <= AREA_MINIMAL}
            onClick={() => simpan(area.filter((_, i) => i !== index))}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={area.length >= AREA_MAKSIMAL}
          onClick={() => simpan([...area, ""])}
        >
          <Plus aria-hidden="true" />
          Tambah area
        </Button>
      </div>
    </KelompokField>
  );
}

/**
 * Pengunggah kolase hero.
 *
 * Marketing dapat mengunggah 3-4 gambar yang tersusun pada bagian hero.
 * Setiap berkas dikonversi backend ke WebP lalu URL-nya ditambahkan ke
 * `hero_images`. Bila kosong, halaman memakai `hero_image_url` lalu foto
 * properti teratas sehingga kolase tetap terisi.
 */
function FieldKolase({ form }: { form: UseFormReturn<NilaiLanding> }) {
  const unggah = useUnggahGambarLanding();
  const berkasRef = React.useRef<HTMLInputElement>(null);
  const daftar = useWatch({ control: form.control, name: "hero_images" }) ?? [];

  async function tambah(berkas: File) {
    try {
      const hasil = await unggah.mutateAsync({ kind: "hero", file: berkas });
      form.setValue("hero_images", [...daftar, hasil.url].slice(0, KOLASE_MAKSIMAL), {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  function hapus(index: number) {
    form.setValue(
      "hero_images",
      daftar.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-ink">Gambar kolase hero</span>
      <p className="text-xs text-ink-muted">
        Unggah 3-4 gambar. Gambar pertama tampil paling besar dan sisanya mengisi kolase. Bila
        kosong, halaman memakai foto properti teratas.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {daftar.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative overflow-hidden rounded-sm border border-line bg-canvas"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-24 w-full object-cover" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Hapus gambar ${index + 1}`}
              className="absolute top-1 right-1 size-7 bg-surface/80"
              onClick={() => hapus(index)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}

        {daftar.length < KOLASE_MAKSIMAL ? (
          <button
            type="button"
            className="grid h-24 place-items-center rounded-sm border border-dashed border-line text-xs text-ink-subtle transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
            disabled={unggah.isPending}
            onClick={() => berkasRef.current?.click()}
          >
            {unggah.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <span className="flex flex-col items-center gap-1">
                <ImageUp aria-hidden="true" />
                Tambah gambar
              </span>
            )}
          </button>
        ) : null}
      </div>

      <input
        ref={berkasRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const berkas = event.target.files?.[0];
          if (berkas) void tambah(berkas);
          event.target.value = "";
        }}
      />
    </div>
  );
}

/**
 * Editor daftar pertanyaan-jawaban (FAQ).
 *
 * Dikelola lewat `useWatch` + `setValue` karena larik objek di sini lebih
 * sederhana ditangani manual daripada `useFieldArray` dengan nama dinamis.
 * Baris yang tidak lengkap akan dibuang backend saat disimpan.
 */
function FieldFaq({
  form,
  nama,
  judul,
  deskripsi,
}: {
  form: UseFormReturn<NilaiLanding>;
  nama: "faq_items" | "faq_items_en";
  judul: string;
  deskripsi: string;
}) {
  const tersimpan = useWatch({ control: form.control, name: nama });
  const daftar = (tersimpan ?? []) as LandingFAQItem[];

  function simpan(berikut: LandingFAQItem[]) {
    form.setValue(nama, berikut, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <KelompokField judul={judul} deskripsi={deskripsi}>
      {daftar.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-card border border-line bg-canvas/40 p-4"
        >
          <FormField label={`Pertanyaan ${index + 1}`}>
            <Input
              value={item.tanya}
              maxLength={200}
              placeholder="Tulis pertanyaan"
              onChange={(event) =>
                simpan(
                  daftar.map((isi, i) =>
                    i === index ? { ...isi, tanya: event.target.value } : isi,
                  ),
                )
              }
            />
          </FormField>
          <FormField label={`Jawaban ${index + 1}`}>
            <Textarea
              value={item.jawab}
              rows={3}
              maxLength={1000}
              placeholder="Tulis jawaban"
              onChange={(event) =>
                simpan(
                  daftar.map((isi, i) =>
                    i === index ? { ...isi, jawab: event.target.value } : isi,
                  ),
                )
              }
            />
          </FormField>
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => simpan(daftar.filter((_, i) => i !== index))}
            >
              <Trash2 aria-hidden="true" />
              Hapus pertanyaan
            </Button>
          </div>
        </div>
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={daftar.length >= FAQ_MAKSIMAL}
          onClick={() => simpan([...daftar, { tanya: "", jawab: "" }])}
        >
          <Plus aria-hidden="true" />
          Tambah pertanyaan
        </Button>
      </div>

      {daftar.length === 0 ? (
        <p className="text-xs text-ink-muted">
          Belum ada pertanyaan khusus. Halaman memakai pertanyaan bawaan hingga daftar ini diisi.
        </p>
      ) : null}
    </KelompokField>
  );
}

/** Formulir CMS lengkap untuk admin dan superadmin. */
function FormLanding({ konten }: { konten: LandingContentView }) {
  const simpan = usePerbaruiLanding();
  const publikasi = usePublikasikanLanding();
  const form = useForm<NilaiLanding>({
    resolver: zodResolver(skemaLanding),
    defaultValues: nilaiAwal(konten),
  });

  async function simpanDraft(nilai: NilaiLanding) {
    try {
      await simpan.mutateAsync(nilai);
      form.reset(nilai);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function simpanLaluPublikasi(nilai: NilaiLanding) {
    try {
      await simpan.mutateAsync(nilai);
      form.reset(nilai);
      await publikasi.mutateAsync();
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const sibuk = simpan.isPending || publikasi.isPending;

  return (
    <form
      onSubmit={form.handleSubmit(simpanDraft)}
      noValidate
      className="flex flex-col gap-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Hero Banner</CardTitle>
          <CardDescription>
            Judul utama halaman ditampilkan sebagai satu-satunya tag <code>&lt;h1&gt;</code> (teks
            murni, tanpa editor WYSIWYG).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <TextField
            control={form.control}
            name="hero_title"
            label="Judul hero"
            wajib
            deskripsi="Maksimal 70 karakter."
          />
          <TextareaField
            control={form.control}
            name="hero_subtitle"
            label="Subjudul hero"
            rows={3}
            deskripsi="Maksimal 150 karakter."
          />
          <TextField
            control={form.control}
            name="hero_cta_text"
            label="Teks tombol CTA hero"
            deskripsi="Maksimal 40 karakter, mis. “Jelajahi Katalog”."
          />
          <FieldGambar form={form} {...OPSI_GAMBAR[0]} />
          <FieldKolase form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata SEO Global</CardTitle>
          <CardDescription>
            Dipakai sebagai <code>title</code> dan <code>description</code> halaman utama.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <TextField
            control={form.control}
            name="meta_title"
            label="Meta title"
            wajib
            deskripsi="50-60 karakter agar tidak terpotong di hasil pencarian."
          />
          <TextareaField
            control={form.control}
            name="meta_description"
            label="Meta description"
            rows={3}
            wajib
            deskripsi="120-160 karakter."
          />
          <FieldGambar form={form} {...OPSI_GAMBAR[1]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wilayah Unggulan</CardTitle>
          <CardDescription>
            Area prioritas yang ditonjolkan pada landing page sekaligus memperkuat internal linking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldArea form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Judul &amp; Deskripsi Bagian</CardTitle>
          <CardDescription>
            Judul dan deskripsi tiap bagian halaman utama. Kosongkan untuk memakai teks bawaan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {BAGIAN_LANDING.map((bagian) => (
            <div key={bagian.kunci} className="flex flex-col gap-5">
              <TextField
                control={form.control}
                name={`${bagian.kunci}_title`}
                label={`Judul bagian ${bagian.label}`}
                deskripsi="Maksimal 70 karakter."
              />
              <TextareaField
                control={form.control}
                name={`${bagian.kunci}_subtitle`}
                label={`Deskripsi bagian ${bagian.label}`}
                rows={2}
                deskripsi="Maksimal 200 karakter."
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pertanyaan (FAQ)</CardTitle>
          <CardDescription>
            Pertanyaan dan jawaban yang tampil pada bagian FAQ. Kosongkan untuk memakai daftar
            bawaan; baris yang tidak lengkap otomatis diabaikan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldFaq
            form={form}
            nama="faq_items"
            judul="Pertanyaan umum (Indonesia)"
            deskripsi="Tampil pada halaman utama berbahasa Indonesia."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CTA Mitra “Titip Properti”</CardTitle>
          <CardDescription>
            Ajakan kemitraan yang mengarahkan pengunjung ke halaman pendaftaran mitra.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <TextField
            control={form.control}
            name="cta_title"
            label="Judul CTA"
            deskripsi="Maksimal 70 karakter."
          />
          <TextareaField
            control={form.control}
            name="cta_description"
            label="Deskripsi CTA"
            rows={3}
            deskripsi="Maksimal 200 karakter."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bahasa Inggris (English)</CardTitle>
          <CardDescription>
            Teks untuk halaman <code>/en</code>. Kosongkan bila terjemahan belum tersedia; halaman
            Inggris akan memakai teks bawaan sehingga tidak pernah tampil kosong.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <TextField
              control={form.control}
              name="hero_title_en"
              label="Hero title (EN)"
              deskripsi="Maksimal 70 karakter."
            />
            <TextareaField
              control={form.control}
              name="hero_subtitle_en"
              label="Hero subtitle (EN)"
              rows={3}
              deskripsi="Maksimal 150 karakter."
            />
            <TextField
              control={form.control}
              name="hero_cta_text_en"
              label="Hero CTA text (EN)"
              deskripsi="Maksimal 40 karakter."
            />
          </div>

          <div className="flex flex-col gap-5">
            <TextField
              control={form.control}
              name="meta_title_en"
              label="Meta title (EN)"
              deskripsi="Maksimal 60 karakter."
            />
            <TextareaField
              control={form.control}
              name="meta_description_en"
              label="Meta description (EN)"
              rows={3}
              deskripsi="Maksimal 160 karakter."
            />
          </div>

          {BAGIAN_LANDING.map((bagian) => (
            <div key={bagian.kunci} className="flex flex-col gap-5">
              <TextField
                control={form.control}
                name={`${bagian.kunci}_title_en`}
                label={`Bagian ${bagian.label} — judul (EN)`}
                deskripsi="Maksimal 70 karakter."
              />
              <TextareaField
                control={form.control}
                name={`${bagian.kunci}_subtitle_en`}
                label={`Bagian ${bagian.label} — deskripsi (EN)`}
                rows={2}
                deskripsi="Maksimal 200 karakter."
              />
            </div>
          ))}

          <div className="flex flex-col gap-5">
            <TextField
              control={form.control}
              name="cta_title_en"
              label="CTA title (EN)"
              deskripsi="Maksimal 70 karakter."
            />
            <TextareaField
              control={form.control}
              name="cta_description_en"
              label="CTA description (EN)"
              rows={3}
              deskripsi="Maksimal 200 karakter."
            />
          </div>

          <FieldFaq
            form={form}
            nama="faq_items_en"
            judul="FAQ items (EN)"
            deskripsi="Tampil pada halaman landing berbahasa Inggris (/en). Kosongkan untuk memakai daftar bawaan."
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink-subtle">
          Terakhir diperbarui {formatWib(konten.updated_at)}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="outline" disabled={sibuk}>
            {simpan.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Save aria-hidden="true" />
            )}
            Simpan perubahan
          </Button>
          <Button type="button" disabled={sibuk} onClick={form.handleSubmit(simpanLaluPublikasi)}>
            {publikasi.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Rocket aria-hidden="true" />
            )}
            Publish perubahan landing page
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Satu baris label-nilai untuk tampilan baca-saja owner. */
function BarisNilai({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-divider pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">{label}</span>
      <span className="text-sm whitespace-pre-line text-ink">{nilai || "—"}</span>
    </div>
  );
}

/** Pratinjau baca-saja konten landing untuk peran owner. */
function RingkasanLanding({ konten }: { konten: LandingContentView }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Banner</CardTitle>
          <CardDescription>Konten yang ditampilkan pada bagian paling atas halaman utama.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarisNilai label="Judul hero" nilai={konten.hero_title} />
          <BarisNilai label="Subjudul hero" nilai={konten.hero_subtitle} />
          <BarisNilai label="Teks tombol CTA" nilai={konten.hero_cta_text} />
          {konten.hero_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={konten.hero_image_url}
              alt=""
              className="h-40 w-full rounded-sm border border-line bg-canvas object-cover"
            />
          ) : null}
          {konten.hero_images.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">
                Gambar kolase
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {konten.hero_images.map((url, index) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt=""
                    className="h-24 w-full rounded-sm border border-line bg-canvas object-cover"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata SEO Global</CardTitle>
          <CardDescription>Judul dan deskripsi yang tampil di hasil pencarian.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarisNilai label="Meta title" nilai={konten.meta_title} />
          <BarisNilai label="Meta description" nilai={konten.meta_description} />
          <BarisNilai label="Gambar Open Graph" nilai={konten.meta_og_image} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wilayah Unggulan</CardTitle>
          <CardDescription>Area prioritas yang ditonjolkan pada landing page.</CardDescription>
        </CardHeader>
        <CardContent>
          {konten.highlight_areas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {konten.highlight_areas.map((area) => (
                <Badge key={area} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Belum ada area prioritas.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Judul &amp; Deskripsi Bagian</CardTitle>
          <CardDescription>Judul dan deskripsi tiap bagian halaman utama.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {BAGIAN_LANDING.map((bagian) => (
            <div key={bagian.kunci} className="flex flex-col gap-4">
              <BarisNilai label={`Judul bagian ${bagian.label}`} nilai={konten[`${bagian.kunci}_title`]} />
              <BarisNilai
                label={`Deskripsi bagian ${bagian.label}`}
                nilai={konten[`${bagian.kunci}_subtitle`]}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pertanyaan (FAQ)</CardTitle>
          <CardDescription>Pertanyaan dan jawaban pada bagian FAQ halaman utama.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {konten.faq_items.length > 0 ? (
            konten.faq_items.map((item, index) => (
              <div key={index} className="flex flex-col gap-4">
                <BarisNilai label={`Pertanyaan ${index + 1}`} nilai={item.tanya} />
                <BarisNilai label={`Jawaban ${index + 1}`} nilai={item.jawab} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">Memakai daftar pertanyaan bawaan.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CTA Mitra “Titip Properti”</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarisNilai label="Judul CTA" nilai={konten.cta_title} />
          <BarisNilai label="Deskripsi CTA" nilai={konten.cta_description} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bahasa Inggris (English)</CardTitle>
          <CardDescription>
            Versi teks untuk halaman <code>/en</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarisNilai label="Hero title (EN)" nilai={konten.hero_title_en} />
          <BarisNilai label="Hero subtitle (EN)" nilai={konten.hero_subtitle_en} />
          <BarisNilai label="Hero CTA text (EN)" nilai={konten.hero_cta_text_en} />
          <BarisNilai label="Meta title (EN)" nilai={konten.meta_title_en} />
          <BarisNilai label="Meta description (EN)" nilai={konten.meta_description_en} />
          {BAGIAN_LANDING.map((bagian) => (
            <div key={bagian.kunci} className="flex flex-col gap-4">
              <BarisNilai
                label={`Bagian ${bagian.label} — judul (EN)`}
                nilai={konten[`${bagian.kunci}_title_en`]}
              />
              <BarisNilai
                label={`Bagian ${bagian.label} — deskripsi (EN)`}
                nilai={konten[`${bagian.kunci}_subtitle_en`]}
              />
            </div>
          ))}
          <BarisNilai label="CTA title (EN)" nilai={konten.cta_title_en} />
          <BarisNilai label="CTA description (EN)" nilai={konten.cta_description_en} />
          {konten.faq_items_en.length > 0 ? (
            konten.faq_items_en.map((item, index) => (
              <div key={index} className="flex flex-col gap-4">
                <BarisNilai label={`FAQ ${index + 1} — pertanyaan (EN)`} nilai={item.tanya} />
                <BarisNilai label={`FAQ ${index + 1} — jawaban (EN)`} nilai={item.jawab} />
              </div>
            ))
          ) : (
            <BarisNilai label="FAQ items (EN)" nilai="" />
          )}
        </CardContent>
      </Card>

      <span className="text-xs text-ink-subtle">
        Terakhir diperbarui {formatWib(konten.updated_at)}
      </span>
    </div>
  );
}

/** Kerangka muat yang dipakai kedua mode tampilan. */
function KerangkaLanding() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-64 rounded-card" />
      <Skeleton className="h-56 rounded-card" />
    </div>
  );
}

/** Halaman CMS landing untuk admin dan superadmin (boleh mengubah). */
export function LandingCmsEditor() {
  const hasil = useLandingAdmin();

  return (
    <>
      <PageHeader
        judul="Landing Page"
        deskripsi="Kelola konten halaman utama: hero, metadata SEO, wilayah unggulan, dan ajakan mitra."
      />
      <KontenAsync
        hasil={hasil}
        skeleton={<KerangkaLanding />}
        judulGagal="Gagal memuat konten landing page"
      >
        {(konten) => <FormLanding konten={konten} />}
      </KontenAsync>
    </>
  );
}

/** Halaman landing versi baca-saja untuk peran owner. */
export function LandingCmsPeninjau() {
  const hasil = useLandingOwner();

  return (
    <>
      <PageHeader
        judul="Landing Page"
        deskripsi="Pantau konten halaman utama. Perubahan hanya dapat dilakukan oleh admin."
      />
      <KontenAsync
        hasil={hasil}
        skeleton={<KerangkaLanding />}
        judulGagal="Gagal memuat konten landing page"
      >
        {(konten) => <RingkasanLanding konten={konten} />}
      </KontenAsync>
    </>
  );
}
