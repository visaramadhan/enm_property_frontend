"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building, CalendarClock, Eye, Heart, MessageCircle, Package } from "lucide-react";

import { DaftarMetrik } from "@/components/dashboard/daftar-metrik";
import { DistribusiStatusProperti } from "@/components/dashboard/distribusi-status";
import { SkeletonRingkasan } from "@/components/dashboard/skeleton-ringkasan";
import { StatCard } from "@/components/dashboard/stat-card";
import { SelProperti } from "@/components/properti/sel-properti";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { DataTable, type KolomTabel } from "@/components/shared/data-table";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardMitra } from "@/lib/api/hooks";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import type { PropertySummary } from "@/types/api";

function kolomProperti(t: (teks: string) => string): KolomTabel<PropertySummary>[] {
  return [
    { kunci: "properti", judul: t("Properti"), render: (baris) => <SelProperti properti={baris} /> },
    {
      kunci: "status",
      judul: t("Status"),
      render: (baris) => (
        <StatusBadge jenis="properti" status={baris.status} label={baris.status_label} />
      ),
    },
    {
      kunci: "unit",
      judul: t("Unit"),
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.units_available)}</span>,
    },
    {
      kunci: "tayangan",
      judul: t("Tayangan"),
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.views)}</span>,
    },
    {
      kunci: "diajukan",
      judul: t("Diajukan"),
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatTanggalWib(baris.created_at),
    },
  ];
}

/**
 * Halaman Statistik Properti mitra.
 *
 * Memakai agregat `GET /vendor/dashboard` sehingga angka yang ditampilkan
 * selalu berasal dari backend (tanpa data contoh). Tidak ada deret waktu pada
 * kontrak ini, sehingga visualisasi dibatasi pada distribusi status dan
 * metrik akumulatif (YAGNI).
 */
export function StatistikMitra() {
  const { t } = useBahasa();
  const ringkasan = useDashboardMitra();

  const kolom = React.useMemo(() => kolomProperti(t), [t]);

  return (
    <KontenAsync
      hasil={ringkasan}
      skeleton={
        <>
          <PageHeader judul={t("Statistik Properti")} deskripsi={t("Memuat statistik listing Anda...")} />
          <SkeletonRingkasan />
        </>
      }
      judulGagal={t("Gagal memuat statistik properti")}
    >
      {(data) => {
        const tanpaBatas = data.listing_quota < 0;
        const persenKuota =
          tanpaBatas || data.listing_quota === 0
            ? 0
            : Math.min(100, Math.round((data.listing_used / data.listing_quota) * 100));

        return (
          <>
            <PageHeader
              judul={t("Statistik Properti")}
              deskripsi={t("Performa listing dan interaksi katalog {nama}.", { nama: data.partner_name })}
              aksi={
                <Button variant="outline" asChild>
                  <Link href="/mitra/properti">
                    {t("Kelola Properti")}
                    <ArrowRight />
                  </Link>
                </Button>
              }
            />

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={t("Total Properti")}
                value={formatAngka(data.properties.total)}
                icon={Building}
                keterangan={t("{n} tayang", { n: formatAngka(data.properties.active) })}
              />
              <StatCard
                label={t("Tayangan Listing")}
                value={formatAngka(data.property_views)}
                icon={Eye}
                keterangan={t("{n} masih draf", { n: formatAngka(data.properties.draft) })}
              />
              <StatCard
                label={t("Leads WhatsApp")}
                value={formatAngka(data.property_contacts)}
                icon={MessageCircle}
                keterangan={t("Total kontak masuk")}
              />
              <StatCard
                label={t("Favorit Penyewa")}
                value={formatAngka(data.favorites)}
                icon={Heart}
                keterangan={t("Properti yang disimpan pengunjung")}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("Distribusi Status")}</CardTitle>
                  <CardDescription>
                    {t("{n} properti terdaftar pada katalog Anda", {
                      n: formatAngka(data.properties.total),
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistribusiStatusProperti statistik={data.properties} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("Penggunaan Kuota")}</CardTitle>
                  <CardDescription>
                    {data.subscription
                      ? t("Paket {nama}", { nama: data.subscription.plan_name })
                      : t("Belum ada paket aktif")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">{t("Listing terpakai")}</span>
                      <span data-numeric className="font-semibold text-ink">
                        {tanpaBatas
                          ? formatAngka(data.listing_used)
                          : `${formatAngka(data.listing_used)} / ${formatAngka(data.listing_quota)}`}
                      </span>
                    </div>
                    <Progress value={persenKuota} indicatorClassName="bg-secondary" />
                    <span className="text-xs text-ink-muted">
                      {tanpaBatas
                        ? t("Paket tanpa batas kuota listing.")
                        : t("Sisa {n} slot listing.", { n: formatAngka(data.listing_remaining) })}
                    </span>
                  </div>

                  <DaftarMetrik
                    item={[
                      { label: t("Properti tayang"), nilai: data.properties.active, ikon: Eye },
                      { label: t("Menunggu review"), nilai: data.properties.pending_review, ikon: CalendarClock },
                      { label: t("Properti draf"), nilai: data.properties.draft, ikon: Building },
                    ]}
                  />

                  {!data.subscription ? (
                    <Button className="w-full" asChild>
                      <Link href="/mitra/langganan">
                        <Package />
                        {t("Pilih Paket")}
                      </Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <Card className="gap-0 overflow-hidden p-0">
              <CardHeader className="flex-row items-start justify-between gap-4 p-6">
                <div className="flex flex-col gap-1">
                  <CardTitle>{t("Performa Properti Terbaru")}</CardTitle>
                  <CardDescription>{t("Tayangan dan ketersediaan unit per listing")}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/mitra/properti">
                    {t("Lihat semua")}
                    <ArrowRight />
                  </Link>
                </Button>
              </CardHeader>

              <DataTable
                kolom={kolom}
                data={data.recent_properties}
                kunciBaris={(baris) => baris.id}
              />
            </Card>
          </>
        );
      }}
    </KontenAsync>
  );
}
