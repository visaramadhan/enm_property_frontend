"use client";

import { Receipt, TrendingUp } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { kolomLaporanLangganan } from "@/components/shared/kolom-laporan";
import { PageHeader } from "@/components/shared/page-header";
import { TabelData } from "@/components/shared/tabel-data";
import { useLaporanLanggananOwner } from "@/lib/api/hooks";
import { OPSI_STATUS_ORDER } from "@/lib/enum";
import { formatAngka } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { Meta, OrderStatus } from "@/types/api";

interface FilterLaporan {
  status?: OrderStatus;
}

/**
 * Laporan transaksi langganan untuk owner (baca-saja).
 *
 * Endpoint owner mengembalikan `{rows,total,total_amount}` sehingga `meta`
 * paginasi disusun dari `total` — sama seperti laporan admin, namun tanpa
 * tombol ekspor karena owner tidak memiliki endpoint unduh.
 */
export function LaporanLanggananOwner() {
  const tabel = useTabelQuery<FilterLaporan>({ perPage: 10 });
  const daftar = useLaporanLanggananOwner(tabel.query);

  const meta: Meta | undefined = daftar.data
    ? {
        page: tabel.halaman,
        per_page: tabel.query.per_page,
        total: daftar.data.total,
        total_pages: Math.max(1, Math.ceil(daftar.data.total / tabel.query.per_page)),
      }
    : undefined;

  return (
    <>
      <PageHeader
        judul="Laporan Langganan"
        deskripsi="Rekapitulasi transaksi pembayaran paket dari seluruh mitra."
      />

      {daftar.data ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total Transaksi"
            value={formatAngka(daftar.data.total)}
            icon={Receipt}
            keterangan="Seluruh order tercatat"
          />
          <StatCard
            label="Total Pendapatan"
            value={daftar.data.total_amount_label}
            icon={TrendingUp}
            keterangan="Akumulasi nilai order"
          />
        </div>
      ) : null}

      <TabelData
        kolom={kolomLaporanLangganan}
        data={daftar.data?.rows}
        meta={meta}
        kunciBaris={(baris) => baris.order_code}
        memuat={daftar.isPending}
        error={daftar.isError ? daftar.error : undefined}
        onCobaLagi={() => void daftar.refetch()}
        onUbahHalaman={tabel.aturHalaman}
        nilaiCari={tabel.cari}
        onCari={tabel.ubahCari}
        placeholderCari="Cari kode order atau nama mitra..."
        satuan="transaksi"
        filter={[
          {
            kunci: "status",
            label: "Status",
            nilai: tabel.filter.status,
            opsi: OPSI_STATUS_ORDER,
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as OrderStatus | undefined),
          },
        ]}
        kosong={
          <EmptyState
            judul="Belum ada transaksi"
            deskripsi="Transaksi langganan mitra akan tampil di sini."
          />
        }
      />
    </>
  );
}
