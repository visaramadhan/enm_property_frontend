"use client";

import Link from "next/link";
import { ArrowRight, Building, Eye, Package, Receipt, Users, Wallet } from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
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
  const { t } = useBahasa();
  const ringkasan = useDashboardOwner();
  const langganan = useLaporanLanggananOwner({ per_page: 5 });

  return (
    <>
      <PageHeader
        judul={t("Pemantauan Owner")}
        deskripsi={t("Ringkasan kinerja platform: mitra, properti, langganan, dan pendapatan.")}
        aksi={
          <>
            <Button variant="outline" asChild>
              <Link href="/owner/laporan">{t("Laporan Langganan")}</Link>
            </Button>
            <Button asChild>
              <Link href="/owner/mitra">
                <Users />
                {t("Laporan Mitra")}
              </Link>
            </Button>
          </>
        }
      />

      <KontenAsync
        hasil={ringkasan}
        skeleton={<SkeletonRingkasan />}
        judulGagal={t("Gagal memuat ringkasan owner")}
      >
        {(data) => (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={t("Total Properti")}
                value={formatAngka(data.properties.total)}
                icon={Building}
                keterangan={t("{n} tayang", { n: formatAngka(data.properties.active) })}
              />
              <StatCard
                label={t("Mitra Aktif")}
                value={formatAngka(data.partners.active)}
                icon={Users}
                keterangan={t("{n} ditangguhkan", { n: formatAngka(data.partners.suspended) })}
              />
              <StatCard
                label={t("Langganan Berjalan")}
                value={formatAngka(data.subscriptions.active)}
                icon={Package}
                keterangan={t("{n} segera berakhir", { n: formatAngka(data.subscriptions.expiring_soon) })}
              />
              <StatCard
                label={t("Pendapatan Bulan Ini")}
                value={data.orders.revenue_this_month_label}
                icon={Wallet}
                keterangan={t("Total {nilai}", { nilai: data.orders.revenue_label })}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("Status Katalog")}</CardTitle>
                  <CardDescription>
                    {t("{n} properti terdaftar", { n: formatAngka(data.properties.total) })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistribusiStatusProperti statistik={data.properties} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("Metrik Interaksi")}</CardTitle>
                  <CardDescription>{t("Akumulasi seluruh properti")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <DaftarMetrik
                    item={[
                      { label: t("Order tercatat"), nilai: data.orders.total, ikon: Receipt },
                      { label: t("Order berhasil"), nilai: data.orders.paid, ikon: Wallet },
                      { label: t("Langganan aktif"), nilai: data.subscriptions.active, ikon: Package },
                      { label: t("Menunggu bayar"), nilai: data.orders.pending, ikon: Eye },
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
            <CardTitle>{t("Mitra Teratas")}</CardTitle>
            <CardDescription>{t("Berdasarkan jumlah properti dan interaksi")}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/mitra">
              {t("Lihat semua")}
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
            <CardTitle>{t("Langganan Terbaru")}</CardTitle>
            <CardDescription>{t("Transaksi pembayaran paket dari mitra")}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/laporan">
              {t("Lihat semua")}
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
