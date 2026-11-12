"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { KartuLangganan } from "@/components/mitra/kartu-langganan";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { FormDialog } from "@/components/shared/form-dialog";
import { CheckboxField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCheckout,
  useLanggananMitra,
  usePaketPublik,
  usePerjanjianMitra,
  useStatusOrder,
} from "@/lib/api/hooks";
import { formatAngka, formatRupiah, formatTanggalWib } from "@/lib/format";
import { bukaSnap } from "@/lib/midtrans";
import { toastGagal, toastInfo, toastSukses } from "@/lib/toast";
import type { CheckoutResponse, PlanView, SubscriptionView } from "@/types/api";

/**
 * Halaman Paket & Langganan mitra.
 *
 * Menyatukan tiga hal yang saling bergantung pada alur langganan:
 * 1. `GET /vendor/subscription` — dapat mengembalikan objek kosong (belum
 *    berlangganan) sehingga UI harus mendeteksi `id`/`is_active`.
 * 2. `GET /vendor/agreement` — wajib disetujui sebelum checkout karena
 *    backend memaksa `agree_agreement` (default `AgreementRequired = true`).
 * 3. `POST /subscriptions/checkout` — gratis langsung aktif, non-gratis
 *    memakai Snap (mode simulasi menampilkan tautan pembayaran manual).
 */
