"use client";

import Link from "next/link";
import { CheckCircle2, LogIn, Sparkles, UserPlus } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { EmptyState } from "@/components/shared/empty-state";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaketPublik } from "@/lib/api/hooks";
import { labelFiturPaket } from "@/lib/enum";
import { formatAngka, formatRupiah } from "@/lib/format";
import { dashboardPeran } from "@/lib/navigation";
import type { PlanView } from "@/types/api";

/**
 * Katalog paket publik.
 *
 * Menjadi halaman tujuan langkah "daftar sebagai mitra": pengguna memilih paket
 * di sini, lalu berpindah ke halaman checkout berbasis tautan (`/checkout/<slug>`).
 * Halaman ini tidak memerlukan sesi sehingga calon mitra dapat melihat harga
 * lebih dulu.
 */

/** Satu kartu paket dengan ringkasan harga dan tombol pilih. */
function KartuPaket({ paket }: { paket: PlanView }) {
  const { t, bahasa } = useBahasa();

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{paket.name}</CardTitle>
          <CardDescription>
            {bahasa === "en" && paket.description_en
              ? paket.description_en
              : paket.description
                ? t(paket.description)
                : t("Paket langganan mitra ENM Property.")}
          </CardDescription>
        </div>
        {paket.is_free ? <Badge variant="success">{t("Gratis")}</Badge> : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6">
        <span data-numeric className="text-3xl font-semibold tracking-tight text-ink">
          {paket.is_free ? t("Gratis") : paket.price_label || formatRupiah(paket.price)}
        </span>

        <DaftarDeskripsi
          kolom={2}
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

        <div className="mt-auto">
          <Button asChild className="w-full">
            <Link href={`/checkout/${paket.slug}`}>
              <Sparkles />
              {t("Pilih paket")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function KatalogPaketPublik() {
  const { t } = useBahasa();
  const paket = usePaketPublik();
  const { pengguna } = useAuth();

  return (
    <>
      <PageHeader
        judul={t("Paket Langganan")}
        deskripsi={t("Pilih paket yang sesuai kebutuhan Anda, lalu lanjutkan ke pembayaran.")}
        aksi={
          pengguna ? (
            <Button variant="outline" asChild>
              <Link href={dashboardPeran(pengguna.role)}>{t("Buka dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/register">
                  <UserPlus />
                  {t("Daftar akun")}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login">
                  <LogIn />
                  {t("Masuk")}
                </Link>
              </Button>
            </>
          )
        }
      />

      <KontenAsync
        hasil={paket}
        skeleton={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-card" />
            <Skeleton className="h-80 rounded-card" />
            <Skeleton className="h-80 rounded-card" />
          </div>
        }
        judulGagal={t("Gagal memuat paket")}
      >
        {(daftar) =>
          daftar.length === 0 ? (
            <EmptyState
              judul={t("Belum ada paket")}
              deskripsi={t("Paket langganan belum tersedia saat ini. Silakan coba lagi nanti.")}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {daftar.map((item) => (
                <KartuPaket key={item.id} paket={item} />
              ))}
            </div>
          )
        }
      </KontenAsync>
    </>
  );
}
