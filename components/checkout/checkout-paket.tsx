"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, LogIn, ShieldCheck, Sparkles, Store, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { CheckboxField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckout, useDetailPaket, usePerjanjianAktif } from "@/lib/api/hooks";
import { useSiapkanSesi } from "@/lib/api/use-sesi";
import { formatAngka, formatRupiah } from "@/lib/format";
import { toastSukses } from "@/lib/toast";
import type { PlanView } from "@/types/api";

/**
 * Halaman checkout berbasis tautan (item 7 & 11).
 *
 * Halaman ini menjadi tujuan tautan yang disalin admin pada katalog paket
 * (`/checkout/<slug>`). Isinya mengikuti paket yang dipilih: harga, durasi,
 * kuota, fitur, level, dan hak akses paket. Setelah mitra menyetujui perjanjian
 * dan mengonfirmasi, pembayaran dilanjutkan ke halaman pembayaran QRIS/VA.
 */

const skemaKonfirmasi = z.object({
  agree_agreement: z
    .boolean()
    .refine((nilai) => nilai === true, "Anda harus menyetujui perjanjian kemitraan terlebih dahulu"),
});

type NilaiKonfirmasi = z.infer<typeof skemaKonfirmasi>;

/** Ringkasan paket yang dipilih, tanpa tombol apa pun. */
function KartuRingkasanPaket({ paket }: { paket: PlanView }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{paket.name}</CardTitle>
          <CardDescription>{paket.description || "Paket langganan mitra ENM Property."}</CardDescription>
        </div>
        {paket.is_free ? <Badge variant="success">Gratis</Badge> : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <span data-numeric className="text-3xl font-semibold tracking-tight text-ink">
          {paket.is_free ? "Gratis" : paket.price_label || formatRupiah(paket.price)}
        </span>

        <DaftarDeskripsi
          kolom={3}
          item={[
            {
              label: "Durasi",
              nilai: paket.duration_days > 0 ? `${formatAngka(paket.duration_days)} hari` : "Tanpa batas",
            },
            {
              label: "Kuota listing",
              nilai: paket.is_unlimited ? "Tanpa batas" : `${formatAngka(paket.listing_quota)} listing`,
            },
            { label: "Level paket", nilai: `Level ${paket.level}` },
            { label: "Boost katalog", nilai: paket.boost_enabled ? "Aktif" : "Tidak termasuk" },
            { label: "Akses keyword", nilai: paket.keyword_access ? "Tersedia" : "Tidak tersedia" },
            { label: "Akses katalog", nilai: paket.catalog_access ? "Tersedia" : "Tidak tersedia" },
            { label: "Akses nomor WA", nilai: paket.whatsapp_access ? "Tersedia" : "Tidak tersedia" },
          ]}
        />

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
      </CardContent>
    </Card>
  );
}

