"use client";

import { Search } from "lucide-react";

import { NILAI_SEMUA, type OpsiSelect } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface KolomFilter {
  kunci: string;
  label: string;
  nilai?: string;
  opsi: readonly OpsiSelect[];
  /** Dipanggil dengan `undefined` ketika pilihan "Semua" dipilih. */
  onUbah: (nilai: string | undefined) => void;
  lebar?: string;
}

/**
 * Baris pencarian + dropdown filter yang dipakai seluruh halaman daftar.
 *
 * Kolom pencarian dikendalikan langsung oleh pemanggil; penundaan (debounce)
 * ditangani `useTabelQuery` sehingga tidak ada state ganda.
 */
export function FilterBar({
  nilaiCari,
  onCari,
  placeholder = "Cari...",
  filter = [],
  aksi,
  className,
}: {
  nilaiCari?: string;
  onCari?: (nilai: string) => void;
  placeholder?: string;
  filter?: KolomFilter[];
  aksi?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row lg:items-center", className)}>
      {onCari ? (
        <div className="relative w-full lg:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={nilaiCari ?? ""}
            onChange={(event) => onCari(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="pl-9"
          />
        </div>
      ) : null}

      {filter.map((item) => (
        <Select
          key={item.kunci}
          value={item.nilai ?? NILAI_SEMUA}
          onValueChange={(nilai) => item.onUbah(nilai === NILAI_SEMUA ? undefined : nilai)}
        >
          <SelectTrigger className={cn("w-full lg:w-48", item.lebar)} aria-label={item.label}>
            <SelectValue placeholder={item.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NILAI_SEMUA}>{item.label}: Semua</SelectItem>
            {item.opsi.map((opsi) => (
              <SelectItem key={opsi.nilai} value={opsi.nilai}>
                {opsi.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {aksi ? <div className="flex flex-wrap items-center gap-2 lg:ml-auto">{aksi}</div> : null}
    </div>
  );
}
