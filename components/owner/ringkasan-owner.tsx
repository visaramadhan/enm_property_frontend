"use client";

import Link from "next/link";
import { ArrowRight, Building, Eye, Package, Receipt, Users, Wallet } from "lucide-react";

import { DaftarMetrik } from "@/components/dashboard/daftar-metrik";
import { DistribusiStatusProperti } from "@/components/dashboard/distribusi-status";
import { SkeletonRingkasan } from "@/components/dashboard/skeleton-ringkasan";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { kolomLaporanLangganan, kolomPartnerReport } from "@/components/shared/kolom-laporan";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardOwner, useLaporanLanggananOwner } from "@/lib/api/hooks";
import { formatAngka } from "@/lib/format";

/**
 * Ringkasan owner — pemantauan lintas modul (baca-saja).
 *
 * Memakai agregat `GET /owner/dashboard` (memuat `top_partners`) dan cuplikan
 * laporan langganan terbaru, tanpa endpoint tambahan di luar kontrak owner.
 */
export function RingkasanOwner() {
  const ringkasan = useDashboardOwner();
  const langganan = useLaporanLanggananOwner({ per_page: 5 });

  return (
    <>
      <PageHeader
        judul="Pemantauan Owner"
        deskripsi="Ringkasan kinerja platform: mitra, properti, langganan, dan pendapatan."
        aksi={
          <>
            <Button variant="outline" asChild>
              <Link href="/owner/laporan">Laporan Langganan</Link>
            </Button>
            <Button asChild>
              <Link href="/owner/mitra">
                <Users />
                Laporan Mitra
              </Link>
            </Button>
          </>
        }
      />

      <KontenAsync
        hasil={ringkasan}
        skeleton={<SkeletonRingkasan />}
        judulGagal="Gagal memuat ringkasan owner"
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
                      { label: "Order tercatat", nilai: data.orders.total, ikon: Receipt },
                      { label: "Order berhasil", nilai: data.orders.paid, ikon: Wallet },
                      { label: "Langganan aktif", nilai: data.subscriptions.active, ikon: Package },
                      { label: "Menunggu bayar", nilai: data.orders.pending, ikon: Eye },
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
            <CardTitle>Mitra Teratas</CardTitle>
            <CardDescription>Berdasarkan jumlah properti dan interaksi</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/mitra">
              Lihat semua
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>

        <DataTable
          kolom={kolomPartnerReport}
          data={ringkasan.data?.top_partners}
          kunciBaris={(baris) => baris.partner_id}
          memuat={ringkasan.isPending}
          error={ringkasan.isError ? ringkasan.error : undefined}
          onCobaLagi={() => void ringkasan.refetch()}
        />
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="flex-row items-start justify-between gap-4 p-6">
          <div className="flex flex-col gap-1">
            <CardTitle>Langganan Terbaru</CardTitle>
            <CardDescription>Transaksi pembayaran paket dari mitra</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/laporan">
              Lihat semua
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>

        <DataTable
          kolom={kolomLaporanLangganan}
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
