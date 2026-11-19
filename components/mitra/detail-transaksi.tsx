"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Download, Receipt, XCircle } from "lucide-react";

import { KartuLangganan } from "@/components/mitra/kartu-langganan";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { unduhInvoicePdf } from "@/lib/api/endpoints";
import { useBatalkanOrder, useStatusOrder } from "@/lib/api/hooks";
import { formatRupiah, formatWib } from "@/lib/format";
import { jalankanDenganToast } from "@/lib/toast";
import { unduhBerkas } from "@/lib/unduh";

/**
 * Detail satu transaksi langganan (item 9 & 10).
 *
 * Menampilkan status pembayaran secara lengkap. Status dipantau otomatis
 * (polling) sehingga ketika pembayaran Midtrans berhasil halaman langsung
 * menampilkan paket yang aktif tanpa dimuat ulang manual.
 */
export function DetailTransaksi({ orderCode }: { orderCode: string }) {
  const { t } = useBahasa();
  const router = useRouter();
  const status = useStatusOrder(orderCode, true, 5000);
  const batal = useBatalkanOrder();
  const [konfirmasiBatal, setKonfirmasiBatal] = React.useState(false);

  async function batalkanPembayaran() {
    try {
      await batal.mutateAsync(orderCode);
      setKonfirmasiBatal(false);
      router.push("/mitra/langganan");
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function unduhInvoice() {
    await jalankanDenganToast(
      async () => {
        const blob = await unduhInvoicePdf(orderCode);
        unduhBerkas(blob, `invoice-${orderCode}.pdf`);
      },
      {
        memuat: t("Menyiapkan invoice..."),
        sukses: t("Invoice berhasil diunduh"),
        gagal: t("Gagal mengunduh invoice"),
      },
    );
  }

  return (
    <>
      <PageHeader
        judul={t("Detail Transaksi")}
        deskripsi={t("Status pembayaran dan rincian transaksi langganan Anda.")}
        aksi={
          <Button variant="outline" asChild>
            <Link href="/mitra/transaksi">
              <ArrowLeft />
              {t("Kembali")}
            </Link>
          </Button>
        }
      />

      <KontenAsync
        hasil={status}
        skeleton={<Skeleton className="h-80 rounded-card" />}
        judulGagal={t("Gagal memuat transaksi")}
      >
        {(data) => {
          const order = data.order;
          const lunas = order.status === "paid";
          const gagal = order.status === "failed" || order.status === "expired";
          const menunggu = order.status === "pending";

          return (
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      <Receipt className="size-4 text-primary" aria-hidden="true" />
                      <span data-numeric>{order.code}</span>
                      <StatusBadge jenis="order" status={order.status} label={order.status_label} />
                    </CardTitle>
                    <CardDescription>
                      {t("Paket")} <span className="font-medium text-ink">{order.plan_name}</span>{" "}
                      {t("untuk mitra {nama}.", { nama: order.partner_name || "-" })}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-5">
                  <DaftarDeskripsi
                    kolom={3}
                    item={[
                      { label: t("Paket"), nilai: order.plan_name },
                      { label: t("Jenis"), nilai: order.kind_label },
                      {
                        label: t("Jumlah"),
                        nilai: <span data-numeric>{order.amount_label || formatRupiah(order.amount)}</span>,
                      },
                      { label: t("Penyedia"), nilai: order.provider },
                      { label: t("Dibuat"), nilai: formatWib(order.created_at) },
                      { label: t("Kedaluwarsa"), nilai: formatWib(order.expires_at) },
                      { label: t("Dibayar pada"), nilai: order.paid_at ? formatWib(order.paid_at) : "-" },
                    ]}
                  />
                </CardContent>
              </Card>

              {lunas ? (
                <Alert variant="success">
                  <AlertTitle>{t("Pembayaran berhasil")}</AlertTitle>
                  <AlertDescription>
                    {t("Paket")} <span className="font-medium text-ink">{order.plan_name}</span>{" "}
                    {t("telah aktif dan kuota listing Anda sudah diperbarui.")}
                  </AlertDescription>
                </Alert>
              ) : gagal ? (
                <Alert variant="danger">
                  <AlertTitle>{t("Pembayaran tidak berhasil")}</AlertTitle>
                  <AlertDescription>
                    {t("Transaksi ini berstatus {status}.", {
                      status: t(order.status_label).toLowerCase(),
                    })}{" "}
                    {t(
                      data.can_retry
                        ? "Anda dapat mengulang pembayaran dari halaman Paket & Langganan."
                        : "Hubungi dukungan bila Anda merasa telah melakukan pembayaran.",
                    )}
                  </AlertDescription>
                </Alert>
              ) : menunggu ? (
                <Alert variant="warning">
                  <AlertTitle>{t("Menunggu pembayaran")}</AlertTitle>
                  <AlertDescription>
                    {t("Selesaikan pembayaran melalui QRIS atau virtual account. Halaman ini akan diperbarui otomatis setelah pembayaran terkonfirmasi.")}
                  </AlertDescription>
                </Alert>
              ) : null}

              {data.subscription && data.subscription.id ? (
                <KartuLangganan langganan={data.subscription} />
              ) : null}

              <div className="flex flex-wrap gap-2">
                {menunggu ? (
                  <Button asChild>
                    <Link href={`/pembayaran/${orderCode}`}>
                      <CreditCard />
                      {t("Bayar sekarang")}
                    </Link>
                  </Button>
                ) : null}

                {menunggu ? (
                  <Button
                    variant="outline"
                    disabled={batal.isPending}
                    onClick={() => setKonfirmasiBatal(true)}
                  >
                    <XCircle />
                    {t("Batalkan pembayaran")}
                  </Button>
                ) : null}

                {lunas ? (
                  <Button variant="outline" onClick={() => void unduhInvoice()}>
                    <Download />
                    {t("Unduh invoice")}
                  </Button>
                ) : null}

                {gagal && data.can_retry ? (
                  <Button asChild>
                    <Link href="/mitra/langganan">
                      <CheckCircle2 />
                      {t("Pilih paket lagi")}
                    </Link>
                  </Button>
                ) : null}

                {!menunggu && !lunas && !gagal ? (
                  <p className="flex items-center gap-2 text-[13px] text-ink-muted">
                    <XCircle className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    {t("Transaksi berstatus {status}.", {
                      status: t(order.status_label).toLowerCase(),
                    })}
                  </p>
                ) : null}
              </div>

              <ConfirmDialog
                terbuka={konfirmasiBatal}
                onUbahTerbuka={(nilai) => {
                  if (!batal.isPending) setKonfirmasiBatal(nilai);
                }}
                judul={t("Batalkan pembayaran?")}
                deskripsi={t(
                  "Pesanan yang dibatalkan tidak dapat dilanjutkan. Anda dapat memilih paket dan metode pembayaran lagi dari halaman Paket & Langganan.",
                )}
                labelKonfirmasi={t("Batalkan pembayaran")}
                variant="danger"
                memuat={batal.isPending}
                onKonfirmasi={() => void batalkanPembayaran()}
              />
            </div>
          );
        }}
      </KontenAsync>
    </>
  );
}
