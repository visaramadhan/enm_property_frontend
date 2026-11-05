"use client";

import * as React from "react";

import { DataTable, type KolomTabel } from "@/components/shared/data-table";
import { FilterBar, type KolomFilter } from "@/components/shared/filter-bar";
import { Pagination } from "@/components/shared/pagination";
import { Card } from "@/components/ui/card";
import type { Meta } from "@/types/api";

/**
 * Rangka halaman daftar berpaginasi.
 *
 * Menyatukan tiga bagian yang selalu berulang di setiap halaman daftar —
 * bilah filter, tabel, dan paginasi — sehingga halaman hanya mendeklarasikan
 * kolom dan query-nya (DRY). Setiap halaman daftar di dashboard memakai
 * komponen ini agar jarak, garis pemisah, dan transisinya seragam.
 */
export function TabelData<T>({
  kolom,
  data,
  kunciBaris,
  meta,
  memuat = false,
  error,
  onCobaLagi,
  onUbahHalaman,
  nilaiCari,
  onCari,
  placeholderCari,
  filter = [],
  aksi,
  satuan,
  kosong,
  jumlahKerangka = 5,
}: {
  kolom: KolomTabel<T>[];
  data?: T[];
  kunciBaris: (baris: T, indeks: number) => string;
  meta?: Meta;
  memuat?: boolean;
  error?: unknown;
  onCobaLagi?: () => void;
  onUbahHalaman: (halaman: number) => void;
  nilaiCari?: string;
  onCari?: (nilai: string) => void;
  placeholderCari?: string;
  filter?: KolomFilter[];
  aksi?: React.ReactNode;
  satuan?: string;
  kosong?: React.ReactNode;
  jumlahKerangka?: number;
}) {
  const adaBilah = Boolean(onCari) || filter.length > 0 || Boolean(aksi);

  return (
    <Card className="gap-0 overflow-hidden p-0">
      {adaBilah ? (
        <div className="border-b border-divider p-4">
          <FilterBar
            nilaiCari={nilaiCari}
            onCari={onCari}
            placeholder={placeholderCari}
            filter={filter}
            aksi={aksi}
          />
        </div>
      ) : null}

      <DataTable
        kolom={kolom}
        data={data}
        kunciBaris={kunciBaris}
        memuat={memuat}
        error={error}
        onCobaLagi={onCobaLagi}
        kosong={kosong}
        jumlahKerangka={jumlahKerangka}
      />

      <Pagination meta={meta} onUbahHalaman={onUbahHalaman} satuan={satuan} />
    </Card>
  );
}
