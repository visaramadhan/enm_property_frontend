"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, CreditCard, LoaderCircle, LogOut, QrCode, Receipt, UserCog } from "lucide-react";

import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TombolSalin } from "@/components/shared/tombol-salin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useChargeLangganan, usePembayaranOrder } from "@/lib/api/hooks";
import { formatRupiah, formatWib } from "@/lib/format";
import { toastSukses } from "@/lib/toast";
import type { PaymentChannel, PaymentView } from "@/types/api";

/**
 * Halaman pembayaran satu order langganan (item 8).
 *
 * Menampilkan instruksi **QRIS** atau **Virtual Account** hasil Core API
 * Midtrans (keputusan D-1). Bila belum ada metode terpilih, mitra memilih
 * kanal terlebih dahulu; setelah dibuat instruksi, halaman menampilkan kode QR
 * atau nomor VA beserta tombol salin. Status pembayaran dipantau otomatis
 * (polling) sehingga halaman berubah sendiri begitu pembayaran lunas.
 */

/** Kanal pembayaran yang didukung backend (`ChargeRequest.method`). */
const OPSI_METODE: { nilai: PaymentChannel; label: string }[] = [
  { nilai: "qris", label: "QRIS — semua e-wallet & m-banking" },
  { nilai: "bca", label: "Virtual Account BCA" },
  { nilai: "bni", label: "Virtual Account BNI" },
  { nilai: "bri", label: "Virtual Account BRI" },
  { nilai: "permata", label: "Virtual Account Permata" },
];

