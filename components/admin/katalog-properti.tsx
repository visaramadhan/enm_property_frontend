"use client";

import * as React from "react";
import { PencilLine } from "lucide-react";

import { SelHarga, SelProperti } from "@/components/properti/sel-properti";
import { AksiBaris } from "@/components/shared/aksi-baris";
import type { KolomTabel } from "@/components/shared/data-table";
import { DialogUbahStatus, type NilaiStatus } from "@/components/shared/dialog-status";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { useDaftarPropertiAdmin, useUbahStatusPropertiAdmin } from "@/lib/api/hooks";
import { OPSI_STATUS_PROPERTI, OPSI_TIPE_PENAWARAN, OPSI_TIPE_PROPERTI } from "@/lib/enum";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type {
  ListingType,
  PropertyStatus,
  PropertySummary,
  PropertyType,
} from "@/types/api";

interface FilterProperti {
  status?: PropertyStatus;
  listing_type?: ListingType;
  property_type?: PropertyType;
}

export function KatalogPropertiAdmin() {
  const tabel = useTabelQuery<FilterProperti>({ perPage: 10 });
  const daftar = useDaftarPropertiAdmin(tabel.query);
  const mutasi = useUbahStatusPropertiAdmin();
  const [target, setTarget] = React.useState<PropertySummary | null>(null);

  async function kirim(nilai: NilaiStatus) {
    if (!target) return;
    try {
      await mutasi.mutateAsync({
        id: target.id,
        body: {
          status: nilai.status as PropertyStatus,
          reason: nilai.reason || undefined,
        },
      });
      setTarget(null);
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
      kunci: "tayangan",
      judul: "Tayangan",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.views)}</span>,
    },
    {
      kunci: "dibuat",
      judul: "Dibuat",
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
          aksi={[{ label: "Ubah status", ikon: PencilLine, onPilih: () => setTarget(baris) }]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        judul="Katalog Properti"
        deskripsi="Pantau dan moderasi seluruh properti yang terdaftar di platform."
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
        placeholderCari="Cari judul, kota, atau mitra..."
        satuan="properti"
        filter={[
          {
            kunci: "status",
            label: "Status",
            nilai: tabel.filter.status,
            opsi: OPSI_STATUS_PROPERTI,
            onUbah: (nilai) => tabel.ubahFilter("status", nilai),
          },
          {
            kunci: "listing_type",
            label: "Penawaran",
            nilai: tabel.filter.listing_type,
            opsi: OPSI_TIPE_PENAWARAN,
            onUbah: (nilai) => tabel.ubahFilter("listing_type", nilai),
          },
          {
            kunci: "property_type",
            label: "Tipe",
            nilai: tabel.filter.property_type,
            opsi: OPSI_TIPE_PROPERTI,
            onUbah: (nilai) => tabel.ubahFilter("property_type", nilai),
          },
        ]}
        kosong={
          <EmptyState
            judul="Belum ada properti"
            deskripsi="Properti yang diajukan mitra akan tampil di sini."
          />
        }
      />

      {target ? (
        <DialogUbahStatus
          key={target.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTarget(null);
          }}
          judul="Ubah status properti"
          deskripsi={target.title}
          opsi={OPSI_STATUS_PROPERTI}
          nilaiAwal={target.status}
          denganAlasan
          labelAlasan="Catatan moderasi"
          memuat={mutasi.isPending}
          onKirim={kirim}
        />
      ) : null}
    </>
  );
}
