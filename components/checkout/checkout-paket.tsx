"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, LogIn, ShieldCheck, Sparkles, Store, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { CheckboxField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { ScriptSnap } from "@/components/shared/script-snap";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckout, useDetailPaket, usePerjanjianAktif } from "@/lib/api/hooks";
import { useSiapkanSesi } from "@/lib/api/use-sesi";
import { labelFiturPaket } from "@/lib/enum";
import { formatAngka, formatRupiah } from "@/lib/format";
import { toastInfo, toastSukses } from "@/lib/toast";
import type { PlanView } from "@/types/api";

/**
 * Halaman checkout berbasis tautan (item 7 & 11).
 *
 * Halaman ini menjadi tujuan tautan yang disalin admin pada katalog paket
 * (`/checkout/<slug>`). Isinya mengikuti paket yang dipilih: harga, durasi,
 * kuota, fitur, level, dan hak akses paket. Setelah mitra menyetujui perjanjian
 * dan mengonfirmasi, pembayaran dilanjutkan ke halaman pembayaran QRIS/VA.
 */

function buatSkemaKonfirmasi(t: (teks: string) => string) {
  return z.object({
    agree_agreement: z
      .boolean()
      .refine((nilai) => nilai === true, t("Anda harus menyetujui perjanjian kemitraan terlebih dahulu")),
  });
}

type NilaiKonfirmasi = z.infer<ReturnType<typeof buatSkemaKonfirmasi>>;

/** Ringkasan paket yang dipilih, tanpa tombol apa pun. */
function KartuRingkasanPaket({ paket }: { paket: PlanView }) {
  const { t } = useBahasa();

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{paket.name}</CardTitle>
          <CardDescription>
            {paket.description ? t(paket.description) : t("Paket langganan mitra ENM Property.")}
          </CardDescription>
        </div>
        {paket.is_free ? <Badge variant="success">{t("Gratis")}</Badge> : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <span data-numeric className="text-3xl font-semibold tracking-tight text-ink">
          {paket.is_free ? t("Gratis") : paket.price_label || formatRupiah(paket.price)}
        </span>

        <DaftarDeskripsi
          kolom={3}
          item={[
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
            { label: t("Level paket"), nilai: t("Level {level}", { level: paket.level }) },
            {
              label: t("Boost katalog"),
              nilai: paket.boost_enabled ? t("Aktif") : t("Tidak termasuk"),
            },
            { label: t("Akses keyword"), nilai: paket.keyword_access ? t("Tersedia") : t("Tidak tersedia") },
            { label: t("Akses katalog"), nilai: paket.catalog_access ? t("Tersedia") : t("Tidak tersedia") },
            { label: t("Akses nomor WA"), nilai: paket.whatsapp_access ? t("Tersedia") : t("Tidak tersedia") },
          ]}
        />

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
      </CardContent>
    </Card>
  );
}

