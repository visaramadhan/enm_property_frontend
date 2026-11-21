"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { useBahasa } from "@/components/providers/bahasa-provider";
import { CeklisPersetujuan } from "@/components/shared/ceklis-perjanjian";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { FormDialog } from "@/components/shared/form-dialog";
import { CheckboxField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { ScriptSnap } from "@/components/shared/script-snap";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCheckout,
  useLanggananMitra,
  usePaketPublik,
  usePerjanjianMitra,
  useStatusOrder,
} from "@/lib/api/hooks";
import { labelFiturPaket } from "@/lib/enum";
import { formatAngka, formatRupiah, formatTanggalWib } from "@/lib/format";
import { bukaSnap, tutupSnap } from "@/lib/midtrans";
import { toastGagal, toastInfo, toastSukses } from "@/lib/toast";
import type { CheckoutResponse, PlanView, SubscriptionView, VendorAgreementResponse } from "@/types/api";

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
  const { t, bahasa } = useBahasa();
  const router = useRouter();
  const langganan = useLanggananMitra();
  const perjanjian = usePerjanjianMitra();
  const paket = usePaketPublik();

  const [dialogPaket, setDialogPaket] = React.useState<PlanView | null>(null);
  const [pesanan, setPesanan] = React.useState<{ response: CheckoutResponse; paket: PlanView } | null>(
    null,
  );

  const langgananAktif = Boolean(langganan.data?.id) && Boolean(langganan.data?.is_active);

  /* Section perjanjian hanya ditampilkan bila paket aktif adalah paket Gratis. */
  const paketAktifGratis = Boolean(
    langganan.data?.plan_id &&
      paket.data?.find((item) => item.id === langganan.data?.plan_id)?.is_free,
  );

  /** Menindaklanjuti respons checkout: gratis, simulasi, atau Snap nyata. */
  async function tanganiSukses(paketDipilih: PlanView, hasil: CheckoutResponse) {
    setDialogPaket(null);
    void langganan.refetch();

    if (hasil.free_active) {
      toastSukses(
        t("Paket aktif"),
        t("Paket {nama} langsung aktif tanpa biaya.", { nama: paketDipilih.name }),
      );
      void perjanjian.refetch();
      return;
    }

    /* Order pending yang dipakai ulang: jangan buka Snap baru, cukup
       arahkan mitra ke halaman pembayaran pesanan yang belum selesai. */
    if (hasil.reused) {
      toastInfo(
        t("Melanjutkan pembayaran"),
        t("Anda dialihkan ke halaman pembayaran pesanan yang belum selesai."),
      );
      router.push(`/pembayaran/${hasil.order_code ?? hasil.order.code}`);
      return;
    }

    setPesanan({ response: hasil, paket: paketDipilih });

    if (hasil.simulated) {
      toastInfo(
        t("Mode simulasi"),
        t("Backend mengembalikan transaksi simulasi. Selesaikan lewat tautan pembayaran di bawah."),
      );
      return;
    }

    if (!hasil.snap_token) {
      toastGagal(
        t("Token pembayaran tidak tersedia"),
        new Error(t("Backend tidak mengembalikan Snap Token.")),
      );
      return;
    }

    const kodeOrder = hasil.order_code ?? hasil.order.code;

    /* Popup Snap memerlukan koneksi ke Midtrans. Bila popup gagal dibuka
       (mis. gangguan koneksi ke Midtrans), mitra tidak dibiarkan buntu:
       arahkan ke halaman pembayaran QRIS/VA yang memakai Core API sehingga
       pembayaran tetap dapat diselesaikan. */
    const alihkanKePembayaran = () => {
      toastInfo(
        t("Melanjutkan pembayaran"),
        t("Popup pembayaran tidak dapat dibuka. Anda dialihkan ke halaman pembayaran QRIS/VA."),
      );
      router.push(`/pembayaran/${kodeOrder}`);
    };

    try {
      await bukaSnap(hasil.snap_token, {
        onSuccess: () => {
          /* Tutup popup lalu periksa status terbaru agar kartu status pesanan
             menampilkan hasil pembayaran tanpa menunggu mitra menutup jendela. */
          tutupSnap();
          toastSukses(t("Pembayaran berhasil"), t("Paket langganan Anda sedang diaktifkan."));
          void langganan.refetch();
        },
        onPending: () =>
          toastInfo(t("Pembayaran menunggu penyelesaian"), t("Selesaikan sesuai instruksi.")),
        onError: alihkanKePembayaran,
      }, bahasa);
    } catch {
      alihkanKePembayaran();
    }
  }

  return (
    <>
      <ScriptSnap />
      <PageHeader
        judul={t("Paket & Langganan")}
        deskripsi={t("Kelola paket aktif dan pilih paket baru untuk menayangkan lebih banyak properti.")}
      />

      <KontenAsync
        hasil={langganan}
        skeleton={<Skeleton className="h-56 rounded-card" />}
        judulGagal={t("Gagal memuat langganan")}
      >
        {(data) =>
          Boolean(data.id) && data.is_active ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <KartuLangganan langganan={data} className="lg:col-span-1" tampilkanKelola={false} />
              <KartuRingkasanKuota langganan={data} />
            </div>
          ) : (
            <Alert variant="info">
              <AlertTitle>{t("Belum berlangganan")}</AlertTitle>
              <AlertDescription>
                {t(
                  "Anda belum memiliki paket aktif. Pilih salah satu paket di bawah untuk mulai menayangkan properti.",
                )}
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

      {paketAktifGratis ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle>{t("Perjanjian Kemitraan")}</CardTitle>
              <CardDescription>
                {t("Perjanjian wajib disetujui sebelum melakukan pembayaran paket.")}
              </CardDescription>
            </div>
            {perjanjian.data?.accepted ? (
              <Badge variant="success">{t("Disetujui")}</Badge>
            ) : (
              <Badge variant="warning">{t("Belum disetujui")}</Badge>
            )}
          </CardHeader>
          <CardContent>
            <KontenAsync
              hasil={perjanjian}
              skeleton={<Skeleton className="h-20 rounded-field" />}
              judulGagal={t("Gagal memuat perjanjian")}
            >
              {(data) => (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
                      {t(data.agreement.title)}
                    </span>
                    <Badge variant="neutral">
                      {t("Versi {versi}", { versi: data.agreement.version })}
                    </Badge>
                  </div>
                  <p className="max-h-40 overflow-y-auto rounded-field border border-line bg-hover/50 p-4 text-[13px] whitespace-pre-line text-ink-muted">
                    {data.agreement.content}
                  </p>
                  {data.agreement.checklist.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-semibold text-ink">
                        {t("Poin yang disetujui")}
                      </span>
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
                      ? t("Disetujui pada {tgl} WIB.", {
                          tgl: formatTanggalWib(data.acceptance.accepted_at),
                        })
                      : t("Perjanjian akan diminta saat Anda pertama kali masuk dashboard mitra.")}
                  </p>
                </div>
              )}
            </KontenAsync>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-ink">{t("Pilih Paket")}</h3>
        <KontenAsync
          hasil={paket}
          skeleton={
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, indeks) => (
                <Skeleton key={indeks} className="h-80 rounded-card" />
              ))}
            </div>
          }
          judulGagal={t("Gagal memuat daftar paket")}
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
          perjanjian={perjanjian.data}
          onTutup={() => setDialogPaket(null)}
          onSukses={tanganiSukses}
        />
      ) : null}
    </>
  );
}

