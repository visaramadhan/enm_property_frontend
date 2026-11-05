"use client";

import type * as React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

import { ErrorState } from "@/components/shared/error-state";

/**
 * Pembungkus keadaan muat/gagal untuk konten berbasis TanStack Query.
 *
 * Seluruh halaman membaca data lewat satu pola yang sama sehingga tidak ada
 * percabangan `isPending`/`isError` yang ditulis berulang (DRY). `children`
 * menerima data yang sudah dipastikan tersedia.
 */
export function KontenAsync<T>({
  hasil,
  skeleton,
  judulGagal,
  children,
}: {
  hasil: UseQueryResult<T>;
  skeleton?: React.ReactNode;
  judulGagal?: string;
  children: (data: T) => React.ReactNode;
}) {
  if (hasil.isPending) return <>{skeleton ?? null}</>;
  if (hasil.isError) {
    return (
      <ErrorState error={hasil.error} judul={judulGagal} onCobaLagi={() => void hasil.refetch()} />
    );
  }
  if (hasil.data === undefined) return <>{skeleton ?? null}</>;

  return <>{children(hasil.data)}</>;
}
