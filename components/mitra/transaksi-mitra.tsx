"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Eye, Receipt } from "lucide-react";

import { AksiBaris } from "@/components/shared/aksi-baris";
import type { KolomTabel } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Button } from "@/components/ui/button";
import { useDaftarTransaksiMitra } from "@/lib/api/hooks";
import { OPSI_STATUS_ORDER } from "@/lib/enum";
import { formatTanggalWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { OrderKind, OrderStatus, OrderView } from "@/types/api";

interface FilterTransaksi {
  status?: OrderStatus;
  kind?: OrderKind;
}

/** Opsi jenis order memakai label yang dikirim backend (`kind_label`). */
const OPSI_JENIS_ORDER = [
  { nilai: "new", label: "Baru" },
  { nilai: "renewal", label: "Perpanjangan" },
  { nilai: "upgrade", label: "Peningkatan" },
  { nilai: "free", label: "Gratis" },
];

/**
 * Halaman Transaksi mitra (item 9).
 *
 * Menampilkan seluruh riwayat order langganan beserta status pembayarannya.
 * Dapat diakses dari halaman Paket & Langganan maupun dari halaman pembayaran.
 */
export function TransaksiMitra() {
  const router = useRouter();
  const tabel = useTabelQuery<FilterTransaksi>({ perPage: 10 });
  const daftar = useDaftarTransaksiMitra(tabel.query);

  const kolom: KolomTabel<OrderView>[] = [
    {
      kunci: "kode",
      judul: "Kode Order",
      render: (baris) => (
        <span data-numeric className="font-medium text-ink">
          {baris.code}
        </span>
      ),
    },
    {
      kunci: "paket",
      judul: "Paket",
      render: (baris) => (
        <span className="flex flex-col">
          <span className="text-ink">{baris.plan_name}</span>
          <span className="text-xs text-ink-muted">{baris.kind_label}</span>
        </span>
      ),
    },
    {
      kunci: "jumlah",
      judul: "Jumlah",
      selClassName: "whitespace-nowrap",
      render: (baris) => (
        <span data-numeric className="font-medium text-ink">
          {baris.amount_label}
        </span>
      ),
    },
    {
      kunci: "status",
      judul: "Status Pembayaran",
      render: (baris) => (
        <StatusBadge jenis="order" status={baris.status} label={baris.status_label} />
      ),
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
          aksi={[
            {
              label: "Lihat detail",
              ikon: Eye,
              onPilih: () => router.push(`/mitra/transaksi/${baris.code}`),
            },
            ...(baris.status === "pending"
              ? [
                  {
                    label: "Bayar sekarang",
                    ikon: CreditCard,
                    onPilih: () => router.push(`/pembayaran/${baris.code}`),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        judul="Transaksi"
        deskripsi="Riwayat transaksi langganan beserta status pembayarannya."
        aksi={
          <Button variant="outline" asChild>
            <Link href="/mitra/langganan">
              <Receipt />
              Paket &amp; Langganan
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
        placeholderCari="Cari kode order atau paket..."
        satuan="transaksi"
        filter={[
          {
            kunci: "status",
            label: "Status",
            nilai: tabel.filter.status,
            opsi: OPSI_STATUS_ORDER,
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as OrderStatus | undefined),
          },
          {
            kunci: "kind",
            label: "Jenis",
            nilai: tabel.filter.kind,
            opsi: OPSI_JENIS_ORDER,
            onUbah: (nilai) => tabel.ubahFilter("kind", nilai as OrderKind | undefined),
          },
        ]}
        kosong={
          <EmptyState
            ikon={Receipt}
            judul="Belum ada transaksi"
            deskripsi="Transaksi langganan akan muncul setelah Anda melakukan pembayaran paket."
          />
        }
      />
    </>
  );
}
