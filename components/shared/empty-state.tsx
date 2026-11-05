import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

/** Keadaan kosong standar untuk daftar/tabel tanpa data. */
export function EmptyState({
  ikon: Ikon = Inbox,
  judul,
  deskripsi,
  aksi,
  className,
}: {
  ikon?: LucideIcon;
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className ?? ""}`}
    >
      <span
        className="grid size-12 place-items-center rounded-full bg-divider text-ink-subtle"
        aria-hidden="true"
      >
        <Ikon className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-ink">{judul}</p>
        {deskripsi ? <p className="max-w-md text-[13px] text-ink-muted">{deskripsi}</p> : null}
      </div>
      {aksi}
    </div>
  );
}
