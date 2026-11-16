"use client";

import * as React from "react";
import { Eye, PencilLine } from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
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
  const { t } = useBahasa();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge jenis="mitra" status={mitra.status} label={mitra.status_label} />
      </div>

      {mitra.suspended_reason ? (
        <p className="rounded-field bg-danger/8 p-3 text-[13px] text-ink-muted">
          {t("Alasan penangguhan: ")}
          {mitra.suspended_reason}
        </p>
      ) : null}

      <DaftarDeskripsi
        item={[
          { label: t("Nama bisnis"), nilai: mitra.business_name },
          { label: t("Penanggung jawab"), nilai: mitra.pic_name },
          { label: t("Telepon"), nilai: mitra.phone },
          { label: t("Email"), nilai: mitra.email || "-" },
          { label: t("Kota"), nilai: mitra.city },
          { label: t("Provinsi"), nilai: mitra.province },
          { label: t("Alamat"), nilai: mitra.address, penuh: true },
          {
            label: t("Bergabung"),
            nilai: mitra.joined_at ? formatWib(mitra.joined_at) : "-",
          },
          {
            label: t("Perjanjian disetujui"),
            nilai: mitra.agreement_accepted_at ? formatWib(mitra.agreement_accepted_at) : t("Belum"),
          },
        ]}
      />
    </div>
  );
}

export function ManajemenMitra() {
  const { t } = useBahasa();
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
      judul: t("Mitra"),
      render: (baris) => (
        <span className="flex flex-col">
          <span className="font-medium text-ink">{baris.business_name}</span>
          <span className="text-xs text-ink-muted">{baris.pic_name}</span>
        </span>
      ),
    },
    {
      kunci: "kontak",
      judul: t("Kontak"),
      render: (baris) => (
        <span className="flex flex-col">
          <span data-numeric className="text-ink">{baris.phone}</span>
          <span className="text-xs text-ink-muted">{baris.email || "-"}</span>
        </span>
      ),
    },
    {
      kunci: "wilayah",
      judul: t("Wilayah"),
      selClassName: "text-ink-muted",
      render: (baris) => `${baris.city}, ${baris.province}`,
    },
    {
      kunci: "status",
      judul: t("Status"),
      render: (baris) => (
        <StatusBadge jenis="mitra" status={baris.status} label={baris.status_label} />
      ),
    },
    {
      kunci: "bergabung",
      judul: t("Bergabung"),
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
            { label: t("Lihat detail"), ikon: Eye, onPilih: () => setDetail(baris) },
            {
              label: t("Ubah status"),
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
        judul={t("Manajemen Mitra")}
        deskripsi={t("Tangguhkan, aktifkan kembali, atau tinjau data mitra yang terdaftar.")}
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
        placeholderCari={t("Cari nama bisnis, PIC, atau kota...")}
        satuan={t("mitra")}
        filter={[
          {
            kunci: "status",
            label: t("Status"),
            nilai: tabel.filter.status,
            opsi: OPSI_FILTER_STATUS.map((o) => ({ ...o, label: t(o.label) })),
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as PartnerStatus | undefined),
          },
        ]}
        kosong={
          <EmptyState
            judul={t("Belum ada mitra")}
            deskripsi={t("Mitra yang mendaftar akan tampil di sini.")}
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
          deskripsi={t("Rincian data mitra")}
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
          judul={t("Ubah status mitra")}
          deskripsi={target.business_name}
          opsi={OPSI_UBAH_STATUS.map((o) => ({ ...o, label: t(o.label) }))}
          nilaiAwal={target.status === "suspended" ? "suspended" : "active"}
          denganAlasan
          labelAlasan={t("Catatan (alasan penangguhan)")}
          memuat={mutasi.isPending}
          onKirim={kirimStatus}
        />
      ) : null}
    </>
  );
}
