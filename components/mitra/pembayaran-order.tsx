"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  LogOut,
  Receipt,
  RefreshCw,
  UserCog,
  XCircle,
} from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { ScriptSnap } from "@/components/shared/script-snap";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBatalkanOrder, usePembayaranOrder } from "@/lib/api/hooks";
import { formatRupiah, formatWib } from "@/lib/format";
import { bukaSnap, tutupSnap } from "@/lib/midtrans";
import { toastGagal, toastInfo, toastSukses } from "@/lib/toast";
import type { PaymentView } from "@/types/api";

/**
 * Halaman pembayaran satu order langganan (item 8).
 *
 * Pembayaran dilakukan melalui popup Midtrans Snap. Status pembayaran dipantau
 * otomatis (polling) sehingga halaman berubah sendiri begitu lunas.
 */

/** Panel pembayaran yang hanya menggunakan popup Midtrans. */
function PanelBayar({
  data,
  onSukses,
}: {
  data: PaymentView;
  onSukses: () => void;
}) {
  const { t, bahasa } = useBahasa();
  const [snapMemuat, setSnapMemuat] = React.useState(false);
  /* Diisi setelah Snap melaporkan pembayaran berhasil sehingga panel menampilkan
     pemberitahuan untuk menutup jendela pembayaran sekaligus memicu pengecekan
     status terbaru secara otomatis. */
  const [terkirim, setTerkirim] = React.useState(false);

  /* Semua pembayaran order ini diarahkan melalui popup Midtrans. */
  async function bayarSnap() {
    if (!data.snap_token) return;
    setSnapMemuat(true);
    try {
      await bukaSnap(
        data.snap_token,
        {
          onSuccess: () => {
            /* Tutup popup lalu periksa status pesanan agar halaman menampilkan
               hasil pembayaran tanpa menunggu mitra menutup jendela manual. */
            tutupSnap();
            setTerkirim(true);
            toastSukses(t("Pembayaran berhasil"), t("Paket langganan Anda sedang diaktifkan."));
            onSukses();
          },
          onPending: () => {
            tutupSnap();
            toastInfo(t("Pembayaran menunggu penyelesaian"), t("Selesaikan sesuai instruksi."));
            onSukses();
          },
          onError: () => {
            toastGagal(t("Pembayaran gagal"), new Error(t("Transaksi ditolak oleh Midtrans.")));
          },
        },
        bahasa,
      );
    } catch (err) {
      toastGagal(t("Pembayaran gagal"), err as Error);
    } finally {
      setSnapMemuat(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4 text-primary" aria-hidden="true" />
          {t("Pembayaran")}
        </CardTitle>
        <CardDescription>
          {t("Selesaikan pembayaran paket melalui Midtrans.")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {terkirim ? (
          <Alert variant="success">
            <AlertTitle>{t("Pembayaran berhasil dikirim")}</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>
                {t(
                  "Kami sedang memeriksa status pembayaran Anda. Jika jendela pembayaran masih terbuka, tutup jendela tersebut untuk melihat status terbaru.",
                )}
              </span>
              <Button variant="outline" size="sm" onClick={() => tutupSnap()}>
                <XCircle />
                {t("Tutup jendela pembayaran")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button
            className="w-full"
            disabled={!data.snap_token || snapMemuat}
            onClick={() => void bayarSnap()}
          >
            {snapMemuat ? <LoaderCircle className="animate-spin" /> : <CreditCard />}
            {t("Bayar Sekarang")}
          </Button>
          {!data.snap_token ? (
            <Alert variant="warning">
              <AlertTitle>{t("Kanal pembayaran belum tersedia")}</AlertTitle>
              <AlertDescription>
                {t("Kanal pembayaran belum tersedia. Muat ulang halaman ini beberapa saat lagi.")}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <Button variant="outline" className="self-start" onClick={() => onSukses()}>
            <RefreshCw />
            {t("Periksa status")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Aksi pembatalan pembayaran beserta konfirmasi (memungkinkan ganti metode). */
function PanelBatalPembayaran({ orderCode }: { orderCode: string }) {
  const { t } = useBahasa();
  const router = useRouter();
  const batal = useBatalkanOrder();
  const [terbuka, setTerbuka] = React.useState(false);

  async function konfirmasi() {
    try {
      await batal.mutateAsync(orderCode);
      setTerbuka(false);
      router.push("/mitra/langganan");
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-ink-muted">
          {t(
            "Ingin memilih paket lain? Batalkan pesanan ini lalu pilih paket kembali.",
          )}
        </p>
        <Button variant="outline" disabled={batal.isPending} onClick={() => setTerbuka(true)}>
          <XCircle />
          {t("Batalkan pembayaran")}
        </Button>
      </CardContent>

      <ConfirmDialog
        terbuka={terbuka}
        onUbahTerbuka={(nilai) => {
          if (!batal.isPending) setTerbuka(nilai);
        }}
        judul={t("Batalkan pembayaran?")}
        deskripsi={t(
          "Pesanan yang dibatalkan tidak dapat dilanjutkan. Anda dapat memilih paket lagi dari halaman Paket & Langganan.",
        )}
        labelKonfirmasi={t("Batalkan pembayaran")}
        variant="danger"
        memuat={batal.isPending}
        onKonfirmasi={() => void konfirmasi()}
      />
    </Card>
  );
}

export function PembayaranOrder({ orderCode }: { orderCode: string }) {
  const { t } = useBahasa();
  const pembayaran = usePembayaranOrder(orderCode, true, 5000);

  return (
    <>
      <ScriptSnap />
      <PageHeader
        judul={t("Pembayaran Langganan")}
        deskripsi={t("Selesaikan pembayaran paket Anda melalui Midtrans.")}
        aksi={
          <>
            <Button variant="outline" asChild>
              <Link href="/mitra/langganan">
                <LogOut />
                {t("Keluar")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/mitra/transaksi/${orderCode}`}>
                <Receipt />
                {t("Lihat Transaksi")}
              </Link>
            </Button>
          </>
        }
      />

      <KontenAsync
        hasil={pembayaran}
        skeleton={<Skeleton className="h-80 rounded-card" />}
        judulGagal={t("Gagal memuat data pembayaran")}
      >
        {(data) =>
          data.is_paid ? (
            <Card className="border-success/30">
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
                    {t("Pembayaran Berhasil")}
                  </CardTitle>
                  <CardDescription>
                    {t("Kode order")} <span data-numeric>{data.order.code}</span>
                  </CardDescription>
                </div>
                <StatusBadge jenis="order" status={data.order.status} label={data.order.status_label} />
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <Alert variant="success">
                  <AlertTitle>{t("Paket Anda aktif")}</AlertTitle>
                  <AlertDescription>
                    {t("Pembayaran telah terkonfirmasi. Paket langganan")}{" "}
                    <span className="font-medium text-ink">{data.order.plan_name}</span>{" "}
                    {t("kini aktif dan kuota listing Anda sudah diperbarui. Lengkapi profil kemitraan Anda agar listing dapat tayang di katalog.")}
                  </AlertDescription>
                </Alert>

                <DaftarDeskripsi
                  kolom={2}
                  item={[
                    { label: t("Paket"), nilai: data.order.plan_name },
                    {
                      label: t("Jumlah dibayar"),
                      nilai: data.order.amount_label || formatRupiah(data.order.amount),
                    },
                    { label: t("Metode"), nilai: data.method_label || data.channel_label || "-" },
                    {
                      label: t("Dibayar pada"),
                      nilai: data.order.paid_at ? formatWib(data.order.paid_at) : "-",
                    },
                  ]}
                />

                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/mitra/profil">
                      <UserCog />
                      {t("Lengkapi Profil Mitra")}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/mitra/transaksi/${orderCode}`}>
                      <Receipt />
                      {t("Lihat Transaksi")}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/mitra/langganan">{t("Kembali ke Langganan")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              <PanelBayar
                data={data}
                onSukses={() => void pembayaran.refetch()}
              />
              <PanelBatalPembayaran orderCode={orderCode} />
            </div>
          )
        }
      </KontenAsync>
    </>
  );
}
