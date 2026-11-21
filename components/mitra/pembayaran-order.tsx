"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Download,
  LoaderCircle,
  LogOut,
  QrCode,
  Receipt,
  RefreshCw,
  UserCog,
  XCircle,
} from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { KodeQr } from "@/components/shared/kode-qr";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { ScriptSnap } from "@/components/shared/script-snap";
import { StatusBadge } from "@/components/shared/status-badge";
import { TombolSalin } from "@/components/shared/tombol-salin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useBatalkanOrder, useChargeLangganan, usePembayaranOrder } from "@/lib/api/hooks";
import { formatRupiah, formatWib } from "@/lib/format";
import { bukaSnap, tutupSnap } from "@/lib/midtrans";
import { toastGagal, toastInfo, toastSukses } from "@/lib/toast";
import { unduhBerkas } from "@/lib/unduh";
import type { PaymentChannel, PaymentView } from "@/types/api";

/**
 * Halaman pembayaran satu order langganan (item 8).
 *
 * Instruksi pembayaran dibuat langsung di halaman ini memakai Midtrans Core API
 * (QRIS/VA) sehingga kode QR tampil "di depan" dan dapat diunduh tanpa
 * berpindah halaman. Popup Snap tetap disediakan sebagai kanal cadangan bila
 * QRIS/VA belum diaktifkan di dashboard Midtrans. Status pembayaran dipantau
 * otomatis (polling) sehingga halaman berubah sendiri begitu lunas.
 */

/** Kanal pembayaran yang dapat dibuat langsung pada halaman ini. */
const KANAL: { nilai: PaymentChannel; label: string }[] = [
  { nilai: "qris", label: "QRIS — semua e-wallet & m-banking" },
  { nilai: "bca", label: "Virtual Account BCA" },
  { nilai: "bni", label: "Virtual Account BNI" },
  { nilai: "bri", label: "Virtual Account BRI" },
  { nilai: "permata", label: "Virtual Account Permata" },
];

