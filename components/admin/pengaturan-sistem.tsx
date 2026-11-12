"use client";

import * as React from "react";
import { ImageUp, LoaderCircle, Save } from "lucide-react";
import { useForm, useWatch, type Path, type UseFormReturn } from "react-hook-form";

import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { PasswordField, TextField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePengaturan, usePerbaruiPengaturan, useUnggahGambarPengaturan } from "@/lib/api/hooks";
import type { SettingImageKind, SettingView } from "@/types/api";

type NilaiPengaturan = Record<string, string>;

/**
 * Kunci pengaturan berisi gambar beserta jenis unggahan dan judul pratinjaunya.
 *
 * Nilai kunci ini diisi otomatis dari berkas yang diunggah (bukan diketik
 * sebagai URL), sehingga halaman pengaturan hanya perlu menyediakan pemilih
 * berkas dan pratinjau hasilnya.
 */
const GAMBAR_PENGATURAN: Record<string, { kind: SettingImageKind; judul: string }> = {
  site_logo_url: { kind: "logo", judul: "Pratinjau logo di area masuk dan daftar" },
  login_image_url: { kind: "login", judul: "Pratinjau gambar panel area masuk" },
};

/** Kunci pengaturan warna aksen sistem (dirender memakai pemilih warna). */
const KUNCI_WARNA = "brand_color";

/**
 * Editor warna aksen sistem: pemilih warna (color picker) yang disinkronkan
 * dengan nilai HEX yang dapat diketik langsung.
 */
function FieldWarna({
  form,
  name,
  label,
  deskripsi,
}: {
  form: UseFormReturn<NilaiPengaturan>;
  name: Path<NilaiPengaturan>;
  label: string;
  deskripsi?: string;
}) {
  const nilai = useWatch({ control: form.control, name }) ?? "";
  const nilaiPratinjau = /^#[0-9a-fA-F]{6}$/.test(nilai) ? nilai : "#1f6f4a";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          aria-label={`Pilih ${label}`}
          value={nilaiPratinjau}
          onChange={(event) => form.setValue(name, event.target.value, { shouldDirty: true })}
          className="h-10 w-14 shrink-0 cursor-pointer rounded-sm border border-line bg-canvas"
        />
        <input
          type="text"
          value={nilai}
          placeholder="#1f6f4a"
          onChange={(event) => form.setValue(name, event.target.value, { shouldDirty: true })}
          className="h-10 flex-1 rounded-sm border border-line bg-surface px-3 text-sm text-ink"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => form.setValue(name, "", { shouldDirty: true })}
        >
          Bawaan
        </Button>
      </div>
      {deskripsi ? <span className="text-xs text-ink-muted">{deskripsi}</span> : null}
    </div>
  );
}

/**
 * Pengunggah gambar pengaturan: memilih berkas, mengunggahnya, lalu mengisi
 * nilai pengaturan dengan URL hasil konversi WebP dari backend.
 */
function FieldGambarPengaturan({
  form,
  name,
  kind,
  label,
  judul,
}: {
  form: UseFormReturn<NilaiPengaturan>;
  name: Path<NilaiPengaturan>;
  kind: SettingImageKind;
  label: string;
  judul: string;
}) {
  const unggah = useUnggahGambarPengaturan();
  const berkasRef = React.useRef<HTMLInputElement>(null);
  const nilai = useWatch({ control: form.control, name });

  async function pilih(berkas: File) {
    try {
      const hasil = await unggah.mutateAsync({ kind, file: berkas });
      form.setValue(name, hasil.url, { shouldDirty: true });
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
            className="h-16 w-24 shrink-0 rounded-sm border border-line bg-canvas object-cover"
          />
        ) : (
          <span className="grid h-16 w-24 shrink-0 place-items-center rounded-sm border border-dashed border-line text-[10px] text-ink-subtle">
            Kosong
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
          <span className="text-xs text-ink-muted">{judul}</span>
        </div>
      </div>
    </div>
  );
}

/** Formulir nilai pengaturan; bidang dibentuk dari daftar kunci dari backend. */
function FormPengaturan({ pengaturan }: { pengaturan: SettingView[] }) {
  const simpan = usePerbaruiPengaturan();
  const form = useForm<NilaiPengaturan>({
    defaultValues: Object.fromEntries(pengaturan.map((item) => [item.key, item.value])),
  });

  async function kirim(nilai: NilaiPengaturan) {
    try {
      await simpan.mutateAsync({
        settings: pengaturan.map((item) => ({ key: item.key, value: nilai[item.key] ?? "" })),
      });
      form.reset(nilai);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Platform</CardTitle>
        <CardDescription>
          Nilai tersimpan langsung di basis data. Kolom bertanda rahasia disembunyikan saat ditampilkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(kirim)} noValidate className="flex flex-col gap-5">
          {pengaturan.map((item) => {
            const label = item.label || item.key;
            const gambar = GAMBAR_PENGATURAN[item.key];
            if (gambar) {
              return (
                <FieldGambarPengaturan
                  key={item.key}
                  form={form}
                  name={item.key as Path<NilaiPengaturan>}
                  kind={gambar.kind}
                  label={label}
                  judul={gambar.judul}
                />
              );
            }
            if (item.key === KUNCI_WARNA) {
              return (
                <FieldWarna
                  key={item.key}
                  form={form}
                  name={item.key as Path<NilaiPengaturan>}
                  label={label}
                  deskripsi={item.description}
                />
              );
            }
            return item.is_secret ? (
              <PasswordField
                key={item.key}
                control={form.control}
                name={item.key as Path<NilaiPengaturan>}
                label={label}
                deskripsi={item.description}
                autoComplete="new-password"
              />
            ) : (
              <TextField
                key={item.key}
                control={form.control}
                name={item.key as Path<NilaiPengaturan>}
                label={label}
                deskripsi={item.description}
              />
            );
          })}

          <div className="flex justify-end">
            <Button type="submit" disabled={simpan.isPending}>
              {simpan.isPending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save />}
              Simpan pengaturan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function PengaturanSistem() {
  const pengaturan = usePengaturan();

  return (
    <>
      <PageHeader
        judul="Pengaturan Sistem"
        deskripsi="Konfigurasi global platform yang dapat disesuaikan tanpa perubahan kode."
      />

      <KontenAsync
        hasil={pengaturan}
        skeleton={<Skeleton className="h-96 rounded-card" />}
        judulGagal="Gagal memuat pengaturan"
      >
        {(data) => <FormPengaturan pengaturan={data} />}
      </KontenAsync>
    </>
  );
}
