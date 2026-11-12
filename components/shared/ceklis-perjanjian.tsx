"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/**
 * Daftar poin ceklis perjanjian yang dicentang satu per satu oleh mitra.
 *
 * Dipakai bersama oleh modal perjanjian saat mitra pertama masuk dashboard dan
 * dialog checkout paket sehingga tampilan persetujuan selalu identik (DRY).
 */
export function CeklisPersetujuan({
  poin,
  nilai,
  onUbah,
  disabled,
  className,
  idDasar = "ceklis-perjanjian",
}: {
  poin: string[];
  nilai: boolean[];
  onUbah: (indeks: number, tercentang: boolean) => void;
  disabled?: boolean;
  className?: string;
  idDasar?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {poin.map((teks, indeks) => {
        const id = `${idDasar}-${indeks}`;
        return (
          <li key={id}>
            <label htmlFor={id} className="flex items-start gap-2.5 text-[13px] text-ink">
              <Checkbox
                id={id}
                className="mt-0.5"
                disabled={disabled}
                checked={Boolean(nilai[indeks])}
                onCheckedChange={(tercentang) => onUbah(indeks, tercentang === true)}
              />
              <span>{teks}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