/** Blok kode QRIS beserta aksi salin dan unduh. */
function PanelQris({ qr }: { qr: PaymentView }) {
  const { t } = useBahasa();
  const [gambar, setGambar] = React.useState("");

  /* Unduh QR sebagai berkas tanpa memindahkan halaman agar kode tetap tampil. */
  async function unduh() {
    try {
      const blob = await (await fetch(gambar)).blob();
      unduhBerkas(blob, `qris-${qr.order.code}.png`);
    } catch (err) {
      toastGagal(t("Gagal mengunduh kode QRIS"), err as Error);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex size-56 items-center justify-center rounded-card border border-line bg-white p-3">
        {qr.qr_string ? (
          <KodeQr
            nilai={qr.qr_string}
            ukuran={512}
            kelas="size-full object-contain"
            onGambar={setGambar}
          />
        ) : (
          /* Jaring pengaman bila gateway hanya mengirim URL gambar QR. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={qr.qr_url}
            alt={t("Kode QRIS pembayaran")}
            className="size-full object-contain"
          />
        )}
        {qr.qr_string && !gambar ? <Skeleton className="absolute inset-3 rounded-field" /> : null}
      </div>

      <p className="max-w-md text-center text-[13px] text-ink-muted">
        {t("Pindai kode QR di atas memakai aplikasi e-wallet atau m-banking yang mendukung QRIS.")}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {qr.qr_string ? (
          <TombolSalin
            variant="outline"
            teks={qr.qr_string}
            label={t("Salin kode QRIS")}
            judulSukses={t("Kode QRIS tersalin")}
          />
        ) : null}
        {gambar ? (
          <Button variant="outline" onClick={() => void unduh()}>
            <Download />
            {t("Unduh kode QRIS")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Panel pembayaran: instruksi QRIS/VA, pembuatan kode, dan kanal cadangan. */
function PanelBayar({
  orderCode,
  data,
  onSukses,
}: {
  orderCode: string;
  data: PaymentView;
  onSukses: () => void;
}) {
  const { t, bahasa } = useBahasa();
  const charge = useChargeLangganan();
  const [kanal, setKanal] = React.useState<PaymentChannel>("qris");
  const [snapMemuat, setSnapMemuat] = React.useState(false);
  /* Diisi setelah Snap melaporkan pembayaran berhasil sehingga panel menampilkan
     pemberitahuan untuk menutup jendela pembayaran sekaligus memicu pengecekan
     status terbaru secara otomatis. */
  const [terkirim, setTerkirim] = React.useState(false);

  const adaInstruksi = Boolean(data.qr_string || data.qr_url || data.number);
  const total = data.order.amount_label || formatRupiah(data.order.amount);

  /** Membuat kode QRIS/VA agar instruksi pembayaran muncul di halaman ini. */
  async function buatKode() {
    try {
      await charge.mutateAsync({ orderCode, body: { method: kanal } });
      toastSukses(
        t("Kode pembayaran dibuat"),
        t("Selesaikan pembayaran sesuai instruksi di bawah."),
      );
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  /* Popup Snap tetap disediakan sebagai kanal cadangan (mis. bila QRIS/VA
     belum diaktifkan di Midtrans). */
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
          {adaInstruksi
            ? t("Selesaikan pembayaran paket melalui Midtrans.")
            : t("Tentukan cara pembayaran, lalu buat kode agar instruksi pembayaran muncul di halaman ini.")}
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

        {adaInstruksi ? (
          <>
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-ink">{t("Instruksi Pembayaran")}</h3>

              {data.qr_string || data.qr_url ? (
                <PanelQris qr={data} />
              ) : (
                <DaftarDeskripsi
                  kolom={1}
                  item={[
                    { label: t("Bank"), nilai: data.channel_label || data.method_label || "-" },
                    { label: t("Nomor Virtual Account"), nilai: data.number ?? "-" },
                  ]}
                />
              )}

              <DaftarDeskripsi
                kolom={1}
                item={[
                  { label: t("Total pembayaran"), nilai: total },
                  {
                    label: t("Bayar sebelum"),
                    nilai: data.expires_at ? `${formatWib(data.expires_at)} WIB` : "-",
                  },
                ]}
              />

              {data.number ? (
                <TombolSalin
                  className="self-start"
                  variant="outline"
                  teks={data.number}
                  label={t("Salin")}
                  judulSukses={t("Nomor VA tersalin")}
                />
              ) : null}
            </div>

            <p className="text-[13px] text-ink-muted">
              {t("Selesaikan pembayaran sebelum")}{" "}
              {data.expires_at ? formatWib(data.expires_at) : "-"}{" "}
              {t("WIB. Halaman ini akan diperbarui otomatis setelah pembayaran terkonfirmasi.")}
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-ink">{t("Pilih Metode Pembayaran")}</h3>

            <Select value={kanal} onValueChange={(nilai) => setKanal(nilai as PaymentChannel)}>
              <SelectTrigger aria-label={t("Pilih metode pembayaran")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KANAL.map((item) => (
                  <SelectItem key={item.nilai} value={item.nilai}>
                    {t(item.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button disabled={charge.isPending} onClick={() => void buatKode()}>
              {charge.isPending ? <LoaderCircle className="animate-spin" /> : <QrCode />}
              {t("Buat kode pembayaran")}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div>
            <Button variant="outline" onClick={() => onSukses()}>
              <RefreshCw />
              {t("Periksa status")}
            </Button>
          </div>

          {data.snap_token ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-[12px] text-ink-muted">
                {t("Popup pembayaran Midtrans tetap tersedia bila kanal QRIS/VA belum aktif.")}
              </p>
              <Button variant="outline" disabled={snapMemuat} onClick={() => void bayarSnap()}>
                {snapMemuat ? <LoaderCircle className="animate-spin" /> : <CreditCard />}
                {t("Bayar lewat popup Midtrans")}
              </Button>
            </div>
          ) : null}
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
            "Ingin mengganti metode pembayaran atau memilih paket lain? Batalkan pesanan ini lalu pilih kembali.",
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
          "Pesanan yang dibatalkan tidak dapat dilanjutkan. Anda dapat memilih paket dan metode pembayaran lagi dari halaman Paket & Langganan.",
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
                orderCode={orderCode}
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
