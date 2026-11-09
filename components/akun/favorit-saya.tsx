"use client";

import Link from "next/link";
import { ArrowLeft, HeartOff } from "lucide-react";

import { KartuProperti } from "@/components/properti/kartu-properti";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { useDaftarFavorit } from "@/lib/api/hooks";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";

/**
 * Daftar properti favorit milik pengunjung yang sedang masuk.
 *
 * Memakai grid kartu yang sama dengan katalog sehingga tombol favorit pada
 * setiap kartu sekaligus berfungsi sebagai penghapus dari daftar (DRY). Peran
 * selain `customer` ditolak backend dengan 403; keadaan itu ditampilkan sebagai
 * keterangan informatif, bukan halaman galat.
 */
export function FavoritSaya() {
  const tabel = useTabelQuery({ perPage: 9 });
  const favorit = useDaftarFavorit(tabel.query);

  const daftar = favorit.data?.items ?? [];
  const terbatasPeran =
    favorit.isError && favorit.error instanceof ApiError && favorit.error.status === 403;

  return (
    <>
      <PageHeader
        judul="Favorit Saya"
        deskripsi="Properti yang Anda simpan untuk ditinjau kembali."
        aksi={
          <Button variant="outline" asChild>
            <Link href="/akun">
              <ArrowLeft />
              Kembali ke profil
            </Link>
          </Button>
        }
      />

      {terbatasPeran ? (
        <Alert variant="info">
          <AlertTitle>Fitur favorit khusus akun customer</AlertTitle>
          <AlertDescription>
            Akun Anda tidak memiliki akses ke daftar favorit. Gunakan akun customer untuk menyimpan
            properti yang diminati.
          </AlertDescription>
        </Alert>
      ) : favorit.isError ? (
        <ErrorState
          error={favorit.error}
          judul="Gagal memuat favorit"
          onCobaLagi={() => void favorit.refetch()}
        />
      ) : favorit.isPending ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, indeks) => (
            <Skeleton key={indeks} className="h-80 rounded-card" />
          ))}
        </div>
      ) : daftar.length === 0 ? (
        <EmptyState
          ikon={HeartOff}
          judul="Belum ada favorit"
          deskripsi="Tekan ikon hati pada properti di katalog untuk menyimpannya di sini."
          aksi={
            <Button asChild>
              <Link href="/katalog">Jelajahi katalog</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {daftar.map((item) =>
              item.property ? (
                <KartuProperti key={item.id} properti={item.property} />
              ) : null,
            )}
          </div>

          <Pagination
            meta={favorit.data?.meta}
            onUbahHalaman={tabel.aturHalaman}
            satuan="favorit"
          />
        </div>
      )}
    </>
  );
}
