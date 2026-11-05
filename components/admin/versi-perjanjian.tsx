"use client";

import * as React from "react";
import { BadgeCheck, Eye, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AksiBaris } from "@/components/shared/aksi-baris";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { KolomTabel } from "@/components/shared/data-table";
import { DetailDialog } from "@/components/shared/detail-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  CheckboxField,
  KelompokField,
  TextField,
  TextareaField,
} from "@/components/shared/form-field";
import { FormDialog } from "@/components/shared/form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { TabelData } from "@/components/shared/tabel-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAktifkanPerjanjian, useBuatPerjanjian, useDaftarPerjanjian } from "@/lib/api/hooks";
import { formatWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { AgreementView, CreateAgreementRequest } from "@/types/api";

const skemaPerjanjian = z.object({
  version: z.string().trim().min(1, "Versi wajib diisi").max(30, "Versi maksimal 30 karakter"),
  title: z.string().trim().min(5, "Judul minimal 5 karakter").max(150, "Judul maksimal 150 karakter"),
  content: z.string().trim().min(20, "Isi perjanjian minimal 20 karakter"),
  effective_at: z
    .string()
    .trim()
    .refine((nilai) => nilai === "" || !Number.isNaN(Date.parse(nilai)), "Tanggal tidak valid"),
  activate: z.boolean(),
});

type NilaiPerjanjian = z.infer<typeof skemaPerjanjian>;

const nilaiAwalPerjanjian: NilaiPerjanjian = {
  version: "",
  title: "",
  content: "",
  effective_at: "",
  activate: true,
};

function kePerjanjian(nilai: NilaiPerjanjian): CreateAgreementRequest {
  return {
    version: nilai.version.trim(),
    title: nilai.title.trim(),
    content: nilai.content.trim(),
    effective_at: nilai.effective_at ? new Date(nilai.effective_at).toISOString() : undefined,
    activate: nilai.activate,
  };
}

function FormPerjanjian({ onTutup }: { onTutup: () => void }) {
  const buat = useBuatPerjanjian();
  const form = useForm<NilaiPerjanjian>({
    resolver: zodResolver(skemaPerjanjian),
    defaultValues: nilaiAwalPerjanjian,
  });

  async function kirim(nilai: NilaiPerjanjian) {
    try {
      await buat.mutateAsync(kePerjanjian(nilai));
      onTutup();
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <FormDialog
      terbuka
      onUbahTerbuka={(nilai) => {
        if (!nilai) onTutup();
      }}
      judul="Versi perjanjian baru"
      deskripsi="Versi perjanjian yang aktif akan diminta persetujuannya saat mitra berlangganan."
      ukuran="max-w-2xl"
      memuat={buat.isPending}
      labelKirim="Simpan versi"
      onSubmit={form.handleSubmit(kirim)}
    >
      <div className="flex max-h-[62vh] flex-col gap-6 overflow-y-auto pr-1">
        <KelompokField judul="Identitas versi" kolom={2}>
          <TextField control={form.control} name="version" label="Versi" wajib placeholder="v1.0" />
          <TextField
            control={form.control}
            name="effective_at"
            label="Berlaku sejak"
            type="datetime-local"
            deskripsi="Opsional."
          />
          <TextField
            control={form.control}
            name="title"
            label="Judul"
            wajib
            className="sm:col-span-2"
            placeholder="Perjanjian Kerja Sama Mitra"
          />
        </KelompokField>

        <KelompokField judul="Isi perjanjian">
          <TextareaField
            control={form.control}
            name="content"
            label="Isi"
            wajib
            rows={12}
            deskripsi="Minimal 20 karakter."
          />
        </KelompokField>

        <KelompokField judul="Status">
          <CheckboxField
            control={form.control}
            name="activate"
            label="Jadikan versi aktif"
            deskripsi="Versi sebelumnya otomatis dinonaktifkan."
          />
        </KelompokField>
      </div>
    </FormDialog>
  );
}

export function VersiPerjanjian() {
  const tabel = useTabelQuery({ perPage: 10 });
  const daftar = useDaftarPerjanjian(tabel.query);
  const aktifkan = useAktifkanPerjanjian();

  const [buatTerbuka, setBuatTerbuka] = React.useState(false);
  const [target, setTarget] = React.useState<AgreementView | null>(null);
  const [baca, setBaca] = React.useState<AgreementView | null>(null);

  async function konfirmasiAktifkan() {
    if (!target) return;
    try {
      await aktifkan.mutateAsync(target.id);
      setTarget(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const kolom: KolomTabel<AgreementView>[] = [
    {
      kunci: "versi",
      judul: "Versi",
      selClassName: "whitespace-nowrap font-medium",
      render: (baris) => <span data-numeric>{baris.version}</span>,
    },
    { kunci: "judul", judul: "Judul", render: (baris) => baris.title },
    {
      kunci: "status",
      judul: "Status",
      render: (baris) => (
        <Badge variant={baris.is_active ? "success" : "neutral"}>
          {baris.is_active ? "Aktif" : "Arsip"}
        </Badge>
      ),
    },
    {
      kunci: "efektif",
      judul: "Berlaku sejak",
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatWib(baris.effective_at),
    },
    {
      kunci: "dibuat",
      judul: "Dibuat",
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatWib(baris.created_at),
    },
    {
      kunci: "aksi",
      judul: "",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => (
        <AksiBaris
          aksi={[
            { label: "Lihat isi", ikon: Eye, onPilih: () => setBaca(baris) },
            {
              label: "Jadikan aktif",
              ikon: BadgeCheck,
              disabled: baris.is_active,
              onPilih: () => setTarget(baris),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        judul="Versi Perjanjian"
        deskripsi="Kelola versi perjanjian kerja sama yang harus disetujui mitra."
        aksi={
          <Button onClick={() => setBuatTerbuka(true)}>
            <Plus />
            Versi Baru
          </Button>
        }
      />

      <TabelData
        kolom={kolom}
        data={daftar.data?.items}
        meta={daftar.data?.meta}
        kunciBaris={(baris) => baris.id}
        memuat={daftar.isPending}
        error={daftar.isError ? daftar.error : undefined}
        onCobaLagi={() => void daftar.refetch()}
        onUbahHalaman={tabel.aturHalaman}
        nilaiCari={tabel.cari}
        onCari={tabel.ubahCari}
        placeholderCari="Cari versi atau judul..."
        satuan="versi"
        kosong={
          <EmptyState
            judul="Belum ada perjanjian"
            deskripsi="Buat versi perjanjian pertama sebelum mitra dapat berlangganan."
          />
        }
      />

      {buatTerbuka ? <FormPerjanjian key="baru" onTutup={() => setBuatTerbuka(false)} /> : null}

      {baca ? (
        <DetailDialog
          key={baca.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setBaca(null);
          }}
          judul={baca.title}
          deskripsi={`Versi ${baca.version}`}
        >
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-field bg-hover/50 p-4 text-sm text-ink">
            {baca.content}
          </div>
        </DetailDialog>
      ) : null}

      {target ? (
        <ConfirmDialog
          key={target.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTarget(null);
          }}
          judul="Jadikan versi aktif"
          deskripsi={`Versi ${target.version} akan menjadi perjanjian aktif dan versi sebelumnya dinonaktifkan.`}
          labelKonfirmasi="Jadikan aktif"
          memuat={aktifkan.isPending}
          onKonfirmasi={() => void konfirmasiAktifkan()}
        />
      ) : null}
    </>
  );
}