export function LanggananMitra() {
  const langganan = useLanggananMitra();
  const perjanjian = usePerjanjianMitra();
  const paket = usePaketPublik();

  const [dialogPaket, setDialogPaket] = React.useState<PlanView | null>(null);
  const [pesanan, setPesanan] = React.useState<{ response: CheckoutResponse; paket: PlanView } | null>(
    null,
  );

  const langgananAktif = Boolean(langganan.data?.id) && Boolean(langganan.data?.is_active);

  /** Menindaklanjuti respons checkout: gratis, simulasi, atau Snap nyata. */
  async function tanganiSukses(paketDipilih: PlanView, hasil: CheckoutResponse) {
    setDialogPaket(null);

    if (hasil.free_active) {
      toastSukses("Paket aktif", `Paket ${paketDipilih.name} langsung aktif tanpa biaya.`);
      void langganan.refetch();
      void perjanjian.refetch();
      return;
    }

    setPesanan({ response: hasil, paket: paketDipilih });
    void langganan.refetch();

    if (hasil.simulated) {
      toastInfo(
        "Mode simulasi",
        "Backend mengembalikan transaksi simulasi. Selesaikan lewat tautan pembayaran di bawah.",
      );
      return;
    }

    if (!hasil.snap_token) {
      toastGagal(
        "Token pembayaran tidak tersedia",
        new Error("Backend tidak mengembalikan Snap Token."),
      );
      return;
    }

    try {
      await bukaSnap(hasil.snap_token, {
        onSuccess: () => {
          toastSukses("Pembayaran berhasil", "Paket langganan Anda sedang diaktifkan.");
          void langganan.refetch();
        },
        onPending: () => toastInfo("Pembayaran menunggu penyelesaian", "Selesaikan sesuai instruksi."),
        onError: () => toastGagal("Pembayaran gagal", new Error("Transaksi ditolak oleh Midtrans.")),
      });
    } catch (error) {
      toastGagal("Gagal membuka halaman pembayaran", error);
    }
  }

  return (
    <>
      <PageHeader
        judul="Paket & Langganan"
        deskripsi="Kelola paket aktif dan pilih paket baru untuk menayangkan lebih banyak properti."
      />

      <KontenAsync
        hasil={langganan}
        skeleton={<Skeleton className="h-56 rounded-card" />}
        judulGagal="Gagal memuat langganan"
      >
        {(data) =>
          Boolean(data.id) && data.is_active ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <KartuLangganan langganan={data} className="lg:col-span-1" />
              <KartuRingkasanKuota langganan={data} />
            </div>
          ) : (
            <Alert variant="info">
              <AlertTitle>Belum berlangganan</AlertTitle>
              <AlertDescription>
                Anda belum memiliki paket aktif. Pilih salah satu paket di bawah untuk mulai
                menayangkan properti.
              </AlertDescription>
            </Alert>
          )
        }
      </KontenAsync>

      {pesanan ? (
        <KartuStatusPesanan
          key={pesanan.response.order.code}
          awal={pesanan.response}
          paket={pesanan.paket}
          onSelesai={() => {
            void langganan.refetch();
            setPesanan(null);
          }}
        />
      ) : null}

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Perjanjian Kemitraan</CardTitle>
            <CardDescription>
              Perjanjian wajib disetujui sebelum melakukan pembayaran paket.
            </CardDescription>
          </div>
          {perjanjian.data?.accepted ? (
            <Badge variant="success">Disetujui</Badge>
          ) : (
            <Badge variant="warning">Belum disetujui</Badge>
          )}
        </CardHeader>
        <CardContent>
          <KontenAsync
            hasil={perjanjian}
            skeleton={<Skeleton className="h-20 rounded-field" />}
            judulGagal="Gagal memuat perjanjian"
          >
            {(data) => (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
                    {data.agreement.title}
                  </span>
                  <Badge variant="neutral">Versi {data.agreement.version}</Badge>
                </div>
                <p className="max-h-40 overflow-y-auto rounded-field border border-line bg-hover/50 p-4 text-[13px] whitespace-pre-line text-ink-muted">
                  {data.agreement.content}
                </p>
                {data.agreement.checklist.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-ink">Poin yang disetujui</span>
                    <ul className="flex flex-col gap-1.5 text-[13px] text-ink-muted">
                      {data.agreement.checklist.map((poin, indeks) => (
                        <li key={indeks} className="flex items-start gap-2">
                          <CheckCircle2
                            className="mt-0.5 size-4 shrink-0 text-success"
                            aria-hidden="true"
                          />
                          {poin}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="text-xs text-ink-muted">
                  {data.accepted && data.acceptance
                    ? `Disetujui pada ${formatTanggalWib(data.acceptance.accepted_at)} WIB.`
                    : "Perjanjian akan diminta saat Anda pertama kali masuk dashboard mitra."}
                </p>
              </div>
            )}
          </KontenAsync>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-ink">Pilih Paket</h3>
        <KontenAsync
          hasil={paket}
          skeleton={
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, indeks) => (
                <Skeleton key={indeks} className="h-80 rounded-card" />
              ))}
            </div>
          }
          judulGagal="Gagal memuat daftar paket"
        >
          {(daftar) => (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {daftar.map((item) => (
                <KartuPaket
                  key={item.id}
                  paket={item}
                  aktif={langgananAktif && langganan.data?.plan_id === item.id}
                  onPilih={() => setDialogPaket(item)}
                />
              ))}
            </div>
          )}
        </KontenAsync>
      </div>

      {dialogPaket ? (
        <DialogCheckout
          key={dialogPaket.id}
          paket={dialogPaket}
          agreementId={perjanjian.data?.agreement.id}
          sudahDisetujui={Boolean(perjanjian.data?.accepted)}
          onTutup={() => setDialogPaket(null)}
          onSukses={tanganiSukses}
        />
      ) : null}
    </>
  );
}

/** Ringkasan kuota listing paket aktif. */
function KartuRingkasanKuota({ langganan }: { langganan: SubscriptionView }) {
  const kuota = langganan.listing_quota < 0 ? -1 : langganan.listing_quota;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Ringkasan Paket</CardTitle>
        <CardDescription>Rincian kuota dan masa berlaku paket aktif Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <DaftarDeskripsi
          kolom={2}
          item={[
            { label: "Nama paket", nilai: langganan.plan_name },
            { label: "Mulai", nilai: formatTanggalWib(langganan.starts_at) },
            { label: "Berakhir", nilai: formatTanggalWib(langganan.ends_at) },
            { label: "Sisa hari", nilai: `${formatAngka(langganan.days_remaining)} hari` },
            { label: "Listing terpakai", nilai: formatAngka(langganan.listings_used) },
            {
              label: "Kuota",
              nilai: kuota > 0 ? `${formatAngka(kuota)} listing` : "Tanpa batas",
            },
            { label: "Kode order terakhir", nilai: langganan.last_order_code ?? "-", penuh: true },
          ]}
        />
      </CardContent>
    </Card>
  );
}

