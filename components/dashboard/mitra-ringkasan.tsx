"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building, CalendarClock, Eye, Heart, MessageCircle, Plus } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DaftarMetrik } from "@/components/dashboard/daftar-metrik";
import { DistribusiStatusProperti } from "@/components/dashboard/distribusi-status";
import { SkeletonRingkasan } from "@/components/dashboard/skeleton-ringkasan";
import { KartuLangganan } from "@/components/mitra/kartu-langganan";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { SelProperti } from "@/components/properti/sel-properti";
import { DataTable, type KolomTabel } from "@/components/shared/data-table";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMitra } from "@/lib/api/hooks";
import { LABEL } from "@/lib/enum";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import type { PropertySummary } from "@/types/api";

/**
 * Kolom tabel properti terbaru.
 *
 * Dibuat lewat fungsi agar judul kolom dapat memakai penerjemah `t` dari
 * komponen (label di level modul tidak punya akses ke konteks bahasa).
 */
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
      kunci: "tayangan",
      judul: t("Tayangan"),
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.views)}</span>,
    },
    {
      kunci: "dibuat",
      judul: t("Diajukan"),
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatTanggalWib(baris.created_at),
    },
  ];
}

export function MitraRingkasan() {
  const { t } = useBahasa();
  const ringkasan = useDashboardMitra();
  const kolom = React.useMemo(() => kolomProperti(t), [t]);

  return (
    <>
      <KontenAsync
        hasil={ringkasan}
        skeleton={
          <>
            <PageHeader judul={t("Ringkasan Mitra")} deskripsi={t("Memuat performa listing Anda...")} />
            <SkeletonRingkasan />
          </>
        }
        judulGagal={t("Gagal memuat ringkasan mitra")}
      >
        {(data) => (
          <>
            <PageHeader
              judul={t("Ringkasan Mitra")}
              deskripsi={t("Pantau performa listing dan status paket {nama}.", {
                nama: data.partner_name,
              })}
              aksi={
                <>
                  <Button variant="outline" asChild>
                    <Link href="/mitra/langganan">{t("Paket & Langganan")}</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/mitra/properti/baru">
                      <Plus />
                      {t("Tambah Properti")}
                    </Link>
                  </Button>
                </>
              }
            />

            {data.partner_status === "suspended" ? (
              <Alert variant="danger">
                <AlertTitle>{t(LABEL.statusMitra[data.partner_status])}</AlertTitle>
                <AlertDescription>
                  {t("Akun mitra Anda sedang ditangguhkan. Hubungi admin untuk informasi lebih lanjut.")}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label={t("Properti Saya")}
                value={formatAngka(data.properties.total)}
                icon={Building}
                keterangan={t("{n} menunggu review", {
                  n: formatAngka(data.properties.pending_review),
                })}
              />
              <StatCard
                label={t("Tayangan Listing")}
                value={formatAngka(data.property_views)}
                icon={Eye}
                keterangan={t("{n} listing tayang", { n: formatAngka(data.properties.active) })}
              />
              <StatCard
                label={t("Leads WhatsApp")}
                value={formatAngka(data.property_contacts)}
                icon={MessageCircle}
                keterangan={t("Total kontak masuk")}
              />
              <StatCard
                label={t("Sisa Kuota Listing")}
                value={
                  data.listing_quota < 0 ? t("Tanpa batas") : formatAngka(data.listing_remaining)
                }
                icon={CalendarClock}
                keterangan={
                  data.subscription
                    ? t("Paket {nama}", { nama: data.subscription.plan_name })
                    : t("Belum ada paket aktif")
                }
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("Status Katalog Anda")}</CardTitle>
                  <CardDescription>
                    {t("{n} properti terdaftar", { n: formatAngka(data.properties.total) })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistribusiStatusProperti statistik={data.properties} />
                </CardContent>
              </Card>

              {data.subscription ? (
                <KartuLangganan langganan={data.subscription} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Belum Ada Paket")}</CardTitle>
                    <CardDescription>
                      {t("Pilih paket langganan untuk mulai menayangkan properti Anda.")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <DaftarMetrik
                      item={[
                        { label: t("Favorit penyewa"), nilai: data.favorites, ikon: Heart },
                        { label: t("Listing terpakai"), nilai: data.listing_used, ikon: Building },
                      ]}
                    />
                    <Button className="w-full" asChild>
                      <Link href="/mitra/langganan">
                        {t("Pilih Paket")}
                        <ArrowRight />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </KontenAsync>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="flex-row items-start justify-between gap-4 p-6">
          <div className="flex flex-col gap-1">
            <CardTitle>{t("Properti Terbaru")}</CardTitle>
            <CardDescription>{t("Properti yang Anda ajukan ke katalog")}</CardDescription>
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
          data={ringkasan.data?.recent_properties}
          kunciBaris={(baris) => baris.id}
          memuat={ringkasan.isPending}
        />
      </Card>
    </>
  );
}
