import type { Metadata } from "next";
import type { ComponentProps } from "react";
import Link from "next/link";
import { ArrowRight, Building, CalendarClock, Eye, MessageCircle, Plus } from "lucide-react";

import { ChartTren, type ChartTitik } from "@/components/dashboard/chart-tren";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAngka, formatTanggalWib } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ringkasan Mitra",
};

/* TODO: ganti seluruh data mock di bawah dengan hasil API modul FE-05 setelah backend siap. */

const dataPerforma: ChartTitik[] = [
  { label: "Feb", tayangan: 640 },
  { label: "Mar", tayangan: 820 },
  { label: "Apr", tayangan: 1180 },
  { label: "Mei", tayangan: 1540 },
  { label: "Jun", tayangan: 1890 },
  { label: "Jul", tayangan: 2160 },
  { label: "Agu", tayangan: 2480 },
];

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

const statusBadge: Record<string, BadgeVariant> = {
  Tayang: "success",
  "Menunggu review": "warning",
  Kedaluwarsa: "danger",
};

const propertiSaya = [
  {
    nama: "Villa Seminyak Modern",
    lokasi: "Badung, Bali",
    status: "Tayang",
    tayangan: 862,
    diajukan: "2026-07-02T11:20:00+07:00",
  },
  {
    nama: "Rumah Cluster Sentul",
    lokasi: "Bogor, Jawa Barat",
    status: "Menunggu review",
    tayangan: 0,
    diajukan: "2026-08-14T16:45:00+07:00",
  },
  {
    nama: "Ruko Pusat Kota Solo",
    lokasi: "Surakarta, Jawa Tengah",
    status: "Tayang",
    tayangan: 415,
    diajukan: "2026-06-21T09:10:00+07:00",
  },
  {
    nama: "Tanah Kavling Ungaran",
    lokasi: "Semarang, Jawa Tengah",
    status: "Kedaluwarsa",
    tayangan: 96,
    diajukan: "2026-05-09T13:35:00+07:00",
  },
];

const paket = {
  nama: "Premium",
  masaAktifTerpakai: 48,
  masaAktifTotal: 90,
  kuotaTerpakai: 6,
  kuotaTotal: 25,
  berakhir: "2026-10-07T23:59:00+07:00",
};

export default function MitraRingkasanPage() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-ink">Ringkasan Mitra</h2>
          <p className="text-sm text-ink-muted">
            Pantau performa listing dan status paket Anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/mitra/langganan">Paket &amp; Langganan</Link>
          </Button>
          <Button asChild>
            <Link href="/mitra/properti/baru">
              <Plus />
              Tambah Properti
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Properti Saya"
          value={formatAngka(6)}
          icon={Building}
          keterangan="2 menunggu review"
        />
        <StatCard
          label="Tayangan Listing"
          value={formatAngka(2480)}
          icon={Eye}
          delta={{ nilai: "18,4%", arah: "naik" }}
          keterangan="30 hari terakhir"
        />
        <StatCard
          label="Leads WhatsApp"
          value={formatAngka(34)}
          icon={MessageCircle}
          delta={{ nilai: "9,1%", arah: "naik" }}
          keterangan="30 hari terakhir"
        />
        <StatCard
          label="Masa Aktif Paket"
          value={`${paket.masaAktifTotal - paket.masaAktifTerpakai} hari`}
          icon={CalendarClock}
          keterangan={`Paket ${paket.nama}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performa Listing</CardTitle>
            <CardDescription>Jumlah tayangan listing 7 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartTren
              data={dataPerforma}
              seri={[{ key: "tayangan", nama: "Tayangan" }]}
              tinggi={280}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>Paket Aktif</CardTitle>
              <CardDescription>
                Berakhir {formatTanggalWib(paket.berakhir)}
              </CardDescription>
            </div>
            <Badge variant="accent">{paket.nama}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-muted">Masa aktif</span>
                <span data-numeric className="font-semibold text-ink">
                  {paket.masaAktifTerpakai}/{paket.masaAktifTotal} hari
                </span>
              </div>
              <Progress
                value={Math.round((paket.masaAktifTerpakai / paket.masaAktifTotal) * 100)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-muted">Kuota listing</span>
                <span data-numeric className="font-semibold text-ink">
                  {paket.kuotaTerpakai}/{paket.kuotaTotal}
                </span>
              </div>
              <Progress
                value={Math.round((paket.kuotaTerpakai / paket.kuotaTotal) * 100)}
                indicatorClassName="bg-secondary"
              />
            </div>

            <p className="rounded-field bg-divider p-4 text-[13px] text-ink-muted">
              Perpanjang paket sebelum masa aktif berakhir agar listing tetap tayang tanpa
              jeda.
            </p>

            <Button className="w-full" asChild>
              <Link href="/mitra/langganan">Perpanjang Paket</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
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
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Properti</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tayangan</TableHead>
                <TableHead>Diajukan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertiSaya.map((item) => (
                <TableRow key={item.nama}>
                  <TableCell>
                    <span className="flex flex-col">
                      <span className="font-medium text-ink">{item.nama}</span>
                      <span className="text-xs text-ink-muted">{item.lokasi}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge[item.status] ?? "neutral"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell data-numeric className="text-right">
                    {formatAngka(item.tayangan)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {formatTanggalWib(item.diajukan)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
