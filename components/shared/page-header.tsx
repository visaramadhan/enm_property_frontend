import type { ReactNode } from "react";

/** Judul halaman beserta deskripsi dan tombol aksi di sisi kanan. */
export function PageHeader({
  judul,
  deskripsi,
  aksi,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-ink">{judul}</h2>
        {deskripsi ? <p className="text-sm text-ink-muted">{deskripsi}</p> : null}
      </div>
      {aksi ? <div className="flex flex-wrap items-center gap-2">{aksi}</div> : null}
    </div>
  );
}
