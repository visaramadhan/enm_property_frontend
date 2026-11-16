"use client";

import * as React from "react";
import { Download, LoaderCircle, Receipt, RefreshCw } from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { DataTable, type KolomTabel } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { unduhInvoicePdf } from "@/lib/api/endpoints";
import { useInvoice, useLanggananMitra } from "@/lib/api/hooks";
import { formatAngka, formatRupiah, formatTanggalWib } from "@/lib/format";
import { jalankanDenganToast } from "@/lib/toast";
import { unduhBerkas } from "@/lib/unduh";
import type { InvoiceItem, SubscriptionView } from "@/types/api";

/** Ringkasan langganan yang sedang berjalan (bila ada). */
function KartuLanggananSaatIni({ langganan }: { langganan: SubscriptionView }) {
  const { t } = useBahasa();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Langganan Saat Ini")}</CardTitle>
        <CardDescription>{t("Status paket yang sedang aktif pada akun mitra Anda.")}</CardDescription>
      </CardHeader>
      <CardContent>
        <DaftarDeskripsi
          kolom={3}
          item={[
            {
              label: t("Paket"),
              nilai: langganan.plan_name ? (
                <span className="flex flex-wrap items-center gap-2">
                  {langganan.plan_name}
                  <StatusBadge
                    jenis="langganan"
                    status={langganan.status}
                    label={langganan.status_label}
                  />
                </span>
              ) : (
                t("Belum berlangganan")
              ),
            },
            { label: t("Mulai"), nilai: langganan.starts_at ? formatTanggalWib(langganan.starts_at) : "-" },
            { label: t("Berakhir"), nilai: langganan.ends_at ? formatTanggalWib(langganan.ends_at) : "-" },
            {
              label: t("Sisa hari"),
              nilai: langganan.id
                ? t("{n} hari", { n: formatAngka(langganan.days_remaining) })
                : "-",
            },
            {
              label: t("Listing terpakai"),
              nilai: langganan.id
                ? t("{n} listing", { n: formatAngka(langganan.listings_used) })
                : "-",
            },
            {
              label: t("Kode order terakhir"),
              nilai: langganan.last_order_code ?? "-",
              penuh: true,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function kolomItem(t: (teks: string) => string): KolomTabel<InvoiceItem>[] {
  return [
    {
      kunci: "item",
      judul: t("Item"),
      render: (baris) => (
        <span className="flex flex-col">
          <span className="font-medium text-ink">{baris.name}</span>
          {baris.description ? (
            <span className="text-xs text-ink-muted">{baris.description}</span>
          ) : null}
        </span>
      ),
    },
    {
      kunci: "kuantitas",
      judul: t("Kuantitas"),
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.quantity)}</span>,
    },
    {
      kunci: "harga",
      judul: t("Harga Satuan"),
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatRupiah(baris.unit_price)}</span>,
    },
    {
      kunci: "total",
      judul: t("Total"),
      kepalaClassName: "text-right",
      selClassName: "text-right font-medium",
      render: (baris) => <span data-numeric>{baris.total_label}</span>,
    },
  ];
}

/** Detail invoice pesanan terakhir beserta unduhan PDF. */
function KartuInvoice({ orderCode }: { orderCode: string }) {
  const { t } = useBahasa();
  const invoice = useInvoice(orderCode);

  const kolom = React.useMemo(() => kolomItem(t), [t]);

  async function unduh() {
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
    <KontenAsync
      hasil={invoice}
      skeleton={<Skeleton className="h-72 rounded-card" />}
      judulGagal={t("Gagal memuat invoice")}
    >
      {(data) => (
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="flex-row items-start justify-between gap-4 p-6">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex flex-wrap items-center gap-2">
                {t("Invoice")}
                <span data-numeric className="font-semibold">
                  {data.invoice_number}
                </span>
                <StatusBadge
                  jenis="order"
                  status={data.order.status}
                  label={data.order.status_label}
                />
              </CardTitle>
              <CardDescription>
                {t("Kode order")} <span data-numeric>{data.order.code}</span>
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                disabled={invoice.isFetching}
                onClick={() => void invoice.refetch()}
              >
                {invoice.isFetching ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
                {t("Periksa status")}
              </Button>
              <Button variant="outline" onClick={() => void unduh()}>
                <Download />
                {t("Unduh PDF")}
              </Button>
            </div>
          </CardHeader>

          <div className="border-t border-divider px-6 py-6">
            <DaftarDeskripsi
              kolom={3}
              item={[
                { label: t("Mitra"), nilai: data.partner.business_name },
                { label: t("Diterbitkan"), nilai: formatTanggalWib(data.issued_at) },
                { label: t("Dibayar"), nilai: data.paid_at ? formatTanggalWib(data.paid_at) : "-" },
                { label: t("Paket"), nilai: data.order.plan_name },
                {
                  label: t("Metode"),
                  nilai: data.order.provider === "free" ? t("Tanpa biaya") : data.order.provider,
                },
                { label: t("Berlaku hingga"), nilai: formatTanggalWib(data.order.expires_at) },
              ]}
            />
          </div>

          <div className="border-t border-divider p-6">
            <DataTable
              kolom={kolom}
              data={data.items}
              kunciBaris={(baris, indeks) => `${baris.name}-${indeks}`}
            />
          </div>

          <div className="flex justify-end border-t border-divider px-6 py-5">
            <dl className="flex w-full max-w-xs flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-ink-muted">{t("Subtotal")}</dt>
                <dd data-numeric className="text-ink">
                  {data.subtotal_label || formatRupiah(data.subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-divider pt-2 text-sm">
                <dt className="font-semibold text-ink">{t("Total")}</dt>
                <dd data-numeric className="font-semibold text-ink">
                  {data.total_label || formatRupiah(data.total)}
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      )}
    </KontenAsync>
  );
}

/**
 * Halaman Riwayat Pembayaran mitra.
 *
 * Backend belum menyediakan endpoint daftar order per mitra; kontrak yang
 * tersedia hanya `GET /vendor/subscription` (memuat `last_order_code`) dan
 * `GET /invoices/:orderCode`. Karena itu halaman menampilkan invoice pesanan
 * terakhir secara lengkap, bukan deret riwayat yang tidak dapat dipastikan
 * kebenarannya.
 */
export function PembayaranMitra() {
  const { t } = useBahasa();
  const langganan = useLanggananMitra();

  return (
    <>
      <PageHeader
        judul={t("Riwayat Pembayaran")}
        deskripsi={t("Tinjau tagihan langganan dan unduh invoice pembayaran Anda.")}
      />

      <KontenAsync
        hasil={langganan}
        skeleton={<Skeleton className="h-56 rounded-card" />}
        judulGagal={t("Gagal memuat data langganan")}
      >
        {(data) => {
          const kodeOrder = data.last_order_code;

          if (!data.id && !kodeOrder) {
            return (
              <Card>
                <CardContent className="pt-6">
                  <EmptyState
                    ikon={Receipt}
                    judul={t("Belum ada riwayat pembayaran")}
                    deskripsi={t("Invoice pembayaran akan muncul setelah Anda berlangganan paket berbayar.")}
                  />
                </CardContent>
              </Card>
            );
          }

          return (
            <div className="flex flex-col gap-6">
              <KartuLanggananSaatIni langganan={data} />

              {kodeOrder ? (
                <KartuInvoice orderCode={kodeOrder} />
              ) : (
                <Alert variant="info">
                  <AlertTitle>{t("Belum ada invoice")}</AlertTitle>
                  <AlertDescription>
                    {t("Paket gratis tidak menghasilkan invoice. Invoice akan tersedia saat Anda melakukan pembayaran paket berbayar.")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          );
        }}
      </KontenAsync>
    </>
  );
}
