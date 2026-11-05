"use client";

import * as React from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useForm, useWatch, type Control, type Path } from "react-hook-form";

import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { PasswordField, TextField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePengaturan, usePerbaruiPengaturan } from "@/lib/api/hooks";
import type { SettingView } from "@/types/api";

type NilaiPengaturan = Record<string, string>;

/** Kunci pengaturan berisi URL gambar beserta judul pratinjaunya. */
const KUNCI_GAMBAR: Record<string, string> = {
  site_logo_url: "Pratinjau logo di area masuk dan daftar",
  login_image_url: "Pratinjau gambar panel area masuk",
};

/** Pratinjau langsung nilai URL gambar agar kekeliruan tautan cepat terlihat. */
function PratinjauGambar({
  control,
  name,
  judul,
}: {
  control: Control<NilaiPengaturan>;
  name: string;
  judul: string;
}) {
  const nilai = useWatch({ control, name: name as Path<NilaiPengaturan> });

  return (
    <div className="flex items-center gap-4 rounded-sm border border-line bg-canvas p-3">
      {nilai ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={nilai}
          alt=""
          className="h-14 w-20 shrink-0 rounded-xs border border-line object-cover"
        />
      ) : (
        <span className="grid h-14 w-20 shrink-0 place-items-center rounded-xs border border-dashed border-line text-[10px] text-ink-subtle">
          Kosong
        </span>
      )}
      <span className="text-xs text-ink-muted">{judul}</span>
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
          {pengaturan.map((item) => (
            <React.Fragment key={item.key}>
              {item.is_secret ? (
                <PasswordField
                  control={form.control}
                  name={item.key as Path<NilaiPengaturan>}
                  label={item.key}
                  deskripsi={item.description}
                  autoComplete="new-password"
                />
              ) : (
                <TextField
                  control={form.control}
                  name={item.key as Path<NilaiPengaturan>}
                  label={item.key}
                  deskripsi={item.description}
                />
              )}

              {KUNCI_GAMBAR[item.key] ? (
                <PratinjauGambar
                  control={form.control}
                  name={item.key}
                  judul={KUNCI_GAMBAR[item.key]}
                />
              ) : null}
            </React.Fragment>
          ))}

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
