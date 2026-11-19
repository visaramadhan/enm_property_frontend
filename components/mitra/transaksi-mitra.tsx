"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Eye, Receipt, XCircle } from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { AksiBaris } from "@/components/shared/aksi-baris";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { KolomTabel } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Button } from "@/components/ui/button";
import { useBatalkanOrder, useDaftarTransaksiMitra } from "@/lib/api/hooks";
import { OPSI_STATUS_ORDER } from "@/lib/enum";
import { formatTanggalWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { OrderKind, OrderStatus, OrderView } from "@/types/api";

interface FilterTransaksi {
  status?: OrderStatus;
  kind?: OrderKind;
}

/** Opsi jenis order memakai label yang dikirim backend (`kind_label`). */
function opsiJenisOrder(t: (teks: string) => string) {
  return [
    { nilai: "new", label: t("Baru") },
    { nilai: "renewal", label: t("Perpanjangan") },
    { nilai: "upgrade", label: t("Peningkatan") },
    { nilai: "free", label: t("Gratis") },
  ] as { nilai: string; label: string }[];
}

/**
 * Halaman Transaksi mitra (item 9).
 *
 * Menampilkan seluruh riwayat order langganan beserta status pembayarannya.
 * Dapat diakses dari halaman Paket & Langganan maupun dari halaman pembayaran.
 */
export function TransaksiMitra() {
  const { t } = useBahasa();
  const router = useRouter();
  const tabel = useTabelQuery<FilterTransaksi>({ perPage: 10 });
  const daftar = useDaftarTransaksiMitra(tabel.query);
  const batal = useBatalkanOrder();
  const [targetBatal, setTargetBatal] = React.useState<OrderView | null>(null);

  async function konfirmasiBatal() {
    if (!targetBatal) return;
    try {
      await batal.mutateAsync(targetBatal.code);
      setTargetBatal(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const opsiJenis = React.useMemo(() => opsiJenisOrder(t), [t]);
  const opsiStatus = React.useMemo(
    () => OPSI_STATUS_ORDER.map((o) => ({ ...o, label: t(o.label) })),
    [t],
  );

  const kolom: KolomTabel<OrderView>[] = [
    {
      kunci: "kode",
      judul: t("Kode Order"),
      render: (baris) => (
        <span data-numeric className="font-medium text-ink">
          {baris.code}
        </span>
      ),
    },
    {
      kunci: "paket",
      judul: t("Paket"),
      render: (baris) => (
        <span className="flex flex-col">
          <span className="text-ink">{baris.plan_name}</span>
          <span className="text-xs text-ink-muted">{baris.kind_label}</span>
        </span>
      ),
    },
    {
      kunci: "jumlah",
      judul: t("Jumlah"),
      selClassName: "whitespace-nowrap",
      render: (baris) => (
        <span data-numeric className="font-medium text-ink">
          {baris.amount_label}
        </span>
      ),
    },
    {
      kunci: "status",
      judul: t("Status Pembayaran"),
      render: (baris) => (
        <StatusBadge jenis="order" status={baris.status} label={baris.status_label} />
      ),
    },
    {
      kunci: "dibuat",
      judul: t("Dibuat"),
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
              label: t("Lihat detail"),
              ikon: Eye,
              onPilih: () => router.push(`/mitra/transaksi/${baris.code}`),
            },
            ...(baris.status === "pending"
              ? [
                  {
                    label: t("Bayar sekarang"),
                    ikon: CreditCard,
                    onPilih: () => router.push(`/pembayaran/${baris.code}`),
                  },
                  {
                    label: t("Batalkan pembayaran"),
                    ikon: XCircle,
                    variant: "danger" as const,
                    onPilih: () => setTargetBatal(baris),
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
        judul={t("Transaksi")}
        deskripsi={t("Riwayat transaksi langganan beserta status pembayarannya.")}
        aksi={
          <Button variant="outline" asChild>
            <Link href="/mitra/langganan">
              <Receipt />
              {t("Paket & Langganan")}
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
        placeholderCari={t("Cari kode order atau paket...")}
        satuan={t("transaksi")}
        filter={[
          {
            kunci: "status",
            label: t("Status"),
            nilai: tabel.filter.status,
            opsi: opsiStatus,
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as OrderStatus | undefined),
          },
          {
            kunci: "kind",
            label: t("Jenis"),
            nilai: tabel.filter.kind,
            opsi: opsiJenis,
            onUbah: (nilai) => tabel.ubahFilter("kind", nilai as OrderKind | undefined),
          },
        ]}
        kosong={
          <EmptyState
            ikon={Receipt}
            judul={t("Belum ada transaksi")}
            deskripsi={t("Transaksi langganan akan muncul setelah Anda melakukan pembayaran paket.")}
          />
        }
      />

      <ConfirmDialog
        terbuka={targetBatal !== null}
        onUbahTerbuka={(nilai) => {
          if (!batal.isPending && !nilai) setTargetBatal(null);
        }}
        judul={t("Batalkan pembayaran?")}
        deskripsi={t(
          "Pesanan yang dibatalkan tidak dapat dilanjutkan. Anda dapat memilih paket dan metode pembayaran lagi dari halaman Paket & Langganan.",
        )}
        labelKonfirmasi={t("Batalkan pembayaran")}
        variant="danger"
        memuat={batal.isPending}
        onKonfirmasi={() => void konfirmasiBatal()}
      />
    </>
  );
}
