"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, LoaderCircle, Plus, Rocket, Save, Trash2 } from "lucide-react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { useBahasa } from "@/components/providers/bahasa-provider";
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
import type { NilaiTerjemah } from "@/lib/app-i18n";
import type { LandingContentView, LandingFAQItem, LandingFooterLink, LandingImageKind } from "@/types/api";

/** Jumlah area prioritas yang diwajibkan skema: minimal 4, maksimal 6. */
const AREA_MINIMAL = 4;
const AREA_MAKSIMAL = 6;
/** Batas gambar kolase hero dan jumlah pertanyaan FAQ (selaras `backend/dto`). */
const KOLASE_MAKSIMAL = 4;
const FAQ_MAKSIMAL = 12;
/** Batas jumlah tautan navigasi footer (selaras `backend/dto`). */
const FOOTER_LINK_MAKSIMAL = 8;

/**
 * Batas panjang mengikuti `backend/dto/landing.go` sekaligus aturan SEO pada
 * `standar_cms.txt`: meta_title 50-60 karakter, meta_description 120-160,
 * hero_title maksimal 70, dan 4-6 area prioritas berisi maksimal 60 karakter.
 */
/** Penerjemah teks dari konteks bahasa. */
type Terjemah = (teks: string, nilai?: NilaiTerjemah) => string;

