import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ItemDeskripsi {
  label: string;
  nilai: ReactNode;
  /** Nilai panjang (alamat, catatan) ditampilkan memenuhi lebar daftar. */
  penuh?: boolean;
}

/**
 * Daftar pasangan label–nilai untuk halaman detail/profil.
 *
 * Dipakai bersama oleh seluruh halaman rincian (profil akun, profil mitra,
 * detail pesanan, pengaturan) agar tata letak, ukuran teks, dan jarak antar
 * baris seragam tanpa menulis ulang struktur `dl` di setiap halaman (DRY).
 */
export function DaftarDeskripsi({
  item,
  kolom = 2,
  className,
}: {
  item: ItemDeskripsi[];
  kolom?: 1 | 2 | 3;
  className?: string;
}) {
  const kelasPenuh = kolom === 1 ? undefined : kolom === 2 ? "sm:col-span-2" : "sm:col-span-2 lg:col-span-3";

  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-5",
        kolom === 2 && "sm:grid-cols-2",
        kolom === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {item.map((baris) => (
        <div
          key={baris.label}
          className={cn("flex flex-col gap-1", baris.penuh && kelasPenuh)}
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            {baris.label}
          </dt>
          <dd className="text-sm break-words text-ink">{baris.nilai}</dd>
        </div>
      ))}
    </dl>
  );
}
