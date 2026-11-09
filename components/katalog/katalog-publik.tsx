"use client";

import Link from "next/link";
import { Building2, LogIn, UserPlus } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { KartuProperti } from "@/components/properti/kartu-properti";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKategoriPublik, usePropertiPublik } from "@/lib/api/hooks";
import { OPSI_TIPE_PENAWARAN, OPSI_TIPE_PROPERTI } from "@/lib/enum";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { ListingType, PropertyType } from "@/types/api";

/**
 * Katalog properti publik.
 *
 * Menampilkan properti tayang apa adanya dari endpoint publik `/properties`,
 * lengkap dengan pencarian, filter kategori/penawaran/tipe, dan paginasi sisi
 * server. Halaman ini tidak memerlukan sesi sehingga pengunjung dapat menelusuri
 * listing sebelum mendaftar. Urutan tampil mengikuti algoritma backend
 * (boost -> keyword -> klik WhatsApp -> rating -> favorit).
 */
interface FilterKatalog {
  category_id?: string;
  listing_type?: ListingType;
  property_type?: PropertyType;
}

/** Kerangka grid saat data katalog sedang dimuat. */
function KerangkaKatalog() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, indeks) => (
        <Skeleton key={indeks} className="h-80 rounded-card" />
      ))}
    </div>
  );
}

export function KatalogPublik() {
  const tabel = useTabelQuery<FilterKatalog>({ perPage: 9 });
  const properti = usePropertiPublik(tabel.query);
  const kategori = useKategoriPublik();
  const { pengguna } = useAuth();

  const opsiKategori = (kategori.data ?? []).map((item) => ({
    nilai: item.id,
    label: item.name,
  }));

  const daftar = properti.data?.items ?? [];

  return (
    <>
      <TombolBeranda selaluTampil />

      <PageHeader
        judul="Katalog Properti"
        deskripsi="Jelajahi properti yang tayang, lalu hubungi mitra untuk informasi lebih lanjut."
        aksi={
          pengguna ? null : (
            <>
              <Button variant="outline" asChild>
                <Link href="/register">
                  <UserPlus />
                  Daftar akun
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login">
                  <LogIn />
                  Masuk
                </Link>
              </Button>
            </>
          )
        }
      />

      <div className="flex flex-col gap-6">
        <FilterBar
          nilaiCari={tabel.cari}
          onCari={tabel.ubahCari}
          placeholder="Cari judul, kota, atau kata kunci..."
          filter={[
            {
              kunci: "category_id",
              label: "Kategori",
              nilai: tabel.filter.category_id,
              opsi: opsiKategori,
              onUbah: (nilai) => tabel.ubahFilter("category_id", nilai),
            },
            {
              kunci: "listing_type",
              label: "Penawaran",
              nilai: tabel.filter.listing_type,
              opsi: OPSI_TIPE_PENAWARAN,
              onUbah: (nilai) => tabel.ubahFilter("listing_type", nilai),
            },
            {
              kunci: "property_type",
              label: "Tipe",
              nilai: tabel.filter.property_type,
              opsi: OPSI_TIPE_PROPERTI,
              onUbah: (nilai) => tabel.ubahFilter("property_type", nilai),
            },
          ]}
        />

        {properti.isPending ? (
          <KerangkaKatalog />
        ) : properti.isError ? (
          <ErrorState
            error={properti.error}
            judul="Gagal memuat katalog"
            onCobaLagi={() => void properti.refetch()}
          />
        ) : daftar.length === 0 ? (
          <EmptyState
            ikon={Building2}
            judul="Belum ada properti"
            deskripsi="Properti yang tayang akan tampil di sini. Coba ubah kata kunci atau filter."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {daftar.map((item) => (
                <KartuProperti key={item.id} properti={item} />
              ))}
            </div>

            <Pagination
              meta={properti.data?.meta}
              onUbahHalaman={tabel.aturHalaman}
              satuan="properti"
            />
          </>
        )}
      </div>
    </>
  );
}
