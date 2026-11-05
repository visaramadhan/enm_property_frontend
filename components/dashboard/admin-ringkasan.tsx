"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building,
  Eye,
  MessageCircle,
  Package,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";

import { DaftarMetrik } from "@/components/dashboard/daftar-metrik";
import { DistribusiStatusProperti } from "@/components/dashboard/distribusi-status";
import { SkeletonRingkasan } from "@/components/dashboard/skeleton-ringkasan";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type KolomTabel } from "@/components/shared/data-table";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAdmin, useLaporanLangganan } from "@/lib/api/hooks";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import type { SubscriptionReportRow } from "@/types/api";

const kolomLangganan: KolomTabel<SubscriptionReportRow>[] = [
  {
    kunci: "kode",
    judul: "Kode Order",
    selClassName: "font-medium",
    render: (baris) => <span data-numeric>{baris.order_code}</span>,
  },
  { kunci: "mitra", judul: "Mitra", render: (baris) => baris.partner_name },
  { kunci: "paket", judul: "Paket", render: (baris) => baris.plan_name },
  {
    kunci: "jumlah",
    judul: "Jumlah",
    kepalaClassName: "text-right",
    selClassName: "text-right",
    render: (baris) => <span data-numeric>{baris.amount_label}</span>,
  },
  {
    kunci: "status",
    judul: "Status",
    render: (baris) => (
      <StatusBadge jenis="order" status={baris.status} label={baris.status_label} />
    ),
  },
  {
    kunci: "tanggal",
    judul: "Tanggal",
    selClassName: "whitespace-nowrap text-ink-muted",
    render: (baris) => formatTanggalWib(baris.created_at),
  },
];

export function AdminRingkasan() {
  const ringkasan = useDashboardAdmin();
  const langganan = useLaporanLangganan({ per_page: 5 });

  return (
    <>
      <PageHeader
        judul="Monitoring Platform"
        deskripsi="Ringkasan katalog properti, mitra, dan langganan platform."
        aksi={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/laporan">Laporan Langganan</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/mitra">
                <Users />
                Kelola Mitra
              </Link>
            </Button>
          </>
        }
      />

      <KontenAsync
        hasil={ringkasan}
        skeleton={<SkeletonRingkasan />}
        judulGagal="Gagal memuat ringkasan platform"
      >
        {(data) => (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Properti"
                value={formatAngka(data.properties.total)}
                icon={Building}
                keterangan={`${formatAngka(data.properties.active)} tayang`}
              />
              <StatCard
                label="Mitra Aktif"
                value={formatAngka(data.partners.active)}
                icon={Users}
                keterangan={`${formatAngka(data.partners.pending)} menunggu verifikasi`}
              />
              <StatCard
                label="Langganan Berjalan"
                value={formatAngka(data.subscriptions.active)}
                icon={Package}
                keterangan={`${formatAngka(data.subscriptions.expiring_soon)} segera berakhir`}
              />
              <StatCard
                label="Pendapatan Bulan Ini"
                value={data.orders.revenue_this_month_label}
                icon={Wallet}
                keterangan={`Total ${data.orders.revenue_label}`}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Status Katalog</CardTitle>
                  <CardDescription>
                    {formatAngka(data.properties.total)} properti terdaftar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistribusiStatusProperti statistik={data.properties} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metrik Interaksi</CardTitle>
                  <CardDescription>Akumulasi seluruh properti</CardDescription>
                </CardHeader>
                <CardContent>
                  <DaftarMetrik
                    item={[
                      { label: "Tayangan properti", nilai: data.property_views, ikon: Eye },
                      { label: "Kontak WhatsApp", nilai: data.property_contacts, ikon: MessageCircle },
                      { label: "Order tercatat", nilai: data.orders.total, ikon: Receipt },
                      { label: "Order berhasil", nilai: data.orders.paid, ikon: Wallet },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </KontenAsync>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="flex-row items-start justify-between gap-4 p-6">
          <div className="flex flex-col gap-1">
            <CardTitle>Langganan Terbaru</CardTitle>
            <CardDescription>Transaksi pembayaran paket dari mitra</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/laporan">
              Lihat semua
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>

        <DataTable
          kolom={kolomLangganan}
          data={langganan.data?.rows}
          kunciBaris={(baris) => baris.order_code}
          memuat={langganan.isPending}
          error={langganan.isError ? langganan.error : undefined}
          onCobaLagi={() => void langganan.refetch()}
        />
      </Card>
    </>
  );
}