function buatSkemaLanding(t: Terjemah) {
  return z.object({
    hero_title: z.string().trim().min(1, t("Judul hero wajib diisi")).max(70, t("Maksimal 70 karakter")),
    hero_subtitle: z.string().trim().max(300, t("Maksimal 300 karakter")),
    hero_cta_text: z.string().trim().max(40, t("Maksimal 40 karakter")),
    hero_image_url: z.string().trim().max(500, t("Maksimal 500 karakter")),
    hero_images: z
      .array(z.string().trim().max(500, t("Maksimal 500 karakter")))
      .max(KOLASE_MAKSIMAL, t("Maksimal {n} gambar kolase", { n: KOLASE_MAKSIMAL })),
    meta_title: z.string().trim().min(50, t("Minimal 50 karakter")).max(60, t("Maksimal 60 karakter")),
    meta_description: z
      .string()
      .trim()
      .min(120, t("Minimal 120 karakter"))
      .max(160, t("Maksimal 160 karakter")),
    meta_og_image: z.string().trim().max(500, t("Maksimal 500 karakter")),
    highlight_areas: z
      .array(
        z.string().trim().min(1, t("Nama area tidak boleh kosong")).max(60, t("Maksimal 60 karakter")),
      )
      .min(AREA_MINIMAL, t("Minimal 4 area prioritas"))
      .max(AREA_MAKSIMAL, t("Maksimal 6 area prioritas")),
    cta_title: z.string().trim().max(70, t("Maksimal 70 karakter")),
    cta_description: z.string().trim().max(200, t("Maksimal 200 karakter")),
    keunggulan_title: z.string().trim().max(70, t("Maksimal 70 karakter")),
    keunggulan_subtitle: z.string().trim().max(200, t("Maksimal 200 karakter")),
    properti_title: z.string().trim().max(70, t("Maksimal 70 karakter")),
    properti_subtitle: z.string().trim().max(200, t("Maksimal 200 karakter")),
    paket_title: z.string().trim().max(70, t("Maksimal 70 karakter")),
    paket_subtitle: z.string().trim().max(200, t("Maksimal 200 karakter")),
    panduan_title: z.string().trim().max(70, t("Maksimal 70 karakter")),
    panduan_subtitle: z.string().trim().max(200, t("Maksimal 200 karakter")),
    faq_title: z.string().trim().max(70, t("Maksimal 70 karakter")),
    faq_subtitle: z.string().trim().max(200, t("Maksimal 200 karakter")),
    // Daftar pertanyaan-jawaban. Baris yang tidak lengkap dibuang backend, jadi
    // di sini cukup dibatasi panjang dan jumlahnya saja.
    faq_items: z
      .array(
        z.object({
          tanya: z.string().trim().max(200, t("Maksimal 200 karakter")),
          jawab: z.string().trim().max(1000, t("Maksimal 1000 karakter")),
        }),
      )
      .max(FAQ_MAKSIMAL, t("Maksimal {n} pertanyaan", { n: FAQ_MAKSIMAL })),
    // Identitas kaki halaman (footer). Nilai kosong berarti halaman memakai
    // teks bawaan komponen.
    footer_brand_initial: z.string().trim().max(8, t("Maksimal 8 karakter")),
    footer_brand_name: z.string().trim().max(60, t("Maksimal 60 karakter")),
    footer_description: z.string().trim().max(300, t("Maksimal 300 karakter")),
    footer_copyright: z.string().trim().max(200, t("Maksimal 200 karakter")),
    footer_links: z
      .array(
        z.object({
          label: z.string().trim().max(40, t("Maksimal 40 karakter")),
          href: z.string().trim().max(300, t("Maksimal 300 karakter")),
        }),
      )
      .max(FOOTER_LINK_MAKSIMAL, t("Maksimal {n} tautan", { n: FOOTER_LINK_MAKSIMAL })),
    // Varian bahasa Inggris (khusus halaman `/en`). Semua opsional: bila
    // dikosongkan, halaman Inggris memakai teks bawaan komponen.
    hero_title_en: z.string().trim().max(70, t("Maksimal 70 karakter")),
    hero_subtitle_en: z.string().trim().max(300, t("Maksimal 300 karakter")),
    hero_cta_text_en: z.string().trim().max(40, t("Maksimal 40 karakter")),
    meta_title_en: z.string().trim().max(60, t("Maksimal 60 karakter")),
    meta_description_en: z.string().trim().max(160, t("Maksimal 160 karakter")),
    cta_title_en: z.string().trim().max(70, t("Maksimal 70 karakter")),
    cta_description_en: z.string().trim().max(200, t("Maksimal 200 karakter")),
    keunggulan_title_en: z.string().trim().max(70, t("Maksimal 70 karakter")),
    keunggulan_subtitle_en: z.string().trim().max(200, t("Maksimal 200 karakter")),
    properti_title_en: z.string().trim().max(70, t("Maksimal 70 karakter")),
    properti_subtitle_en: z.string().trim().max(200, t("Maksimal 200 karakter")),
    paket_title_en: z.string().trim().max(70, t("Maksimal 70 karakter")),
    paket_subtitle_en: z.string().trim().max(200, t("Maksimal 200 karakter")),
    panduan_title_en: z.string().trim().max(70, t("Maksimal 70 karakter")),
    panduan_subtitle_en: z.string().trim().max(200, t("Maksimal 200 karakter")),
    faq_title_en: z.string().trim().max(70, t("Maksimal 70 karakter")),
    faq_subtitle_en: z.string().trim().max(200, t("Maksimal 200 karakter")),
    faq_items_en: z
      .array(
        z.object({
          tanya: z.string().trim().max(200, t("Maksimal 200 karakter")),
          jawab: z.string().trim().max(1000, t("Maksimal 1000 karakter")),
        }),
      )
      .max(FAQ_MAKSIMAL, t("Maksimal {n} pertanyaan", { n: FAQ_MAKSIMAL })),
    // Varian Inggris teks footer (nama/inisial brand bersifat tetap).
    footer_description_en: z.string().trim().max(300, t("Maksimal 300 karakter")),
    footer_copyright_en: z.string().trim().max(200, t("Maksimal 200 karakter")),
    footer_links_en: z
      .array(
        z.object({
          label: z.string().trim().max(40, t("Maksimal 40 karakter")),
          href: z.string().trim().max(300, t("Maksimal 300 karakter")),
        }),
      )
      .max(FOOTER_LINK_MAKSIMAL, t("Maksimal {n} tautan", { n: FOOTER_LINK_MAKSIMAL })),
  });
}