/** Pemilih metode pembayaran sebelum kode/instruksi dibuat. */
function PilihMetodePembayaran({ orderCode }: { orderCode: string }) {
  const charge = useChargeLangganan();
  const [metode, setMetode] = React.useState<PaymentChannel>("qris");

  async function buatKode() {
    try {
      await charge.mutateAsync({ orderCode, body: { method: metode } });
      toastSukses("Kode pembayaran dibuat", "Selesaikan pembayaran sesuai instruksi di bawah.");
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4 text-primary" aria-hidden="true" />
          Pilih Metode Pembayaran
        </CardTitle>
        <CardDescription>
          Tentukan cara pembayaran, lalu buat kode agar instruksi pembayaran muncul di halaman ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="metode-pembayaran">Metode</Label>
          <Select value={metode} onValueChange={(nilai) => setMetode(nilai as PaymentChannel)}>
            <SelectTrigger id="metode-pembayaran">
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {OPSI_METODE.map((opsi) => (
                <SelectItem key={opsi.nilai} value={opsi.nilai}>
                  {opsi.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button disabled={charge.isPending} onClick={() => void buatKode()}>
          {charge.isPending ? <LoaderCircle className="animate-spin" /> : <QrCode />}
          Buat kode pembayaran
        </Button>
      </CardContent>
    </Card>
  );
}

/** Instruksi pembayaran QRIS/VA yang sudah dibuat untuk order. */
function InstruksiPembayaran({ data }: { data: PaymentView }) {
  const total = data.order.amount_label || formatRupiah(data.order.amount);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{data.method_label || "Instruksi Pembayaran"}</CardTitle>
          <CardDescription>
            Kode order <span data-numeric>{data.order.code}</span>
          </CardDescription>
        </div>
        <StatusBadge jenis="order" status={data.order.status} label={data.order.status_label} />
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {data.method === "qris" ? (
          <div className="flex flex-col items-center gap-4">
            {data.qr_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={data.qr_url}
                alt="Kode QRIS pembayaran"
                className="size-64 rounded-field border border-line bg-white object-contain p-3"
              />
            ) : (
              <div className="grid size-64 place-items-center rounded-field border border-dashed border-line bg-hover/40 p-6 text-center">
                <QrCode className="size-10 text-ink-subtle" aria-hidden="true" />
              </div>
            )}

            {data.qr_string ? (
              <div className="flex w-full max-w-md flex-col gap-3">
                <p className="rounded-field bg-divider p-3 text-center text-xs break-all text-ink-muted">
                  {data.qr_string}
                </p>
                <TombolSalin
                  teks={data.qr_string}
                  label="Salin kode QRIS"
                  judulSukses="Kode QRIS tersalin"
                  variant="outline"
                  size="sm"
                  className="self-center"
                />
              </div>
            ) : null}

            <p className="text-center text-[13px] text-ink-muted">
              Pindai kode QR di atas memakai aplikasi e-wallet atau m-banking yang mendukung QRIS.
            </p>
          </div>
        ) : (
          <DaftarDeskripsi
            kolom={2}
            item={[
              { label: "Bank", nilai: data.channel_label || "-" },
              {
                label: "Nomor Virtual Account",
                nilai: (
                  <span className="flex items-center gap-2">
                    <span data-numeric className="text-base font-semibold">
                      {data.number || "-"}
                    </span>
                    {data.number ? (
                      <TombolSalin
                        teks={data.number}
                        label=""
                        judulSukses="Nomor VA tersalin"
                        variant="ghost"
                        size="icon-sm"
                      />
                    ) : null}
                  </span>
                ),
              },
              { label: "Total pembayaran", nilai: <span data-numeric>{total}</span> },
              {
                label: "Bayar sebelum",
                nilai: data.expires_at ? formatWib(data.expires_at) : "-",
              },
            ]}
          />
        )}

        {data.method === "qris" ? (
          <div className="flex items-center justify-between rounded-field bg-divider px-4 py-3 text-sm">
            <span className="text-ink-muted">Total pembayaran</span>
            <span data-numeric className="font-semibold text-ink">
              {total}
            </span>
          </div>
        ) : null}

        {data.expires_at ? (
          <p className="text-[13px] text-ink-muted">
            Selesaikan pembayaran sebelum{" "}
            <span className="font-medium text-ink">{formatWib(data.expires_at)}</span> WIB. Halaman
            ini akan diperbarui otomatis setelah pembayaran terkonfirmasi.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PembayaranOrder({ orderCode }: { orderCode: string }) {
  const pembayaran = usePembayaranOrder(orderCode, true, 5000);

  return (
    <>
      <PageHeader
        judul="Pembayaran Langganan"
        deskripsi="Selesaikan pembayaran paket Anda melalui QRIS atau virtual account."
        aksi={
          <>
            <Button variant="outline" asChild>
              <Link href="/mitra/langganan">
                <LogOut />
                Keluar
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/mitra/transaksi/${orderCode}`}>
                <Receipt />
                Lihat Transaksi
              </Link>
            </Button>
          </>
        }
      />

      <KontenAsync
        hasil={pembayaran}
        skeleton={<Skeleton className="h-80 rounded-card" />}
        judulGagal="Gagal memuat instruksi pembayaran"
      >
        {(data) =>
          data.is_paid ? (
            <Card className="border-success/30">
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
                    Pembayaran Berhasil
                  </CardTitle>
                  <CardDescription>
                    Kode order <span data-numeric>{data.order.code}</span>
                  </CardDescription>
                </div>
                <StatusBadge jenis="order" status={data.order.status} label={data.order.status_label} />
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <Alert variant="success">
                  <AlertTitle>Paket Anda aktif</AlertTitle>
                  <AlertDescription>
                    Pembayaran telah terkonfirmasi. Paket langganan{" "}
                    <span className="font-medium text-ink">{data.order.plan_name}</span> kini aktif
                    dan kuota listing Anda sudah diperbarui. Lengkapi profil kemitraan Anda agar
                    listing dapat tayang di katalog.
                  </AlertDescription>
                </Alert>

                <DaftarDeskripsi
                  kolom={2}
                  item={[
                    { label: "Paket", nilai: data.order.plan_name },
                    {
                      label: "Jumlah dibayar",
                      nilai: data.order.amount_label || formatRupiah(data.order.amount),
                    },
                    { label: "Metode", nilai: data.method_label || data.channel_label || "-" },
                    {
                      label: "Dibayar pada",
                      nilai: data.order.paid_at ? formatWib(data.order.paid_at) : "-",
                    },
                  ]}
                />

                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/mitra/profil">
                      <UserCog />
                      Lengkapi Profil Mitra
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/mitra/transaksi/${orderCode}`}>
                      <Receipt />
                      Lihat Transaksi
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/mitra/langganan">Kembali ke Langganan</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : data.method ? (
            <InstruksiPembayaran data={data} />
          ) : (
            <PilihMetodePembayaran orderCode={orderCode} />
          )
        }
      </KontenAsync>
    </>
  );
}
