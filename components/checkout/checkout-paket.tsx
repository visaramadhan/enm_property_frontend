"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, LogIn, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { CheckboxField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCheckout,
  useDetailPaket,
  usePerjanjianMitra,
  useProfilMitra,
} from "@/lib/api/hooks";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
          Masuk untuk melanjutkan
        </CardTitle>
        <CardDescription>
          Anda perlu masuk sebagai mitra untuk menyetujui perjanjian dan melanjutkan pembayaran.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/login?lanjut=${encodeURIComponent(lanjut)}`}>
            <LogIn />
            Masuk
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">
            <UserPlus />
            Daftar mitra
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Panel konfirmasi: perjanjian, kelengkapan profil, dan tombol lanjut. */
function PanelKonfirmasi({ paket }: { paket: PlanView }) {
  const router = useRouter();
  const pathname = usePathname();
  const { pengguna, memuat } = useAuth();
  const perjanjian = usePerjanjianMitra(Boolean(pengguna));
  const profil = useProfilMitra(Boolean(pengguna));
  const checkout = useCheckout();

  const form = useForm<NilaiKonfirmasi>({
    resolver: zodResolver(skemaKonfirmasi),
    defaultValues: { agree_agreement: false },
  });

  if (memuat) {
    return <Skeleton className="h-72 rounded-card" />;
  }

  if (!pengguna) {
    return <KartuAjakanMasuk lanjut={pathname} />;
  }

  if (perjanjian.isPending || profil.isPending) {
    return <Skeleton className="h-72 rounded-card" />;
  }

  if (perjanjian.isError || profil.isError || !perjanjian.data || !profil.data) {
    return (
      <Alert variant="danger">
        <AlertTitle>Gagal memuat data konfirmasi</AlertTitle>
        <AlertDescription>Muat ulang halaman untuk mencoba lagi.</AlertDescription>
      </Alert>
    );
  }

  const perluLengkapiProfil = !profil.data.id;

  async function kirim(nilai: NilaiKonfirmasi) {
    try {
      const hasil = await checkout.mutateAsync({
        package_slug: paket.slug,
        agree_agreement: nilai.agree_agreement,
        agreement_id: perjanjian.data?.agreement.id,
      });

      if (hasil.free_active) {
        toastSukses("Paket aktif", `Paket ${paket.name} langsung aktif tanpa biaya.`);
        router.push("/mitra/langganan");
        return;
      }

      toastSukses("Pesanan dibuat", "Lanjutkan pembayaran melalui QRIS atau virtual account.");
      router.push(`/mitra/pembayaran/${hasil.order.code}`);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
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
        {perluLengkapiProfil ? (
          <div className="flex flex-col gap-4">
            <Alert variant="warning">
              <AlertTitle>Lengkapi profil mitra</AlertTitle>
              <AlertDescription>
                Anda perlu melengkapi data badan usaha sebelum berlangganan paket berbayar.
              </AlertDescription>
            </Alert>
            <div>
              <Button asChild>
                <Link href="/mitra/profil">Lengkapi profil mitra</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(kirim)} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium text-ink">{perjanjian.data.agreement.title}</span>
                <Badge variant="neutral">Versi {perjanjian.data.agreement.version}</Badge>
                {perjanjian.data.accepted ? <Badge variant="success">Disetujui</Badge> : null}
              </div>
              <p className="max-h-40 overflow-y-auto rounded-field border border-line bg-hover/50 p-4 text-[13px] whitespace-pre-line text-ink-muted">
                {perjanjian.data.agreement.content}
              </p>
            </div>

            <CheckboxField
              control={form.control}
              name="agree_agreement"
              label="Saya menyetujui perjanjian kemitraan ENM Property."
              deskripsi={
                perjanjian.data.accepted
                  ? "Persetujuan Anda sebelumnya tetap berlaku."
                  : "Perjanjian akan tercatat saat Anda melanjutkan."
              }
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={checkout.isPending}>
                {checkout.isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                {paket.is_free ? "Aktifkan paket" : "Lanjut ke pembayaran"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function CheckoutPaket({ slug }: { slug: string }) {
  const paket = useDetailPaket(slug);

  return (
    <>
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
