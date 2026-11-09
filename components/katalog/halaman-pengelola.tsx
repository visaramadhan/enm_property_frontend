"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, LayoutDashboard, UserRound } from "lucide-react";

import { KartuProperti } from "@/components/properti/kartu-properti";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { EmptyState } from "@/components/shared/empty-state";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePengelolaPublik } from "@/lib/api/hooks";

/**
 * Halaman publik profil seorang pengelola (mitra) beserta katalognya.
 *
 * Menampilkan identitas mitra dan seluruh properti yang dikelolanya memakai
 * `KartuProperti` yang sama dengan katalog publik (DRY). Halaman ini dibuka
 * dari tautan nama pengelola pada detail properti, atau dari tombol "Review
 * katalog" pada formulir tambah listing mitra. Bila dibuka dari dashboard
 * (`?dari=dashboard`), tombol "Kembali ke dashboard" ditampilkan agar mitra
 * dapat langsung kembali ke daftar propertinya.
 */
export function HalamanPengelola({ id }: { id: string }) {
  const pengelola = usePengelolaPublik(id);
  const searchParams = useSearchParams();
  const dariDashboard = searchParams.get("dari") === "dashboard";

  return (
    <>
      {dariDashboard ? (
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href="/mitra/properti">
            <LayoutDashboard />
            Kembali ke dashboard
          </Link>
        </Button>
      ) : (
        <TombolBeranda />
      )}

      <KontenAsync
        hasil={pengelola}
        skeleton={<KerangkaPengelola />}
        judulGagal="Profil pengelola tidak dapat dimuat"
      >
        {(data) => (
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="flex flex-wrap items-center gap-4 p-6">
                <span
                  className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <UserRound className="size-7" />
                </span>

                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-semibold tracking-tight text-ink">
                    {data.business_name}
                  </h1>
                  {data.pic_name ? (
                    <p className="text-sm text-ink-muted">{data.pic_name}</p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
                    {data.city ? (
                      <span>
                        {data.city}
                        {data.province ? `, ${data.province}` : ""}
                      </span>
                    ) : null}
                    <Badge variant="neutral">{data.total_listings} properti</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PageHeader
              judul="Katalog pengelola"
              deskripsi="Seluruh properti yang tayang dan dikelola oleh mitra ini."
            />

            {data.properties.length === 0 ? (
              <EmptyState
                ikon={Building2}
                judul="Belum ada properti"
                deskripsi="Pengelola ini belum menayangkan properti apa pun."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.properties.map((item) => (
                  <KartuProperti key={item.id} properti={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </KontenAsync>
    </>
  );
}

/** Kerangka halaman pengelola saat data sedang dimuat. */
function KerangkaPengelola() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 rounded-card" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, indeks) => (
          <Skeleton key={indeks} className="h-80 rounded-card" />
        ))}
      </div>
    </div>
  );
}
