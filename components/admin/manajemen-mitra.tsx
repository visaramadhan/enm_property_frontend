"use client";

import * as React from "react";
import { Eye, PencilLine } from "lucide-react";

import { AksiBaris } from "@/components/shared/aksi-baris";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import type { KolomTabel } from "@/components/shared/data-table";
import { DetailDialog } from "@/components/shared/detail-dialog";
import { DialogUbahStatus, type NilaiStatus } from "@/components/shared/dialog-status";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { useDaftarMitraAdmin, useUbahStatusMitra } from "@/lib/api/hooks";
import { OPSI_STATUS_MITRA } from "@/lib/enum";
import { formatTanggalWib, formatWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { PartnerStatus, PartnerView, SuspendPartnerRequest } from "@/types/api";

interface FilterMitra {
  status?: PartnerStatus;
}

/**
 * Mitra mendaftar dengan status aktif tanpa proses verifikasi, sehingga admin
 * hanya perlu menangguhkan atau mengaktifkan kembali mitra. Status `pending`
 * dan `expired` tidak lagi ditawarkan.
 */
const OPSI_UBAH_STATUS = OPSI_STATUS_MITRA.filter(
  (opsi) => opsi.nilai === "active" || opsi.nilai === "suspended",
);

/** Status `pending` tidak pernah terjadi lagi, jadi tidak perlu difilter. */
const OPSI_FILTER_STATUS = OPSI_STATUS_MITRA.filter((opsi) => opsi.nilai !== "pending");

/** Rincian identitas mitra pada modal detail. */
function RincianMitra({ mitra }: { mitra: PartnerView }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge jenis="mitra" status={mitra.status} label={mitra.status_label} />
      </div>

      {mitra.suspended_reason ? (
        <p className="rounded-field bg-danger/8 p-3 text-[13px] text-ink-muted">
          Alasan penangguhan: {mitra.suspended_reason}
        </p>
      ) : null}

      <DaftarDeskripsi
        item={[
          { label: "Nama bisnis", nilai: mitra.business_name },
          { label: "Penanggung jawab", nilai: mitra.pic_name },
          { label: "Telepon", nilai: mitra.phone },
          { label: "Email", nilai: mitra.email || "-" },
          { label: "Kota", nilai: mitra.city },
          { label: "Provinsi", nilai: mitra.province },
          { label: "Alamat", nilai: mitra.address, penuh: true },
          {
            label: "Bergabung",
            nilai: mitra.joined_at ? formatWib(mitra.joined_at) : "-",
          },
          {
            label: "Perjanjian disetujui",
            nilai: mitra.agreement_accepted_at ? formatWib(mitra.agreement_accepted_at) : "Belum",
          },
        ]}
      />
    </div>
  );
}

export function ManajemenMitra() {
  const tabel = useTabelQuery<FilterMitra>({ perPage: 10 });
  const daftar = useDaftarMitraAdmin(tabel.query);
  const mutasi = useUbahStatusMitra();
  const [target, setTarget] = React.useState<PartnerView | null>(null);
  const [detail, setDetail] = React.useState<PartnerView | null>(null);

  async function kirimStatus(nilai: NilaiStatus) {
    if (!target) return;
    try {
      await mutasi.mutateAsync({
        id: target.id,
        body: { status: nilai.status as SuspendPartnerRequest["status"], reason: nilai.reason },
      });
      setTarget(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const kolom: KolomTabel<PartnerView>[] = [
    {
      kunci: "mitra",
      judul: "Mitra",
      render: (baris) => (
        <span className="flex flex-col">
          <span className="font-medium text-ink">{baris.business_name}</span>
          <span className="text-xs text-ink-muted">{baris.pic_name}</span>
        </span>
      ),
    },
    {
      kunci: "kontak",
      judul: "Kontak",
      render: (baris) => (
        <span className="flex flex-col">
          <span data-numeric className="text-ink">{baris.phone}</span>
          <span className="text-xs text-ink-muted">{baris.email || "-"}</span>
        </span>
      ),
    },
    {
      kunci: "wilayah",
      judul: "Wilayah",
      selClassName: "text-ink-muted",
      render: (baris) => `${baris.city}, ${baris.province}`,
    },
    {
      kunci: "status",
      judul: "Status",
      render: (baris) => (
        <StatusBadge jenis="mitra" status={baris.status} label={baris.status_label} />
      ),
    },
    {
      kunci: "bergabung",
      judul: "Bergabung",
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => (baris.joined_at ? formatTanggalWib(baris.joined_at) : "-"),
    },
    {
      kunci: "aksi",
      judul: "",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => (
        <AksiBaris
          aksi={[
            { label: "Lihat detail", ikon: Eye, onPilih: () => setDetail(baris) },
            {
              label: "Ubah status",
              ikon: PencilLine,
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
        judul="Manajemen Mitra"
        deskripsi="Tangguhkan, aktifkan kembali, atau tinjau data mitra yang terdaftar."
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
        placeholderCari="Cari nama bisnis, PIC, atau kota..."
        satuan="mitra"
        filter={[
          {
            kunci: "status",
            label: "Status",
            nilai: tabel.filter.status,
            opsi: OPSI_FILTER_STATUS,
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as PartnerStatus | undefined),
          },
        ]}
        kosong={
          <EmptyState
            judul="Belum ada mitra"
            deskripsi="Mitra yang mendaftar akan tampil di sini."
          />
        }
      />

      {detail ? (
        <DetailDialog
          key={detail.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setDetail(null);
          }}
          judul={detail.business_name}
          deskripsi="Rincian data mitra"
        >
          <RincianMitra mitra={detail} />
        </DetailDialog>
      ) : null}

      {target ? (
        <DialogUbahStatus
          key={target.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTarget(null);
          }}
          judul="Ubah status mitra"
          deskripsi={target.business_name}
          opsi={OPSI_UBAH_STATUS}
          nilaiAwal={target.status === "suspended" ? "suspended" : "active"}
          denganAlasan
          labelAlasan="Catatan (alasan penangguhan)"
          memuat={mutasi.isPending}
          onKirim={kirimStatus}
        />
      ) : null}
    </>
  );
}