/** Ajakan masuk/daftar ketika tautan checkout dibuka tanpa sesi aktif. */
function KartuAjakanMasuk({ lanjut }: { lanjut: string }) {
  const tujuan = encodeURIComponent(lanjut);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
          Masuk untuk melanjutkan
        </CardTitle>
        <CardDescription>
          Anda perlu masuk untuk menyetujui perjanjian kemitraan dan melanjutkan pembayaran.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/login?lanjut=${tujuan}`}>
            <LogIn />
            Masuk
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/register?lanjut=${tujuan}`}>
            <UserPlus />
            Daftar akun
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Ajakan melengkapi data mitra sebelum checkout (permintaan A & 8). */
function KartuLengkapiMitra({ lanjut }: { lanjut: string }) {
  const tujuan = encodeURIComponent(lanjut);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="size-4 text-secondary" aria-hidden="true" />
          Lengkapi data mitra dulu
        </CardTitle>
        <CardDescription>
          Sebelum berlangganan, Anda perlu mengisi data badan usaha lewat pendaftaran mitra. Setelah
          itu Anda otomatis kembali ke halaman ini untuk menyelesaikan pembayaran.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/daftar-mitra?lanjut=${tujuan}`}>
            <Store />
            Daftar Sebagai Mitra
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
  const { pengguna, memuat } = useAuth();
  const perjanjian = usePerjanjianAktif();
  const checkout = useCheckout();
  const siapkanSesi = useSiapkanSesi();

  const gratis = paket.is_free;

  const form = useForm<NilaiKonfirmasi>({
    resolver: zodResolver(skemaKonfirmasi),
    defaultValues: { agree_agreement: gratis },
  });

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

  /* Paket Gratis langsung aktif tanpa perjanjian, sehingga data perjanjian
     tidak diperlukan dan tidak boleh menahan tombol aktivasi. */
  if (!gratis) {
    if (perjanjian.isPending) {
      return <Skeleton className="h-72 rounded-card" />;
    }

    if (perjanjian.isError || !perjanjian.data) {
      return (
        <Alert variant="danger">
          <AlertTitle>Gagal memuat data konfirmasi</AlertTitle>
          <AlertDescription>Muat ulang halaman untuk mencoba lagi.</AlertDescription>
        </Alert>
      );
    }
  }

  async function kirim(nilai: NilaiKonfirmasi) {
    try {
      const hasil = await checkout.mutateAsync({
        package_slug: paket.slug,
        agree_agreement: gratis ? true : nilai.agree_agreement,
        agreement_id: gratis ? undefined : perjanjian.data?.id,
      });

      // Peran pengguna dinaikkan menjadi mitra saat checkout, jadi sesi disegarkan
      // agar area /mitra (pembayaran, dashboard) langsung dapat diakses.
      await siapkanSesi().catch(() => undefined);

      if (hasil.free_active) {
        toastSukses("Paket aktif", `Paket ${paket.name} langsung aktif tanpa biaya.`);
        router.push("/mitra/langganan");
        return;
      }

      toastSukses("Pesanan dibuat", "Lanjutkan pembayaran melalui QRIS atau virtual account.");
      router.push(`/pembayaran/${hasil.order.code}`);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  if (gratis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-secondary" aria-hidden="true" />
            Aktifkan Paket Gratis
          </CardTitle>
          <CardDescription>
            Paket Gratis langsung aktif tanpa biaya dan tanpa perjanjian. Setelah aktif Anda dapat
            langsung memasang listing.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={checkout.isPending}
              onClick={() => void kirim({ agree_agreement: true })}
            >
              {checkout.isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
              Aktifkan paket
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* Setelah guard di atas, `perjanjian.data` dijamin ada untuk paket berbayar. */
  const detail = perjanjian.data;
  if (!detail) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
          Perjanjian & Konfirmasi
        </CardTitle>
        <CardDescription>
          Perjanjian kemitraan wajib disetujui sebelum pembayaran paket.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(kirim)} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium text-ink">{detail.title}</span>
              <Badge variant="neutral">Versi {detail.version}</Badge>
            </div>
            <p className="max-h-40 overflow-y-auto rounded-field border border-line bg-hover/50 p-4 text-[13px] whitespace-pre-line text-ink-muted">
              {detail.content}
            </p>
          </div>

          <CheckboxField
            control={form.control}
            name="agree_agreement"
            label="Saya menyetujui perjanjian kemitraan ENM Property."
            deskripsi="Perjanjian akan tercatat saat Anda melanjutkan."
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={checkout.isPending}>
              {checkout.isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
              {paket.is_free ? "Aktifkan paket" : "Lanjut ke pembayaran"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function CheckoutPaket({ slug }: { slug: string }) {
  const paket = useDetailPaket(slug);

  return (
    <>
      <TombolBeranda />
      <PageHeader
        judul="Checkout Paket"
        deskripsi="Tinjau paket yang Anda pilih sebelum melanjutkan pembayaran."
      />

      <KontenAsync
        hasil={paket}
        skeleton={
          <div className="flex flex-col gap-6">
            <Skeleton className="h-72 rounded-card" />
            <Skeleton className="h-72 rounded-card" />
          </div>
        }
        judulGagal="Gagal memuat paket"
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
