import type { Metadata } from "next";
import type { ComponentProps } from "react";
import Link from "next/link";
import { ArrowRight, Building, Package, TrendingUp, Users, Wallet } from "lucide-react";

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
import { formatAngka, formatRupiahRingkas, formatTanggalWib } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ringkasan Admin",
};

/* TODO: ganti seluruh data mock di bawah dengan hasil API modul FE-06 setelah backend siap. */

const dataPertumbuhan: ChartTitik[] = [
  { label: "Feb", properti: 78, langganan: 31 },
  { label: "Mar", properti: 86, langganan: 35 },
  { label: "Apr", properti: 94, langganan: 39 },
  { label: "Mei", properti: 101, langganan: 43 },
  { label: "Jun", properti: 112, langganan: 46 },
  { label: "Jul", properti: 120, langganan: 49 },
  { label: "Agu", properti: 128, langganan: 52 },
];

const statusKatalog = [
  { label: "Tayang", jumlah: 96, indikator: "bg-success" },
  { label: "Menunggu review", jumlah: 21, indikator: "bg-warning" },
  { label: "Kedaluwarsa", jumlah: 11, indikator: "bg-danger" },
];

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

const statusBadge: Record<string, BadgeVariant> = {
  Berhasil: "success",
  Menunggu: "warning",
  "Kedaluwarsa": "danger",
};

const langgananTerbaru = [
  {
    invoice: "INV-2026-0812",
    mitra: "Villa Bali Sejahtera",
    paket: "Premium",
    jumlah: 1500000,
    status: "Berhasil",
    tanggal: "2026-08-18T09:24:00+07:00",
  },
  {
    invoice: "INV-2026-0811",
    mitra: "Griya Properti Jogja",
    paket: "Standar",
    jumlah: 750000,
    status: "Menunggu",
    tanggal: "2026-08-17T14:02:00+07:00",
  },
  {
    invoice: "INV-2026-0810",
    mitra: "Nusantara Land Batam",
    paket: "Premium",
    jumlah: 1500000,
    status: "Berhasil",
    tanggal: "2026-08-16T10:41:00+07:00",
  },
  {
    invoice: "INV-2026-0809",
    mitra: "Rumah Minimalis Bekasi",
    paket: "Standar",
    jumlah: 750000,
    status: "Kedaluwarsa",
    tanggal: "2026-08-15T08:15:00+07:00",
  },
];

const totalKatalog = statusKatalog.reduce((total, item) => total + item.jumlah, 0);

export default function AdminRingkasanPage() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-ink">Monitoring Platform</h2>
          <p className="text-sm text-ink-muted">
            Ringkasan katalog properti, mitra, dan langganan platform.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/laporan">Laporan Langganan</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/mitra">
              <Users />
              Kelola Mitra
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Properti"
          value={formatAngka(128)}
          icon={Building}
          delta={{ nilai: "12,4%", arah: "naik" }}
          keterangan="vs bulan lalu"
        />
        <StatCard
          label="Mitra Aktif"
          value={formatAngka(46)}
          icon={Users}
          delta={{ nilai: "4 mitra", arah: "naik" }}
          keterangan="vs bulan lalu"
        />
        <StatCard
          label="Langganan Berjalan"
          value={formatAngka(52)}
          icon={Package}
          delta={{ nilai: "3 paket", arah: "naik" }}
          keterangan="vs bulan lalu"
        />
        <StatCard
          label="Pendapatan Bulan Ini"
          value={formatRupiahRingkas(18450000)}
          icon={Wallet}
          delta={{ nilai: "8,2%", arah: "naik" }}
          keterangan="vs bulan lalu"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pertumbuhan Properti &amp; Langganan</CardTitle>
            <CardDescription>Akumulasi 7 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartTren
              data={dataPertumbuhan}
              seri={[
                { key: "properti", nama: "Properti" },
                { key: "langganan", nama: "Langganan" },
              ]}
              tinggi={280}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Katalog</CardTitle>
            <CardDescription>{formatAngka(totalKatalog)} properti terdaftar</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {statusKatalog.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-muted">{item.label}</span>
                  <span data-numeric className="font-semibold text-ink">
                    {formatAngka(item.jumlah)}
                  </span>
                </div>
                <Progress
                  value={Math.round((item.jumlah / totalKatalog) * 100)}
                  indicatorClassName={item.indikator}
                />
              </div>
            ))}

            <div className="mt-1 flex items-start gap-3 rounded-field bg-divider p-4">
              <TrendingUp className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" />
              <p className="text-[13px] text-ink-muted">
                Approval properti rata-rata selesai dalam{" "}
                <span data-numeric className="font-semibold text-ink">
                  1,4 hari
                </span>{" "}
                kerja.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
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
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Mitra</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {langgananTerbaru.map((item) => (
                <TableRow key={item.invoice}>
                  <TableCell data-numeric className="font-medium">
                    {item.invoice}
                  </TableCell>
                  <TableCell>{item.mitra}</TableCell>
                  <TableCell>{item.paket}</TableCell>
                  <TableCell data-numeric className="text-right">
                    {formatRupiahRingkas(item.jumlah)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge[item.status] ?? "neutral"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">
                    {formatTanggalWib(item.tanggal)}
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