/** Ringkasan kuota listing paket aktif. */
function KartuRingkasanKuota({ langganan }: { langganan: SubscriptionView }) {
  const { t } = useBahasa();
  const kuota = langganan.listing_quota < 0 ? -1 : langganan.listing_quota;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("Ringkasan Paket")}</CardTitle>
        <CardDescription>{t("Rincian kuota dan masa berlaku paket aktif Anda.")}</CardDescription>
      </CardHeader>
      <CardContent>
        <DaftarDeskripsi
          kolom={2}
          item={[
            { label: t("Nama paket"), nilai: langganan.plan_name },
            { label: t("Mulai"), nilai: formatTanggalWib(langganan.starts_at) },
            { label: t("Berakhir"), nilai: formatTanggalWib(langganan.ends_at) },
            {
              label: t("Sisa hari"),
              nilai: t("{n} hari", { n: formatAngka(langganan.days_remaining) }),
            },
            { label: t("Listing terpakai"), nilai: formatAngka(langganan.listings_used) },
            {
              label: t("Kuota"),
              nilai: kuota > 0 ? t("{n} listing", { n: formatAngka(kuota) }) : t("Tanpa batas"),
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
  const { t } = useBahasa();

  return (
    <Card className="gap-5">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>{paket.name}</CardTitle>
          <CardDescription>
            {paket.description ? t(paket.description) : t("Paket langganan mitra.")}
          </CardDescription>
        </div>
        {aktif ? (
          <Badge variant="accent">{t("Paket Anda")}</Badge>
        ) : paket.is_free ? (
          <Badge variant="success">{t("Gratis")}</Badge>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span data-numeric className="text-2xl font-semibold tracking-tight text-ink">
            {paket.is_free ? t("Gratis") : paket.price_label || formatRupiah(paket.price)}
          </span>
          <span className="text-[13px] text-ink-muted">
            {paket.duration_days > 0
              ? t("{n} hari", { n: formatAngka(paket.duration_days) })
              : t("Tanpa batas")}{" "}
            &middot;{" "}
            {paket.is_unlimited
              ? t("Kuota tanpa batas")
              : t("{n} listing", { n: formatAngka(paket.listing_quota) })}
          </span>
        </div>

        {paket.features.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {paket.features.map((fitur) => (
              <li key={fitur} className="flex items-start gap-2 text-[13px] text-ink-muted">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                {labelFiturPaket(fitur, t)}
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
          {aktif ? t("Paket aktif") : paket.is_active ? t("Pilih paket") : t("Tidak tersedia")}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Skema konfirmasi checkout.
 *
 * Dibuat lewat fungsi agar pesan validasi memakai penerjemah `t` dari komponen
 * (skema di level modul tidak punya akses ke konteks bahasa).
 */
function buatSkemaCheckout(t: (teks: string) => string) {
  return z.object({
    agree_agreement: z
      .boolean()
      .refine((nilai) => nilai === true, t("Anda harus menyetujui perjanjian kemitraan terlebih dahulu")),
  });
}

type NilaiCheckout = z.infer<ReturnType<typeof buatSkemaCheckout>>;

/**
 * Dialog konfirmasi paket + persetujuan perjanjian sebelum checkout.
 *
 * Untuk paket Gratis, dialog menampilkan isi "Perjanjian Kemitraan" beserta
 * poin ceklis yang wajib dicentang seluruhnya sebelum paket dapat diaktifkan.
 */
function DialogCheckout({
  paket,
  perjanjian,
  onTutup,
  onSukses,
}: {
  paket: PlanView;
  perjanjian?: VendorAgreementResponse;
  onTutup: () => void;
  onSukses: (paket: PlanView, hasil: CheckoutResponse) => void;
}) {
  const { t } = useBahasa();
  const checkout = useCheckout();

  const gratis = paket.is_free;
  const sudahDisetujui = Boolean(perjanjian?.accepted);
  const poin = perjanjian?.agreement.checklist ?? [];

  const skemaCheckout = React.useMemo(() => buatSkemaCheckout(t), [t]);
  const form = useForm<NilaiCheckout>({
    resolver: zodResolver(skemaCheckout),
    defaultValues: { agree_agreement: sudahDisetujui },
  });

  /* Poin perjanjian paket Gratis dicentang satu per satu oleh mitra. */
  const [tercentang, setTercentang] = React.useState<boolean[]>(() => poin.map(() => false));
  const [setujuUmum, setSetujuUmum] = React.useState(false);
  const semuaDisetujui = poin.length > 0 ? tercentang.every(Boolean) : setujuUmum;

  /* Sinkronkan hasil ceklis ke nilai formulir agar validasi & pengiriman konsisten. */
  React.useEffect(() => {
    if (gratis) form.setValue("agree_agreement", semuaDisetujui);
  }, [gratis, semuaDisetujui, form]);

  function ubahCentang(indeks: number, terisi: boolean) {
    setTercentang((sebelumnya) =>
      sebelumnya.map((nilai, posisi) => (posisi === indeks ? terisi : nilai)),
    );
  }

  async function kirim(nilai: NilaiCheckout) {
    try {
      const hasil = await checkout.mutateAsync({
        package_slug: paket.slug,
        agree_agreement: nilai.agree_agreement,
        agreement_id: perjanjian?.agreement.id,
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
      judul={
        gratis
          ? t("Perjanjian Kemitraan")
          : t("Konfirmasi paket {nama}", { nama: paket.name })
      }
      deskripsi={
        gratis
          ? t("Perjanjian kemitraan wajib disetujui sebelum mengaktifkan paket Gratis.")
          : t("Anda akan diarahkan ke halaman pembayaran Midtrans.")
      }
      labelKirim={gratis ? t("Aktifkan paket") : t("Lanjut ke pembayaran")}
      memuat={checkout.isPending}
      onSubmit={form.handleSubmit(kirim)}
    >
      <div className="flex flex-col gap-5">
        <DaftarDeskripsi
          kolom={1}
          item={[
            { label: t("Paket"), nilai: paket.name },
            {
              label: t("Durasi"),
              nilai:
                paket.duration_days > 0
                  ? t("{n} hari", { n: formatAngka(paket.duration_days) })
                  : t("Tanpa batas"),
            },
            {
              label: t("Kuota listing"),
              nilai: paket.is_unlimited
                ? t("Tanpa batas")
                : t("{n} listing", { n: formatAngka(paket.listing_quota) }),
            },
            {
              label: t("Biaya"),
              nilai: paket.is_free ? t("Gratis") : paket.price_label || formatRupiah(paket.price),
            },
          ]}
        />

        {gratis ? (
          perjanjian ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium text-ink">{t(perjanjian.agreement.title)}</span>
                <Badge variant="neutral">
                  {t("Versi {versi}", { versi: perjanjian.agreement.version })}
                </Badge>
              </div>
              <p className="max-h-40 overflow-y-auto rounded-field border border-line bg-hover/50 p-4 text-[13px] whitespace-pre-line text-ink-muted">
                {perjanjian.agreement.content}
              </p>
              {poin.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <span className="text-[13px] font-semibold text-ink">
                    {t("Centang setiap poin berikut untuk melanjutkan")}
                  </span>
                  <CeklisPersetujuan
                    poin={poin}
                    nilai={tercentang}
                    onUbah={ubahCentang}
                    disabled={checkout.isPending}
                    idDasar={`ceklis-checkout-${paket.id}`}
                  />
                </div>
              ) : (
                <label className="flex items-start gap-2.5 text-[13px] text-ink">
                  <Checkbox
                    className="mt-0.5"
                    checked={setujuUmum}
                    disabled={checkout.isPending}
                    onCheckedChange={(nilai) => setSetujuUmum(nilai === true)}
                  />
                  <span>{t("Saya menyetujui perjanjian kemitraan ENM Property.")}</span>
                </label>
              )}
            </div>
          ) : (
            <Skeleton className="h-40 rounded-field" />
          )
        ) : (
          <CheckboxField
            control={form.control}
            name="agree_agreement"
            label={t("Saya menyetujui perjanjian kemitraan ENM Property.")}
            deskripsi={
              sudahDisetujui
                ? t("Persetujuan Anda sebelumnya tetap berlaku.")
                : t("Perjanjian akan tercatat saat Anda melanjutkan.")
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
  const { t } = useBahasa();
  /* Polling otomatis agar status terbaru tampil begitu Snap melaporkan
     pembayaran berhasil (berhenti sendiri saat status sudah final). */
  const status = useStatusOrder(awal.order.code, true, 5000);
  const order = status.data?.order ?? awal.order;
  const lunas = order.status === "paid";

  return (
    <Card className="border-secondary/30">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            {t("Status Pesanan")}
          </CardTitle>
          <CardDescription>{t("Kode order {kode}", { kode: order.code })}</CardDescription>
        </div>
        <StatusBadge jenis="order" status={order.status} label={order.status_label} />
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {awal.simulated ? (
          <Alert variant="warning">
            <AlertTitle>{t("Mode simulasi")}</AlertTitle>
            <AlertDescription>
              {t(
                "Backend menjalankan transaksi dalam mode simulasi. Gunakan tautan pembayaran di bawah untuk menyelesaikan pesanan.",
              )}
            </AlertDescription>
          </Alert>
        ) : null}

        <DaftarDeskripsi
          kolom={2}
          item={[
            { label: t("Paket"), nilai: paket.name },
            { label: t("Jumlah"), nilai: order.amount_label || formatRupiah(order.amount) },
            { label: t("Dibuat"), nilai: formatTanggalWib(order.created_at) },
            { label: t("Kedaluwarsa"), nilai: formatTanggalWib(order.expires_at) },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          {awal.snap_redirect_url ? (
            <Button
              variant="outline"
              onClick={() => window.open(awal.snap_redirect_url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink />
              {t("Buka halaman pembayaran")}
            </Button>
          ) : null}

          <Button variant="outline" disabled={status.isFetching} onClick={() => void status.refetch()}>
            {status.isFetching ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
            {t("Periksa status")}
          </Button>

          {lunas ? (
            <Button onClick={onSelesai}>
              <CheckCircle2 />
              {t("Selesai")}
            </Button>
          ) : null}
        </div>

        {lunas ? (
          <p className="text-[13px] text-ink-muted">
            {t(
              "Pembayaran berhasil. Paket {nama} kini aktif dan kuota listing Anda telah diperbarui.",
              { nama: paket.name },
            )}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-[13px] text-ink-muted">
            <Package className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            {t("Periksa status secara berkala hingga pembayaran terkonfirmasi.")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