type NilaiLanding = z.infer<ReturnType<typeof buatSkemaLanding>>;

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
    footer_brand_initial: konten.footer_brand_initial,
    footer_brand_name: konten.footer_brand_name,
    footer_description: konten.footer_description,
    footer_copyright: konten.footer_copyright,
    footer_links: konten.footer_links ?? [],
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
    footer_description_en: konten.footer_description_en,
    footer_copyright_en: konten.footer_copyright_en,
    footer_links_en: konten.footer_links_en ?? [],
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
  const { t } = useBahasa();
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
      <span className="text-sm font-semibold text-ink">{t(label)}</span>
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
            {t("Belum ada gambar")}
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
            {unggah.isPending ? t("Mengunggah...") : t("Unggah gambar")}
          </Button>
          <span className="text-xs text-ink-muted">{t(deskripsi)}</span>
        </div>
      </div>

      <TextField
        control={form.control}
        name={nama}
        label={t("URL gambar")}
        deskripsi={t("Terisi otomatis setelah unggahan berhasil; dapat juga diisi tautan gambar eksternal.")}
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
  const { t } = useBahasa();
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
      judul={t("Highlight Wilayah")}
      deskripsi={t("4-6 area prioritas yang ditonjolkan pada landing page dan menjadi tautan internal ke katalog wilayah.")}
    >
      {area.map((_, index) => (
        <div key={index} className="flex items-end gap-2">
          <TextField
            control={form.control}
            name={`highlight_areas.${index}`}
            label={t("Area {nomor}", { nomor: index + 1 })}
            className="flex-1"
            placeholder={t("Contoh: Denpasar")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("Hapus area {nomor}", { nomor: index + 1 })}
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
          {t("Tambah area")}
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
  const { t } = useBahasa();
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
      <span className="text-sm font-semibold text-ink">{t("Gambar kolase hero")}</span>
      <p className="text-xs text-ink-muted">
        {t("Unggah 3-4 gambar. Gambar pertama tampil paling besar dan sisanya mengisi kolase. Bila kosong, halaman memakai foto properti teratas.")}
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
              aria-label={t("Hapus gambar {nomor}", { nomor: index + 1 })}
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
                {t("Tambah gambar")}
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
  const { t } = useBahasa();
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
          <FormField label={t("Pertanyaan {nomor}", { nomor: index + 1 })}>
            <Input
              value={item.tanya}
              maxLength={200}
              placeholder={t("Tulis pertanyaan")}
              onChange={(event) =>
                simpan(
                  daftar.map((isi, i) =>
                    i === index ? { ...isi, tanya: event.target.value } : isi,
                  ),
                )
              }
            />
          </FormField>
          <FormField label={t("Jawaban {nomor}", { nomor: index + 1 })}>
            <Textarea
              value={item.jawab}
              rows={3}
              maxLength={1000}
              placeholder={t("Tulis jawaban")}
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
              {t("Hapus pertanyaan")}
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
          {t("Tambah pertanyaan")}
        </Button>
      </div>

      {daftar.length === 0 ? (
        <p className="text-xs text-ink-muted">
          {t("Belum ada pertanyaan khusus. Halaman memakai pertanyaan bawaan hingga daftar ini diisi.")}
        </p>
      ) : null}
    </KelompokField>
  );
}

/**
 * Editor daftar tautan navigasi footer.
 *
 * Dikelola lewat `useWatch` + `setValue` (pola sama dengan `FieldFaq`). Baris
 * yang tidak lengkap akan dibuang backend saat disimpan.
 */
function FieldTautanFooter({
  form,
  nama,
  judul,
  deskripsi,
}: {
  form: UseFormReturn<NilaiLanding>;
  nama: "footer_links" | "footer_links_en";
  judul: string;
  deskripsi: string;
}) {
  const { t } = useBahasa();
  const tersimpan = useWatch({ control: form.control, name: nama });
  const daftar = (tersimpan ?? []) as LandingFooterLink[];

  function simpan(berikut: LandingFooterLink[]) {
    form.setValue(nama, berikut, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <KelompokField judul={judul} deskripsi={deskripsi}>
      {daftar.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-card border border-line bg-canvas/40 p-4"
        >
          <FormField label={t("Label tautan {nomor}", { nomor: index + 1 })}>
            <Input
              value={item.label}
              maxLength={40}
              placeholder={t("Contoh: Properti")}
              onChange={(event) =>
                simpan(
                  daftar.map((isi, i) =>
                    i === index ? { ...isi, label: event.target.value } : isi,
                  ),
                )
              }
            />
          </FormField>
          <FormField label={t("URL tautan {nomor}", { nomor: index + 1 })}>
            <Input
              value={item.href}
              maxLength={300}
              placeholder={t("Contoh: #properti atau https://…")}
              onChange={(event) =>
                simpan(
                  daftar.map((isi, i) =>
                    i === index ? { ...isi, href: event.target.value } : isi,
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
              {t("Hapus tautan")}
            </Button>
          </div>
        </div>
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={daftar.length >= FOOTER_LINK_MAKSIMAL}
          onClick={() => simpan([...daftar, { label: "", href: "" }])}
        >
          <Plus aria-hidden="true" />
          {t("Tambah tautan")}
        </Button>
      </div>

      {daftar.length === 0 ? (
        <p className="text-xs text-ink-muted">
          {t("Belum ada tautan khusus. Halaman memakai tautan bawaan hingga daftar ini diisi.")}
        </p>
      ) : null}
    </KelompokField>
  );
}

/** Formulir CMS lengkap untuk admin dan superadmin. */
function FormLanding({ konten }: { konten: LandingContentView }) {
  const { t } = useBahasa();
  const simpan = usePerbaruiLanding();
  const publikasi = usePublikasikanLanding();
  const skema = React.useMemo(() => buatSkemaLanding(t), [t]);
  const form = useForm<NilaiLanding>({
    resolver: zodResolver(skema),
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
          <CardTitle>{t("Hero Banner")}</CardTitle>
          <CardDescription>
            {t("Judul utama halaman ditampilkan sebagai satu-satunya tag")} <code>&lt;h1&gt;</code>{" "}
            {t("(teks murni, tanpa editor WYSIWYG).")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <TextField
            control={form.control}
            name="hero_title"
            label={t("Judul hero")}
            wajib
            deskripsi={t("Maksimal 70 karakter.")}
          />
          <TextareaField
            control={form.control}
            name="hero_subtitle"
            label={t("Subjudul hero")}
            rows={3}
            deskripsi={t("Maksimal 300 karakter.")}
          />
          <TextField
            control={form.control}
            name="hero_cta_text"
            label={t("Teks tombol CTA hero")}
            deskripsi={t("Maksimal 40 karakter, mis. “Jelajahi Katalog”.")}
          />
          <FieldGambar form={form} {...OPSI_GAMBAR[0]} />
          <FieldKolase form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Metadata SEO Global")}</CardTitle>
          <CardDescription>
            {t("Dipakai sebagai")} <code>title</code> {t("dan")} <code>description</code>{" "}
            {t("halaman utama.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <TextField
            control={form.control}
            name="meta_title"
            label={t("Meta title")}
            wajib
            deskripsi={t("50-60 karakter agar tidak terpotong di hasil pencarian.")}
          />
          <TextareaField
            control={form.control}
            name="meta_description"
            label={t("Meta description")}
            rows={3}
            wajib
            deskripsi={t("120-160 karakter.")}
          />
          <FieldGambar form={form} {...OPSI_GAMBAR[1]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Wilayah Unggulan")}</CardTitle>
          <CardDescription>
            {t("Area prioritas yang ditonjolkan pada landing page sekaligus memperkuat internal linking.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldArea form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Judul & Deskripsi Bagian")}</CardTitle>
          <CardDescription>
            {t("Judul dan deskripsi tiap bagian halaman utama. Kosongkan untuk memakai teks bawaan.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {BAGIAN_LANDING.map((bagian) => (
            <div key={bagian.kunci} className="flex flex-col gap-5">
              <TextField
                control={form.control}
                name={`${bagian.kunci}_title`}
                label={t("Judul bagian {label}", { label: t(bagian.label) })}
                deskripsi={t("Maksimal 70 karakter.")}
              />
              <TextareaField
                control={form.control}
                name={`${bagian.kunci}_subtitle`}
                label={t("Deskripsi bagian {label}", { label: t(bagian.label) })}
                rows={2}
                deskripsi={t("Maksimal 200 karakter.")}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Daftar Pertanyaan (FAQ)")}</CardTitle>
          <CardDescription>
            {t("Pertanyaan dan jawaban yang tampil pada bagian FAQ. Kosongkan untuk memakai daftar bawaan; baris yang tidak lengkap otomatis diabaikan.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldFaq
            form={form}
            nama="faq_items"
            judul={t("Pertanyaan umum (Indonesia)")}
            deskripsi={t("Tampil pada halaman utama berbahasa Indonesia.")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("CTA Mitra “Titip Properti”")}</CardTitle>
          <CardDescription>
            {t("Ajakan kemitraan yang mengarahkan pengunjung ke halaman pendaftaran mitra.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <TextField
            control={form.control}
            name="cta_title"
            label={t("Judul CTA")}
            deskripsi={t("Maksimal 70 karakter.")}
          />
          <TextareaField
            control={form.control}
            name="cta_description"
            label={t("Deskripsi CTA")}
            rows={3}
            deskripsi={t("Maksimal 200 karakter.")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Footer")}</CardTitle>
          <CardDescription>
            {t("Identitas dan tautan pada kaki halaman. Kosongkan untuk memakai teks bawaan.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <TextField
            control={form.control}
            name="footer_brand_initial"
            label={t("Inisial brand")}
            deskripsi={t("Maksimal 8 karakter, mis. “EN”.")}
          />
          <TextField
            control={form.control}
            name="footer_brand_name"
            label={t("Nama brand")}
            deskripsi={t("Maksimal 60 karakter, mis. “ENM PROPERTY”.")}
          />
          <TextareaField
            control={form.control}
            name="footer_description"
            label={t("Deskripsi footer")}
            rows={3}
            deskripsi={t("Maksimal 300 karakter.")}
          />
          <TextField
            control={form.control}
            name="footer_copyright"
            label={t("Hak cipta")}
            deskripsi={t("Maksimal 200 karakter.")}
          />
          <FieldTautanFooter
            form={form}
            nama="footer_links"
            judul={t("Tautan footer (Indonesia)")}
            deskripsi={t("Tautan navigasi pada footer halaman Indonesia. Kosongkan untuk memakai tautan bawaan.")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Bahasa Inggris (English)")}</CardTitle>
          <CardDescription>
            {t("Teks untuk halaman")} <code>/en</code>.{" "}
            {t("Kosongkan bila terjemahan belum tersedia; halaman Inggris akan memakai teks bawaan sehingga tidak pernah tampil kosong.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <TextField
              control={form.control}
              name="hero_title_en"
              label={t("Hero title (EN)")}
              deskripsi={t("Maksimal 70 karakter.")}
            />
            <TextareaField
              control={form.control}
              name="hero_subtitle_en"
              label={t("Hero subtitle (EN)")}
              rows={3}
              deskripsi={t("Maksimal 300 karakter.")}
            />
            <TextField
              control={form.control}
              name="hero_cta_text_en"
              label={t("Hero CTA text (EN)")}
              deskripsi={t("Maksimal 40 karakter.")}
            />
          </div>

          <div className="flex flex-col gap-5">
            <TextField
              control={form.control}
              name="meta_title_en"
              label={t("Meta title (EN)")}
              deskripsi={t("Maksimal 60 karakter.")}
            />
            <TextareaField
              control={form.control}
              name="meta_description_en"
              label={t("Meta description (EN)")}
              rows={3}
              deskripsi={t("Maksimal 160 karakter.")}
            />
          </div>

          {BAGIAN_LANDING.map((bagian) => (
            <div key={bagian.kunci} className="flex flex-col gap-5">
              <TextField
                control={form.control}
                name={`${bagian.kunci}_title_en`}
                label={t("Bagian {label} — judul (EN)", { label: t(bagian.label) })}
                deskripsi={t("Maksimal 70 karakter.")}
              />
              <TextareaField
                control={form.control}
                name={`${bagian.kunci}_subtitle_en`}
                label={t("Bagian {label} — deskripsi (EN)", { label: t(bagian.label) })}
                rows={2}
                deskripsi={t("Maksimal 200 karakter.")}
              />
            </div>
          ))}

          <div className="flex flex-col gap-5">
            <TextField
              control={form.control}
              name="cta_title_en"
              label={t("CTA title (EN)")}
              deskripsi={t("Maksimal 70 karakter.")}
            />
            <TextareaField
              control={form.control}
              name="cta_description_en"
              label={t("CTA description (EN)")}
              rows={3}
              deskripsi={t("Maksimal 200 karakter.")}
            />
          </div>

          <FieldFaq
            form={form}
            nama="faq_items_en"
            judul={t("FAQ items (EN)")}
            deskripsi={t("Tampil pada halaman landing berbahasa Inggris (/en). Kosongkan untuk memakai daftar bawaan.")}
          />

          <div className="flex flex-col gap-5">
            <TextareaField
              control={form.control}
              name="footer_description_en"
              label={t("Footer description (EN)")}
              rows={3}
              deskripsi={t("Maksimal 300 karakter.")}
            />
            <TextField
              control={form.control}
              name="footer_copyright_en"
              label={t("Footer copyright (EN)")}
              deskripsi={t("Maksimal 200 karakter.")}
            />
          </div>

          <FieldTautanFooter
            form={form}
            nama="footer_links_en"
            judul={t("Footer links (EN)")}
            deskripsi={t("Tautan navigasi pada footer halaman Inggris (/en). Kosongkan untuk memakai tautan bawaan.")}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink-subtle">
          {t("Terakhir diperbarui {tgl}", { tgl: formatWib(konten.updated_at) })}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="outline" disabled={sibuk}>
            {simpan.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Save aria-hidden="true" />
            )}
            {t("Simpan perubahan")}
          </Button>
          <Button type="button" disabled={sibuk} onClick={form.handleSubmit(simpanLaluPublikasi)}>
            {publikasi.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Rocket aria-hidden="true" />
            )}
            {t("Publish perubahan landing page")}
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
  const { t } = useBahasa();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Hero Banner")}</CardTitle>
          <CardDescription>{t("Konten yang ditampilkan pada bagian paling atas halaman utama.")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarisNilai label={t("Judul hero")} nilai={konten.hero_title} />
          <BarisNilai label={t("Subjudul hero")} nilai={konten.hero_subtitle} />
          <BarisNilai label={t("Teks tombol CTA")} nilai={konten.hero_cta_text} />
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
                {t("Gambar kolase")}
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
          <CardTitle>{t("Metadata SEO Global")}</CardTitle>
          <CardDescription>{t("Judul dan deskripsi yang tampil di hasil pencarian.")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarisNilai label={t("Meta title")} nilai={konten.meta_title} />
          <BarisNilai label={t("Meta description")} nilai={konten.meta_description} />
          <BarisNilai label={t("Gambar Open Graph")} nilai={konten.meta_og_image} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Wilayah Unggulan")}</CardTitle>
          <CardDescription>{t("Area prioritas yang ditonjolkan pada landing page.")}</CardDescription>
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
            <p className="text-sm text-ink-muted">{t("Belum ada area prioritas.")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Judul & Deskripsi Bagian")}</CardTitle>
          <CardDescription>{t("Judul dan deskripsi tiap bagian halaman utama.")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {BAGIAN_LANDING.map((bagian) => (
            <div key={bagian.kunci} className="flex flex-col gap-4">
              <BarisNilai
                label={t("Judul bagian {label}", { label: t(bagian.label) })}
                nilai={konten[`${bagian.kunci}_title`]}
              />
              <BarisNilai
                label={t("Deskripsi bagian {label}", { label: t(bagian.label) })}
                nilai={konten[`${bagian.kunci}_subtitle`]}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Daftar Pertanyaan (FAQ)")}</CardTitle>
          <CardDescription>{t("Pertanyaan dan jawaban pada bagian FAQ halaman utama.")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {konten.faq_items.length > 0 ? (
            konten.faq_items.map((item, index) => (
              <div key={index} className="flex flex-col gap-4">
                <BarisNilai label={t("Pertanyaan {nomor}", { nomor: index + 1 })} nilai={item.tanya} />
                <BarisNilai label={t("Jawaban {nomor}", { nomor: index + 1 })} nilai={item.jawab} />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted">{t("Memakai daftar pertanyaan bawaan.")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("CTA Mitra “Titip Properti”")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarisNilai label={t("Judul CTA")} nilai={konten.cta_title} />
          <BarisNilai label={t("Deskripsi CTA")} nilai={konten.cta_description} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Bahasa Inggris (English)")}</CardTitle>
          <CardDescription>
            {t("Versi teks untuk halaman")} <code>/en</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarisNilai label={t("Hero title (EN)")} nilai={konten.hero_title_en} />
          <BarisNilai label={t("Hero subtitle (EN)")} nilai={konten.hero_subtitle_en} />
          <BarisNilai label={t("Hero CTA text (EN)")} nilai={konten.hero_cta_text_en} />
          <BarisNilai label={t("Meta title (EN)")} nilai={konten.meta_title_en} />
          <BarisNilai label={t("Meta description (EN)")} nilai={konten.meta_description_en} />
          {BAGIAN_LANDING.map((bagian) => (
            <div key={bagian.kunci} className="flex flex-col gap-4">
              <BarisNilai
                label={t("Bagian {label} — judul (EN)", { label: t(bagian.label) })}
                nilai={konten[`${bagian.kunci}_title_en`]}
              />
              <BarisNilai
                label={t("Bagian {label} — deskripsi (EN)", { label: t(bagian.label) })}
                nilai={konten[`${bagian.kunci}_subtitle_en`]}
              />
            </div>
          ))}
          <BarisNilai label={t("CTA title (EN)")} nilai={konten.cta_title_en} />
          <BarisNilai label={t("CTA description (EN)")} nilai={konten.cta_description_en} />
          {konten.faq_items_en.length > 0 ? (
            konten.faq_items_en.map((item, index) => (
              <div key={index} className="flex flex-col gap-4">
                <BarisNilai
                  label={t("FAQ {nomor} — pertanyaan (EN)", { nomor: index + 1 })}
                  nilai={item.tanya}
                />
                <BarisNilai
                  label={t("FAQ {nomor} — jawaban (EN)", { nomor: index + 1 })}
                  nilai={item.jawab}
                />
              </div>
            ))
          ) : (
            <BarisNilai label={t("FAQ items (EN)")} nilai="" />
          )}
        </CardContent>
      </Card>

      <span className="text-xs text-ink-subtle">
        {t("Terakhir diperbarui {tgl}", { tgl: formatWib(konten.updated_at) })}
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
  const { t } = useBahasa();
  const hasil = useLandingAdmin();

  return (
    <>
      <PageHeader
        judul={t("Landing Page")}
        deskripsi={t("Kelola konten halaman utama: hero, metadata SEO, wilayah unggulan, dan ajakan mitra.")}
      />
      <KontenAsync
        hasil={hasil}
        skeleton={<KerangkaLanding />}
        judulGagal={t("Gagal memuat konten landing page")}
      >
        {(konten) => <FormLanding konten={konten} />}
      </KontenAsync>
    </>
  );
}

/** Halaman landing versi baca-saja untuk peran owner. */
export function LandingCmsPeninjau() {
  const { t } = useBahasa();
  const hasil = useLandingOwner();

  return (
    <>
      <PageHeader
        judul={t("Landing Page")}
        deskripsi={t("Pantau konten halaman utama. Perubahan hanya dapat dilakukan oleh admin.")}
      />
      <KontenAsync
        hasil={hasil}
        skeleton={<KerangkaLanding />}
        judulGagal={t("Gagal memuat konten landing page")}
      >
        {(konten) => <RingkasanLanding konten={konten} />}
      </KontenAsync>
    </>
  );
}
