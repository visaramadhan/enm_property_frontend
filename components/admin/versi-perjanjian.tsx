"use client";

import * as React from "react";
import { BadgeCheck, Eye, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { AksiBaris } from "@/components/shared/aksi-baris";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { KolomTabel } from "@/components/shared/data-table";
import { DetailDialog } from "@/components/shared/detail-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  CeklisField,
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

/** Penerjemah teks dari konteks bahasa. */
type Terjemah = (teks: string) => string;

function buatSkemaPerjanjian(t: Terjemah) {
  return z.object({
    version: z.string().trim().min(1, t("Versi wajib diisi")).max(30, t("Versi maksimal 30 karakter")),
    title: z.string().trim().min(5, t("Judul minimal 5 karakter")).max(150, t("Judul maksimal 150 karakter")),
    content: z.string().trim().min(20, t("Isi perjanjian minimal 20 karakter")),
    checklist: z.array(z.string()),
    effective_at: z
      .string()
      .trim()
      .refine((nilai) => nilai === "" || !Number.isNaN(Date.parse(nilai)), t("Tanggal tidak valid")),
    activate: z.boolean(),
  });
}

type NilaiPerjanjian = z.infer<ReturnType<typeof buatSkemaPerjanjian>>;

const nilaiAwalPerjanjian: NilaiPerjanjian = {
  version: "",
  title: "",
  content: "",
  checklist: [],
  effective_at: "",
  activate: true,
};

function kePerjanjian(nilai: NilaiPerjanjian): CreateAgreementRequest {
  return {
    version: nilai.version.trim(),
    title: nilai.title.trim(),
    content: nilai.content.trim(),
    checklist: nilai.checklist.map((poin) => poin.trim()).filter(Boolean),
    effective_at: nilai.effective_at ? new Date(nilai.effective_at).toISOString() : undefined,
    activate: nilai.activate,
  };
}

function FormPerjanjian({ onTutup }: { onTutup: () => void }) {
  const { t } = useBahasa();
  const buat = useBuatPerjanjian();
  const skema = React.useMemo(() => buatSkemaPerjanjian(t), [t]);
  const form = useForm<NilaiPerjanjian>({
    resolver: zodResolver(skema),
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
      judul={t("Versi perjanjian baru")}
      deskripsi={t("Versi perjanjian yang aktif akan diminta persetujuannya saat mitra berlangganan.")}
      ukuran="max-w-2xl"
      memuat={buat.isPending}
      labelKirim={t("Simpan versi")}
      onSubmit={form.handleSubmit(kirim)}
    >
      <div className="flex max-h-[62vh] flex-col gap-6 overflow-y-auto pr-1">
        <KelompokField judul={t("Identitas versi")} kolom={2}>
          <TextField control={form.control} name="version" label={t("Versi")} wajib placeholder="v1.0" />
          <TextField
            control={form.control}
            name="effective_at"
            label={t("Berlaku sejak")}
            type="datetime-local"
            deskripsi={t("Opsional.")}
          />
          <TextField
            control={form.control}
            name="title"
            label={t("Judul")}
            wajib
            className="sm:col-span-2"
            placeholder={t("Perjanjian Kerja Sama Mitra")}
          />
        </KelompokField>

        <KelompokField judul={t("Isi perjanjian")}>
          <TextareaField
            control={form.control}
            name="content"
            label={t("Isi")}
            wajib
            rows={12}
            deskripsi={t("Minimal 20 karakter.")}
          />
        </KelompokField>

        <KelompokField judul={t("Poin ceklis persetujuan")}>
          <CeklisField
            control={form.control}
            name="checklist"
            label={t("Poin yang harus dicentang mitra")}
            deskripsi={t("Kosongkan bila mitra cukup menyetujui perjanjian secara umum.")}
          />
        </KelompokField>

        <KelompokField judul={t("Status")}>
          <CheckboxField
            control={form.control}
            name="activate"
            label={t("Jadikan versi aktif")}
            deskripsi={t("Versi sebelumnya otomatis dinonaktifkan.")}
          />
        </KelompokField>
      </div>
    </FormDialog>
  );
}

export function VersiPerjanjian() {
  const { t } = useBahasa();
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
      judul: t("Versi"),
      selClassName: "whitespace-nowrap font-medium",
      render: (baris) => <span data-numeric>{baris.version}</span>,
    },
    { kunci: "judul", judul: t("Judul"), render: (baris) => baris.title },
    {
      kunci: "status",
      judul: t("Status"),
      render: (baris) => (
        <Badge variant={baris.is_active ? "success" : "neutral"}>
          {baris.is_active ? t("Aktif") : t("Arsip")}
        </Badge>
      ),
    },
    {
      kunci: "efektif",
      judul: t("Berlaku sejak"),
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatWib(baris.effective_at),
    },
    {
      kunci: "dibuat",
      judul: t("Dibuat"),
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
            { label: t("Lihat isi"), ikon: Eye, onPilih: () => setBaca(baris) },
            {
              label: t("Jadikan aktif"),
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
        judul={t("Versi Perjanjian")}
        deskripsi={t("Kelola versi perjanjian kerja sama yang harus disetujui mitra.")}
        aksi={
          <Button onClick={() => setBuatTerbuka(true)}>
            <Plus />
            {t("Versi Baru")}
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
        placeholderCari={t("Cari versi atau judul...")}
        satuan={t("versi")}
        kosong={
          <EmptyState
            judul={t("Belum ada perjanjian")}
            deskripsi={t("Buat versi perjanjian pertama sebelum mitra dapat berlangganan.")}
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
          deskripsi={t("Versi {versi}", { versi: baca.version })}
        >
          <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto">
            <div className="whitespace-pre-wrap rounded-field bg-hover/50 p-4 text-sm text-ink">
              {baca.content}
            </div>

            {baca.checklist.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-ink">{t("Poin ceklis persetujuan")}</span>
                <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[13px] text-ink-muted">
                  {baca.checklist.map((poin, indeks) => (
                    <li key={indeks}>{poin}</li>
                  ))}
                </ol>
              </div>
            ) : null}
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
          judul={t("Jadikan versi aktif")}
          deskripsi={t("Versi {versi} akan menjadi perjanjian aktif dan versi sebelumnya dinonaktifkan.", {
            versi: target.version,
          })}
          labelKonfirmasi={t("Jadikan aktif")}
          memuat={aktifkan.isPending}
          onKonfirmasi={() => void konfirmasiAktifkan()}
        />
      ) : null}
    </>
  );
}