/** Kartu pilihan paket. */
function KartuPaket({
  paket,
  aktif,
  onPilih,
}: {
  paket: PlanView;
  aktif: boolean;
  onPilih: () => void;
}) {
  return (
    <Card className="gap-5">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>{paket.name}</CardTitle>
          <CardDescription>{paket.description || "Paket langganan mitra."}</CardDescription>
        </div>
        {aktif ? (
          <Badge variant="accent">Paket Anda</Badge>
        ) : paket.is_free ? (
          <Badge variant="success">Gratis</Badge>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span data-numeric className="text-2xl font-semibold tracking-tight text-ink">
            {paket.is_free ? "Gratis" : paket.price_label || formatRupiah(paket.price)}
          </span>
          <span className="text-[13px] text-ink-muted">
            {paket.duration_days > 0 ? `${formatAngka(paket.duration_days)} hari` : "Tanpa batas"}{" "}
            &middot;{" "}
            {paket.is_unlimited ? "Kuota tanpa batas" : `${formatAngka(paket.listing_quota)} listing`}
          </span>
        </div>

        {paket.features.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {paket.features.map((fitur) => (
              <li key={fitur} className="flex items-start gap-2 text-[13px] text-ink-muted">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                {fitur}
              </li>
            ))}
          </ul>
        ) : null}

        <Button
          className="mt-auto w-full"
          variant={aktif ? "outline" : "primary"}
          disabled={aktif || !paket.is_active}
          onClick={onPilih}
        >
          {aktif ? "Paket aktif" : paket.is_active ? "Pilih paket" : "Tidak tersedia"}
        </Button>
      </CardContent>
    </Card>
  );
}

const skemaCheckout = z.object({
  agree_agreement: z
    .boolean()
    .refine((nilai) => nilai === true, "Anda harus menyetujui perjanjian kemitraan terlebih dahulu"),
});

type NilaiCheckout = z.infer<typeof skemaCheckout>;

/** Dialog konfirmasi paket + persetujuan perjanjian sebelum checkout. */
function DialogCheckout({
  paket,
  agreementId,
  sudahDisetujui,
  onTutup,
  onSukses,
}: {
  paket: PlanView;
  agreementId?: string;
  sudahDisetujui: boolean;
  onTutup: () => void;
  onSukses: (paket: PlanView, hasil: CheckoutResponse) => void;
}) {
  const checkout = useCheckout();
  const form = useForm<NilaiCheckout>({
    resolver: zodResolver(skemaCheckout),
    /* Paket Gratis aktif otomatis; perjanjian ditandatangani lewat modal saat
       mitra pertama kali masuk dashboard, bukan di dialog ini. */
    defaultValues: { agree_agreement: paket.is_free ? true : sudahDisetujui },
  });

  async function kirim(nilai: NilaiCheckout) {
    try {
      const hasil = await checkout.mutateAsync({
        package_slug: paket.slug,
        agree_agreement: nilai.agree_agreement,
        agreement_id: agreementId,
      });
      onSukses(paket, hasil);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <FormDialog
      terbuka
      onUbahTerbuka={(nilai) => {
        if (!nilai) onTutup();
      }}
      judul={`Konfirmasi paket ${paket.name}`}
      deskripsi={
        paket.is_free
          ? "Paket gratis akan langsung aktif setelah dikonfirmasi."
          : "Anda akan diarahkan ke halaman pembayaran Midtrans."
      }
      labelKirim={paket.is_free ? "Aktifkan paket" : "Lanjut ke pembayaran"}
      memuat={checkout.isPending}
      onSubmit={form.handleSubmit(kirim)}
    >
      <div className="flex flex-col gap-5">
        <DaftarDeskripsi
          kolom={1}
          item={[
            { label: "Paket", nilai: paket.name },
            {
              label: "Durasi",
              nilai: paket.duration_days > 0 ? `${formatAngka(paket.duration_days)} hari` : "Tanpa batas",
            },
            {
              label: "Kuota listing",
              nilai: paket.is_unlimited ? "Tanpa batas" : `${formatAngka(paket.listing_quota)} listing`,
            },
            {
              label: "Biaya",
              nilai: paket.is_free ? "Gratis" : paket.price_label || formatRupiah(paket.price),
            },
          ]}
        />

        {paket.is_free ? (
          <p className="text-xs text-ink-muted">
            Perjanjian kemitraan akan diminta saat Anda pertama kali masuk dashboard mitra.
          </p>
        ) : (
          <CheckboxField
            control={form.control}
            name="agree_agreement"
            label="Saya menyetujui perjanjian kemitraan ENM Property."
            deskripsi={
              sudahDisetujui
                ? "Persetujuan Anda sebelumnya tetap berlaku."
                : "Perjanjian akan tercatat saat Anda melanjutkan."
            }
          />
        )}
      </div>
    </FormDialog>
  );
}

/** Panel status pesanan langganan beserta tindakan lanjutan. */
function KartuStatusPesanan({
  awal,
  paket,
  onSelesai,
}: {
  awal: CheckoutResponse;
  paket: PlanView;
  onSelesai: () => void;
}) {
  const status = useStatusOrder(awal.order.code, true);
  const order = status.data?.order ?? awal.order;
  const lunas = order.status === "paid";

  return (
    <Card className="border-secondary/30">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Status Pesanan
          </CardTitle>
          <CardDescription>
            Kode order <span data-numeric>{order.code}</span>
          </CardDescription>
        </div>
        <StatusBadge jenis="order" status={order.status} label={order.status_label} />
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {awal.simulated ? (
          <Alert variant="warning">
            <AlertTitle>Mode simulasi</AlertTitle>
            <AlertDescription>
              Backend menjalankan transaksi dalam mode simulasi. Gunakan tautan pembayaran di bawah
              untuk menyelesaikan pesanan.
            </AlertDescription>
          </Alert>
        ) : null}

        <DaftarDeskripsi
          kolom={2}
          item={[
            { label: "Paket", nilai: paket.name },
            { label: "Jumlah", nilai: order.amount_label || formatRupiah(order.amount) },
            { label: "Dibuat", nilai: formatTanggalWib(order.created_at) },
            { label: "Kedaluwarsa", nilai: formatTanggalWib(order.expires_at) },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          {awal.snap_redirect_url ? (
            <Button
              variant="outline"
              onClick={() => window.open(awal.snap_redirect_url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink />
              Buka halaman pembayaran
            </Button>
          ) : null}

          <Button variant="outline" disabled={status.isFetching} onClick={() => void status.refetch()}>
            {status.isFetching ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
            Periksa status
          </Button>

          {lunas ? (
            <Button onClick={onSelesai}>
              <CheckCircle2 />
              Selesai
            </Button>
          ) : null}
        </div>

        {lunas ? (
          <p className="text-[13px] text-ink-muted">
            Pembayaran berhasil. Paket <span className="font-semibold text-ink">{paket.name}</span>{" "}
            kini aktif dan kuota listing Anda telah diperbarui.
          </p>
        ) : (
          <p className="flex items-center gap-2 text-[13px] text-ink-muted">
            <Package className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            Periksa status secara berkala hingga pembayaran terkonfirmasi.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
