"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Meta } from "@/types/api";

/** Menyusun nomor halaman yang tampil beserta penanda lompatan (`null`). */
function nomorHalaman(aktif: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const dipilih = new Set<number>([1, total, aktif]);
  for (let i = aktif - 1; i <= aktif + 1; i += 1) {
    if (i > 1 && i < total) dipilih.add(i);
  }

  const urut = [...dipilih].sort((a, b) => a - b);
  const hasil: (number | null)[] = [];
  urut.forEach((nomor, indeks) => {
    if (indeks > 0 && nomor - urut[indeks - 1] > 1) hasil.push(null);
    hasil.push(nomor);
  });
  return hasil;
}

/**
 * Kontrol paginasi sisi server yang membaca `meta` dari `apiGetPaginated`.
 */
export function Pagination({
  meta,
  onUbahHalaman,
  satuan = "data",
  className,
}: {
  meta?: Meta;
  onUbahHalaman: (halaman: number) => void;
  satuan?: string;
  className?: string;
}) {
  if (!meta || meta.total <= 0) return null;

  const total = Math.max(meta.total_pages, 1);
  const aktif = Math.min(Math.max(meta.page, 1), total);
  const awal = (aktif - 1) * meta.per_page + 1;
  const akhir = Math.min(aktif * meta.per_page, meta.total);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-divider px-4 py-3 sm:flex-row",
        className,
      )}
    >
      <p className="text-[13px] text-ink-muted">
        Menampilkan{" "}
        <span data-numeric className="font-medium text-ink">
          {formatAngka(awal)}-{formatAngka(akhir)}
        </span>{" "}
        dari{" "}
        <span data-numeric className="font-medium text-ink">
          {formatAngka(meta.total)}
        </span>{" "}
        {satuan}
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Halaman sebelumnya"
          disabled={aktif <= 1}
          onClick={() => onUbahHalaman(aktif - 1)}
        >
          <ChevronLeft />
        </Button>

        {nomorHalaman(aktif, total).map((nomor, indeks) =>
          nomor === null ? (
            <span
              key={`lompat-${indeks}`}
              aria-hidden="true"
              className="px-1 text-sm text-ink-subtle"
            >
              &hellip;
            </span>
          ) : (
            <Button
              key={nomor}
              type="button"
              variant={nomor === aktif ? "primary" : "outline"}
              size="icon-sm"
              aria-label={`Halaman ${nomor}`}
              aria-current={nomor === aktif ? "page" : undefined}
              onClick={() => onUbahHalaman(nomor)}
            >
              <span data-numeric>{nomor}</span>
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Halaman berikutnya"
          disabled={aktif >= total}
          onClick={() => onUbahHalaman(aktif + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
