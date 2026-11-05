"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, PencilLine, Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SelHarga, SelProperti } from "@/components/properti/sel-properti";
import { AksiBaris } from "@/components/shared/aksi-baris";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { KolomTabel } from "@/components/shared/data-table";
import { DialogUbahStatus, type NilaiStatus } from "@/components/shared/dialog-status";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { TextField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Button } from "@/components/ui/button";
import {
  useDaftarPropertiMitra,
  useHapusProperti,
  useUbahKetersediaanProperti,
  useUbahStatusProperti,
} from "@/lib/api/hooks";
import { OPSI_STATUS_PROPERTI, OPSI_TIPE_PENAWARAN } from "@/lib/enum";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { ListingType, PropertyStatus, PropertySummary } from "@/types/api";

interface FilterProperti {
  status?: PropertyStatus;
  listing_type?: ListingType;
}

/** Mitra hanya dapat memilih tiga status ini (sesuai `SetPropertyStatusRequest`). */
const OPSI_STATUS_MITRA = OPSI_STATUS_PROPERTI.filter(
  (opsi) => opsi.nilai === "draft" || opsi.nilai === "active" || opsi.nilai === "inactive",
);

const skemaKetersediaan = z.object({
  units_available: z
    .string()
    .trim()
    .min(1, "Jumlah unit wajib diisi")
    .refine((nilai) => /^\d+$/.test(nilai), "Harus berupa angka"),
});

type NilaiKetersediaan = z.infer<typeof skemaKetersediaan>;

function DialogKetersediaan({
  properti,
  onTutup,
}: {
  properti: PropertySummary;
  onTutup: () => void;
}) {
  const simpan = useUbahKetersediaanProperti();
  const form = useForm<NilaiKetersediaan>({
    resolver: zodResolver(skemaKetersediaan),
    defaultValues: { units_available: String(properti.units_available) },
  });

  async function kirim(nilai: NilaiKetersediaan) {
    try {
      await simpan.mutateAsync({
        id: properti.id,
        body: { units_available: Number(nilai.units_available) },
      });
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
      judul="Ubah ketersediaan unit"
      deskripsi={properti.title}
      memuat={simpan.isPending}
      labelKirim="Simpan"
      onSubmit={form.handleSubmit(kirim)}
    >
      <TextField
        control={form.control}
        name="units_available"
        label="Unit tersedia"
        wajib
        inputMode="numeric"
        deskripsi="Jumlah unit yang masih dapat dipasarkan."
      />
    </FormDialog>
  );
}

export function PropertiMitra() {
  const router = useRouter();
  const tabel = useTabelQuery<FilterProperti>({ perPage: 10 });
  const daftar = useDaftarPropertiMitra(tabel.query);
  const ubahStatus = useUbahStatusProperti();
  const hapus = useHapusProperti();

  const [targetStatus, setTargetStatus] = React.useState<PropertySummary | null>(null);
  const [targetKetersediaan, setTargetKetersediaan] = React.useState<PropertySummary | null>(null);
  const [targetHapus, setTargetHapus] = React.useState<PropertySummary | null>(null);

  async function kirimStatus(nilai: NilaiStatus) {
    if (!targetStatus) return;
    try {
      await ubahStatus.mutateAsync({
        id: targetStatus.id,
        body: { status: nilai.status as "draft" | "active" | "inactive" },
      });
      setTargetStatus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function konfirmasiHapus() {
    if (!targetHapus) return;
    try {
      await hapus.mutateAsync(targetHapus.id);
      setTargetHapus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const kolom: KolomTabel<PropertySummary>[] = [
    { kunci: "properti", judul: "Properti", render: (baris) => <SelProperti properti={baris} /> },
    { kunci: "harga", judul: "Harga", render: (baris) => <SelHarga properti={baris} /> },
    {
      kunci: "status",
      judul: "Status",
      render: (baris) => (
        <StatusBadge jenis="properti" status={baris.status} label={baris.status_label} />
      ),
    },
    {
      kunci: "unit",
      judul: "Unit",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.units_available)}</span>,
    },
    {
      kunci: "tayangan",
      judul: "Tayangan",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.views)}</span>,
    },
    {
      kunci: "dibuat",
      judul: "Diajukan",
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatTanggalWib(baris.created_at),
    },
    {
      kunci: "aksi",
      judul: "",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => (
        <AksiBaris
          aksi={[
            {
              label: "Ubah properti",
              ikon: PencilLine,
              onPilih: () => router.push(`/mitra/properti/${baris.id}`),
            },
            { label: "Ubah status", ikon: PencilLine, onPilih: () => setTargetStatus(baris) },
            {
              label: "Ubah ketersediaan",
              ikon: Boxes,
              onPilih: () => setTargetKetersediaan(baris),
            },
            { label: "Hapus", ikon: Trash2, variant: "danger", onPilih: () => setTargetHapus(baris) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        judul="Properti Saya"
        deskripsi="Kelola listing properti, status tayang, dan ketersediaan unit."
        aksi={
          <Button asChild>
            <Link href="/mitra/properti/baru">
              <Plus />
              Tambah Properti
            </Link>
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
        placeholderCari="Cari judul atau kota..."
        satuan="properti"
        filter={[
          {
            kunci: "status",
            label: "Status",
            nilai: tabel.filter.status,
            opsi: OPSI_STATUS_PROPERTI,
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as PropertyStatus | undefined),
          },
          {
            kunci: "listing_type",
            label: "Penawaran",
            nilai: tabel.filter.listing_type,
            opsi: OPSI_TIPE_PENAWARAN,
            onUbah: (nilai) => tabel.ubahFilter("listing_type", nilai as ListingType | undefined),
          },
        ]}
        kosong={
          <EmptyState
            judul="Belum ada properti"
            deskripsi="Tambahkan properti pertama Anda untuk mulai menayangkan listing."
            aksi={
              <Button asChild size="sm">
                <Link href="/mitra/properti/baru">
                  <Plus />
                  Tambah Properti
                </Link>
              </Button>
            }
          />
        }
      />

      {targetStatus ? (
        <DialogUbahStatus
          key={targetStatus.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetStatus(null);
          }}
          judul="Ubah status properti"
          deskripsi={targetStatus.title}
          opsi={OPSI_STATUS_MITRA}
          nilaiAwal={OPSI_STATUS_MITRA.some((opsi) => opsi.nilai === targetStatus.status) ? targetStatus.status : "draft"}
          memuat={ubahStatus.isPending}
          onKirim={kirimStatus}
        />
      ) : null}

      {targetKetersediaan ? (
        <DialogKetersediaan
          key={targetKetersediaan.id}
          properti={targetKetersediaan}
          onTutup={() => setTargetKetersediaan(null)}
        />
      ) : null}

      {targetHapus ? (
        <ConfirmDialog
          key={targetHapus.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetHapus(null);
          }}
          judul="Hapus properti"
          deskripsi={`Properti "${targetHapus.title}" akan dihapus dari katalog. Tindakan ini tidak dapat dibatalkan.`}
          labelKonfirmasi="Hapus"
          variant="danger"
          memuat={hapus.isPending}
          onKonfirmasi={() => void konfirmasiHapus()}
        />
      ) : null}
    </>
  );
}
