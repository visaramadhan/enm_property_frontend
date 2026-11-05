"use client";

import * as React from "react";
import Link from "next/link";
import { HeartOff, Trash2 } from "lucide-react";

import { SelHarga, SelProperti } from "@/components/properti/sel-properti";
import { AksiBaris } from "@/components/shared/aksi-baris";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { KolomTabel } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDaftarFavorit, useHapusFavorit } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { FavoriteView } from "@/types/api";

/**
 * Halaman Favorit mitra.
 *
 * Backend membatasi `/me/favorites*` untuk peran `customer`
 * (`RequireRole(models.RoleCustomer)`), sedangkan menu "Favorit" tampil pada
 * sidebar mitra. Karena itu respons 403 ditampilkan sebagai keterangan
 * informatif alih-alih halaman galat, tanpa menghapus pemanggilan endpoint.
 */
export function FavoritMitra() {
  const tabel = useTabelQuery({ perPage: 10 });
  const daftar = useDaftarFavorit(tabel.query);
  const hapus = useHapusFavorit();
  const [target, setTarget] = React.useState<FavoriteView | null>(null);

  const terbatasPeran =
    daftar.isError && daftar.error instanceof ApiError && daftar.error.status === 403;

  const kolom: KolomTabel<FavoriteView>[] = [
    {
      kunci: "properti",
      judul: "Properti",
      render: (baris) =>
        baris.property ? (
          <SelProperti properti={baris.property} />
        ) : (
          <span className="text-ink-muted">ID {baris.property_id}</span>
        ),
    },
    {
      kunci: "harga",
      judul: "Harga",
      render: (baris) => (baris.property ? <SelHarga properti={baris.property} /> : "-"),
    },
    {
      kunci: "status",
      judul: "Status",
      render: (baris) =>
        baris.property ? (
          <StatusBadge
            jenis="properti"
            status={baris.property.status}
            label={baris.property.status_label}
          />
        ) : (
          "-"
        ),
    },
    {
      kunci: "tayangan",
      judul: "Tayangan",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.property?.views ?? 0)}</span>,
    },
    {
      kunci: "disimpan",
      judul: "Disimpan",
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatTanggalWib(baris.created_at),
    },
    {
      kunci: "aksi",
      judul: "",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => (
        <AksiBaris
          aksi={[
            { label: "Hapus dari favorit", ikon: Trash2, variant: "danger", onPilih: () => setTarget(baris) },
          ]}
        />
      ),
    },
  ];

  async function konfirmasiHapus() {
    if (!target) return;
    try {
      await hapus.mutateAsync(target.property_id);
      setTarget(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <>
      <PageHeader
        judul="Favorit"
        deskripsi="Daftar properti yang Anda simpan untuk ditinjau kembali."
      />

      {terbatasPeran ? (
        <Card>
          <CardContent className="pt-6">
            <Alert variant="info">
              <AlertTitle>Fitur favorit khusus akun customer</AlertTitle>
              <AlertDescription>
                Backend hanya mengizinkan peran <span className="font-medium">customer</span> untuk
                menyimpan properti favorit. Jelajahi katalog properti terlebih dahulu, lalu simpan
                listing yang diminati melalui akun customer.
              </AlertDescription>
            </Alert>
            <div className="mt-5">
              <Button variant="outline" asChild>
                <Link href="/mitra/properti">Lihat Properti Saya</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : daftar.isError ? (
        <ErrorState
          error={daftar.error}
          judul="Gagal memuat favorit"
          onCobaLagi={() => void daftar.refetch()}
        />
      ) : (
        <TabelData
          kolom={kolom}
          data={daftar.data?.items}
          meta={daftar.data?.meta}
          kunciBaris={(baris) => baris.id}
          memuat={daftar.isPending}
          onUbahHalaman={tabel.aturHalaman}
          satuan="favorit"
          kosong={
            <EmptyState
              ikon={HeartOff}
              judul="Belum ada favorit"
              deskripsi="Properti yang Anda simpan akan tampil di sini."
            />
          }
        />
      )}

      {target ? (
        <ConfirmDialog
          key={target.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTarget(null);
          }}
          judul="Hapus dari favorit"
          deskripsi={
            target.property
              ? `Properti "${target.property.title}" akan dihapus dari daftar favorit Anda.`
              : "Properti ini akan dihapus dari daftar favorit Anda."
          }
          labelKonfirmasi="Hapus"
          variant="danger"
          memuat={hapus.isPending}
          onKonfirmasi={() => void konfirmasiHapus()}
        />
      ) : null}
    </>
  );
}
