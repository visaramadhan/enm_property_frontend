"use client";

import * as React from "react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TabelSkeleton } from "@/components/shared/tabel-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface KolomTabel<T> {
  kunci: string;
  judul: string;
  kepalaClassName?: string;
  selClassName?: string;
  render: (baris: T, indeks: number) => React.ReactNode;
}

/**
 * Tabel generik dengan kolom deklaratif.
 *
 * Menangani empat keadaan sekaligus — gagal, memuat, kosong, dan berisi — agar
 * setiap halaman hanya mendefinisikan kolom dan tidak mengulang logika
 * penyajian (DRY). Judul kolom diterjemahkan di sini (`t`) sehingga definisi
 * kolom bersama (mis. `kolom-laporan.tsx`) cukup menulis teks Indonesia dan
 * otomatis mengikuti bahasa aktif.
 */
export function DataTable<T>({
  kolom,
  data,
  kunciBaris,
  memuat = false,
  error,
  onCobaLagi,
  kosong,
  jumlahKerangka = 5,
  className,
}: {
  kolom: KolomTabel<T>[];
  data?: T[];
  kunciBaris: (baris: T, indeks: number) => string;
  memuat?: boolean;
  error?: unknown;
  onCobaLagi?: () => void;
  kosong?: React.ReactNode;
  jumlahKerangka?: number;
  className?: string;
}) {
  const baris = data ?? [];
  const belumAdaData = memuat && baris.length === 0;
  const idPeran = React.useId();
  const { t } = useBahasa();

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {kolom.map((item) => (
            <TableHead key={item.kunci} className={item.kepalaClassName}>
              {t(item.judul)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody
        className={cn(
          "transition-opacity duration-150 ease-out",
          memuat && baris.length > 0 && "opacity-60",
        )}
      >
        {error && baris.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={kolom.length} className="p-0">
              <ErrorState error={error} onCobaLagi={onCobaLagi} />
            </TableCell>
          </TableRow>
        ) : belumAdaData ? (
          <TabelSkeleton baris={jumlahKerangka} kolom={kolom.length} />
        ) : baris.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={kolom.length} className="p-0">
              {kosong ?? <EmptyState judul={t("Belum ada data")} />}
            </TableCell>
          </TableRow>
        ) : (
          baris.map((item, indeks) => (
            <TableRow key={`${idPeran}-${kunciBaris(item, indeks)}`}>
              {kolom.map((kolomItem) => (
                <TableCell key={kolomItem.kunci} className={kolomItem.selClassName}>
                  {kolomItem.render(item, indeks)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
