"use client";

import * as React from "react";

import { useDebounce } from "@/lib/hooks/use-debounce";

/** Parameter daftar yang dikirim ke endpoint berpaginasi. */
export interface TabelQuery {
  page: number;
  per_page: number;
  search?: string;
  [filter: string]: string | number | boolean | undefined;
}

type NilaiFilter = string | undefined;

/**
 * Mengelola state daftar berpaginasi (halaman, pencarian, filter) agar setiap
 * halaman tidak menulis ulang logika yang sama.
 *
 * `per_page` default 12 mengikuti default handler backend; nilai ini dikirim
 * eksplisit pada setiap permintaan. Pencarian di-debounce di dalam hook
 * sehingga kolom pencarian dapat dikendalikan langsung (controlled) tanpa
 * menambah state tunda di tiap halaman.
 */
export function useTabelQuery<F extends object = Record<string, NilaiFilter>>(
  opsi: { perPage?: number; filterAwal?: F; jedaCari?: number } = {},
) {
  const perPage = opsi.perPage ?? 12;
  const filterAwal = opsi.filterAwal;

  const [halaman, setHalaman] = React.useState(1);
  const [cari, setCari] = React.useState("");
  const [filter, setFilter] = React.useState<F>(() => (filterAwal ?? {}) as F);

  const cariTertunda = useDebounce(cari, opsi.jedaCari ?? 350);

  const ubahCari = React.useCallback((nilai: string) => {
    setCari(nilai);
    setHalaman(1);
  }, []);

  const ubahFilter = React.useCallback((kunci: keyof F & string, nilai: NilaiFilter) => {
    setFilter((sebelumnya) => ({ ...sebelumnya, [kunci]: nilai }) as F);
    setHalaman(1);
  }, []);

  const reset = React.useCallback(() => {
    setCari("");
    setFilter((filterAwal ?? {}) as F);
    setHalaman(1);
  }, [filterAwal]);

  const query = React.useMemo(
    () => ({ page: halaman, per_page: perPage, search: cariTertunda || undefined, ...filter }),
    [halaman, perPage, cariTertunda, filter],
  ) as F & { page: number; per_page: number; search?: string };

  return {
    query,
    halaman,
    aturHalaman: setHalaman,
    cari,
    ubahCari,
    filter,
    ubahFilter,
    reset,
  };
}
