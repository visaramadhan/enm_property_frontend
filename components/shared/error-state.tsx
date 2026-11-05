"use client";

import { RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pesanErrorApi } from "@/lib/api/client";

/** Keadaan gagal memuat data, dengan tombol coba lagi. */
export function ErrorState({
  error,
  judul = "Gagal memuat data",
  onCobaLagi,
  className,
}: {
  error?: unknown;
  judul?: string;
  onCobaLagi?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className)}>
      <span
        className="grid size-12 place-items-center rounded-full bg-danger/10 text-danger"
        aria-hidden="true"
      >
        <TriangleAlert className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-ink">{judul}</p>
        <p className="max-w-md text-[13px] text-ink-muted">{pesanErrorApi(error)}</p>
      </div>
      {onCobaLagi ? (
        <Button variant="outline" size="sm" onClick={onCobaLagi}>
          <RotateCw />
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