/** Ajakan masuk/daftar ketika tautan checkout dibuka tanpa sesi aktif. */
function KartuAjakanMasuk({ lanjut }: { lanjut: string }) {
  const { t } = useBahasa();
  const tujuan = encodeURIComponent(lanjut);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
          {t("Masuk untuk melanjutkan")}
        </CardTitle>
        <CardDescription>
          {t(
            "Anda perlu masuk untuk menyetujui perjanjian kemitraan dan melanjutkan pembayaran.",
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/login?lanjut=${tujuan}`}>
            <LogIn />
            {t("Masuk")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/register?lanjut=${tujuan}`}>
            <UserPlus />
            {t("Daftar akun")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Ajakan melengkapi data mitra sebelum checkout (permintaan A & 8). */
function KartuLengkapiMitra({ lanjut }: { lanjut: string }) {
  const { t } = useBahasa();
  const tujuan = encodeURIComponent(lanjut);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="size-4 text-secondary" aria-hidden="true" />
          {t("Lengkapi data mitra dulu")}
        </CardTitle>
        <CardDescription>
          {t(
            "Sebelum berlangganan, Anda perlu mengisi data badan usaha lewat pendaftaran mitra. Setelah itu Anda otomatis kembali ke halaman ini untuk menyelesaikan pembayaran.",
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/daftar-mitra?lanjut=${tujuan}`}>
            <Store />
            {t("Daftar Sebagai Mitra")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Panel konfirmasi: perjanjian dan tombol lanjut ke pembayaran. */
function PanelKonfirmasi({ paket }: { paket: PlanView }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useBahasa();
  const { pengguna, memuat } = useAuth();
  const perjanjian = usePerjanjianAktif();
  const checkout = useCheckout();
  const siapkanSesi = useSiapkanSesi();

  const gratis = paket.is_free;
  const skemaKonfirmasi = React.useMemo(() => buatSkemaKonfirmasi(t), [t]);

  const form = useForm<NilaiKonfirmasi>({
    resolver: zodResolver(skemaKonfirmasi),
    /* Persetujuan wajib dicentang mitra, termasuk untuk paket Gratis. */
    defaultValues: { agree_agreement: false },
  });

  /* Menjaga klik pertama sebagai satu-satunya proses checkout yang berjalan. */
  const [mengirim, setMengirim] = React.useState(false);

  if (memuat) {
    return <Skeleton className="h-72 rounded-card" />;
  }

  if (!pengguna) {
    return <KartuAjakanMasuk lanjut={pathname} />;
  }

  /* Checkout hanya untuk mitra: pengguna yang belum punya profil mitra wajib
     mengisi data badan usaha lebih dulu (permintaan A & 8). */
  if (!pengguna.partner) {
    return <KartuLengkapiMitra lanjut={pathname} />;
  }

  /* Perjanjian aktif dibutuhkan baik untuk paket Gratis maupun berbayar karena
     persetujuan mitra dicatatkan saat checkout. */
  if (perjanjian.isPending) {
    return <Skeleton className="h-72 rounded-card" />;
  }

  if (perjanjian.isError || !perjanjian.data) {
    return (
      <Alert variant="danger">
        <AlertTitle>{t("Gagal memuat data konfirmasi")}</AlertTitle>
        <AlertDescription>{t("Muat ulang halaman untuk mencoba lagi.")}</AlertDescription>
      </Alert>
    );
  }

  const detail = perjanjian.data;

  async function kirim(nilai: NilaiKonfirmasi) {
    /* Loading state instan: menolak klik berulang sebelum mutasi ditandai
       pending sehingga double-submit tidak menghasilkan order ganda. */
    if (mengirim) return;
    setMengirim(true);
    try {
      const hasil = await checkout.mutateAsync({
        package_slug: paket.slug,
        agree_agreement: nilai.agree_agreement,
        agreement_id: detail.id,
      });

      // Peran pengguna dinaikkan menjadi mitra saat checkout, jadi sesi disegarkan
      // agar area /mitra (pembayaran, dashboard) langsung dapat diakses.
      await siapkanSesi().catch(() => undefined);

      if (hasil.free_active) {
        toastSukses(t("Paket aktif"), t("Paket {nama} langsung aktif tanpa biaya.", { nama: paket.name }));
        router.push("/mitra/langganan");
        return;
      }

      /* Order pending yang dipakai ulang dialihkan langsung ke halaman
         pembayarannya tanpa membuka Snap baru. */
      if (hasil.reused) {
        toastInfo(
          t("Melanjutkan pembayaran"),
          t("Anda dialihkan ke halaman pembayaran pesanan yang belum selesai."),
        );
        router.push(`/pembayaran/${hasil.order_code ?? hasil.order.code}`);
        return;
      }

      toastSukses(t("Pesanan dibuat"), t("Lanjutkan pembayaran melalui Midtrans."));
      router.push(`/pembayaran/${hasil.order.code}`);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
      setMengirim(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
          {gratis ? t("Perjanjian Kemitraan") : t("Perjanjian & Konfirmasi")}
        </CardTitle>
        <CardDescription>
          {gratis
            ? t("Perjanjian kemitraan wajib disetujui sebelum mengaktifkan paket Gratis.")
            : t("Perjanjian kemitraan wajib disetujui sebelum pembayaran paket.")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(kirim)} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium text-ink">{detail.title}</span>
              <Badge variant="neutral">{t("Versi {versi}", { versi: detail.version })}</Badge>
            </div>
            <p className="max-h-40 overflow-y-auto rounded-field border border-line bg-hover/50 p-4 text-[13px] whitespace-pre-line text-ink-muted">
              {detail.content}
            </p>
          </div>

          <CheckboxField
            control={form.control}
            name="agree_agreement"
            label={t("Saya menyetujui perjanjian kemitraan ENM Property.")}
            deskripsi={t("Perjanjian akan tercatat saat Anda melanjutkan.")}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={checkout.isPending || mengirim}>
              {checkout.isPending || mengirim ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
              {gratis ? t("Aktifkan paket") : t("Lanjut ke pembayaran")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function CheckoutPaket({ slug }: { slug: string }) {
  const { t } = useBahasa();
  const paket = useDetailPaket(slug);

  return (
    <>
      <ScriptSnap />
      <TombolBeranda />
      <PageHeader
        judul={t("Checkout Paket")}
        deskripsi={t("Tinjau paket yang Anda pilih sebelum melanjutkan pembayaran.")}
      />

      <KontenAsync
        hasil={paket}
        skeleton={
          <div className="flex flex-col gap-6">
            <Skeleton className="h-72 rounded-card" />
            <Skeleton className="h-72 rounded-card" />
          </div>
        }
        judulGagal={t("Gagal memuat paket")}
      >
        {(data) => (
          <div className="flex flex-col gap-6">
            <KartuRingkasanPaket paket={data} />
            <PanelKonfirmasi paket={data} />
          </div>
        )}
      </KontenAsync>
    </>
  );
}
