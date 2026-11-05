"use client";

import Link from "next/link";
import { ArrowRight, Building, CalendarClock, Eye, Heart, MessageCircle, Plus } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DaftarMetrik } from "@/components/dashboard/daftar-metrik";
import { DistribusiStatusProperti } from "@/components/dashboard/distribusi-status";
import { SkeletonRingkasan } from "@/components/dashboard/skeleton-ringkasan";
import { KartuLangganan } from "@/components/mitra/kartu-langganan";
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

const kolomProperti: KolomTabel<PropertySummary>[] = [
  { kunci: "properti", judul: "Properti", render: (baris) => <SelProperti properti={baris} /> },
  {
    kunci: "status",
    judul: "Status",
    render: (baris) => (
      <StatusBadge jenis="properti" status={baris.status} label={baris.status_label} />
    ),
  },
  {
    kunci: "tayangan",
    judul: "Tayangan",
    kepalaClassName: "text-right",
    selClassName: "text-right",
    render: (baris) => <span data-numeric>{formatAngka(baris.views)}</span>,
  },
  {
    kunci: "dibuat",
    judul: "Diajukan",
    selClassName: "whitespace-nowrap text-ink-muted",
    render: (baris) => formatTanggalWib(baris.created_at),
  },
];

export function MitraRingkasan() {
  const ringkasan = useDashboardMitra();

  return (
    <>
      <KontenAsync
        hasil={ringkasan}
        skeleton={
          <>
            <PageHeader judul="Ringkasan Mitra" deskripsi="Memuat performa listing Anda..." />
            <SkeletonRingkasan />
          </>
        }
        judulGagal="Gagal memuat ringkasan mitra"
      >
        {(data) => (
          <>
            <PageHeader
              judul="Ringkasan Mitra"
              deskripsi={`Pantau performa listing dan status paket ${data.partner_name}.`}
              aksi={
                <>
                  <Button variant="outline" asChild>
                    <Link href="/mitra/langganan">Paket &amp; Langganan</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/mitra/properti/baru">
                      <Plus />
                      Tambah Properti
                    </Link>
                  </Button>
                </>
              }
            />

            {data.partner_status !== "active" ? (
              <Alert variant={data.partner_status === "suspended" ? "danger" : "warning"}>
                <AlertTitle>{LABEL.statusMitra[data.partner_status]}</AlertTitle>
                <AlertDescription>
                  {data.partner_status === "suspended"
                    ? "Akun mitra Anda sedang ditangguhkan. Hubungi admin untuk informasi lebih lanjut."
                    : "Akun mitra Anda belum diverifikasi. Listing dapat ditambahkan namun menunggu persetujuan admin."}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Properti Saya"
                value={formatAngka(data.properties.total)}
                icon={Building}
                keterangan={`${formatAngka(data.properties.pending_review)} menunggu review`}
              />
              <StatCard
                label="Tayangan Listing"
                value={formatAngka(data.property_views)}
                icon={Eye}
                keterangan={`${formatAngka(data.properties.active)} listing tayang`}
              />
              <StatCard
                label="Leads WhatsApp"
                value={formatAngka(data.property_contacts)}
                icon={MessageCircle}
                keterangan="Total kontak masuk"
              />
              <StatCard
                label="Sisa Kuota Listing"
                value={
                  data.listing_quota < 0 ? "Tanpa batas" : formatAngka(data.listing_remaining)
                }
                icon={CalendarClock}
                keterangan={
                  data.subscription
                    ? `Paket ${data.subscription.plan_name}`
                    : "Belum ada paket aktif"
                }
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Status Katalog Anda</CardTitle>
                  <CardDescription>
                    {formatAngka(data.properties.total)} properti terdaftar
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
                    <CardTitle>Belum Ada Paket</CardTitle>
                    <CardDescription>
                      Pilih paket langganan untuk mulai menayangkan properti Anda.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <DaftarMetrik
                      item={[
                        { label: "Favorit penyewa", nilai: data.favorites, ikon: Heart },
                        { label: "Listing terpakai", nilai: data.listing_used, ikon: Building },
                      ]}
                    />
                    <Button className="w-full" asChild>
                      <Link href="/mitra/langganan">
                        Pilih Paket
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
            <CardTitle>Properti Terbaru</CardTitle>
            <CardDescription>Properti yang Anda ajukan ke katalog</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mitra/properti">
              Lihat semua
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>

        <DataTable
          kolom={kolomProperti}
          data={ringkasan.data?.recent_properties}
          kunciBaris={(baris) => baris.id}
          memuat={ringkasan.isPending}
        />
      </Card>
    </>
  );
}
