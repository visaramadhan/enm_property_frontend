"use client";

import * as React from "react";

/**
 * Menunda pembaruan nilai selama `jeda` milidetik.
 *
 * Dipakai kolom pencarian agar permintaan ke backend tidak dikirim pada
 * setiap ketukan tombol (DRY: satu implementasi untuk seluruh halaman).
 */
export function useDebounce<T>(nilai: T, jeda = 350): T {
  const [tertunda, setTertunda] = React.useState(nilai);

  React.useEffect(() => {
    const id = setTimeout(() => setTertunda(nilai), jeda);
    return () => clearTimeout(id);
  }, [nilai, jeda]);

  return tertunda;
}
