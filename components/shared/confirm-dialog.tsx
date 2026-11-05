"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Modal konfirmasi bersama (hapus, ubah status, aktivasi, dsb).
 *
 * Karena memakai `components/ui/dialog.tsx` yang sama, seluruh halaman
 * mendapat animasi, fokus, dan gaya panel yang identik tanpa duplikasi.
 */
export function ConfirmDialog({
  terbuka,
  onUbahTerbuka,
  judul,
  deskripsi,
  labelKonfirmasi = "Konfirmasi",
  labelBatal = "Batal",
  variant = "primary",
  memuat = false,
  onKonfirmasi,
  children,
}: {
  terbuka: boolean;
  onUbahTerbuka: (terbuka: boolean) => void;
  judul: string;
  deskripsi?: string;
  labelKonfirmasi?: string;
  labelBatal?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  memuat?: boolean;
  onKonfirmasi: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Dialog open={terbuka} onOpenChange={onUbahTerbuka}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{judul}</DialogTitle>
          {deskripsi ? <DialogDescription>{deskripsi}</DialogDescription> : null}
        </DialogHeader>

        {children}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onUbahTerbuka(false)}
            disabled={memuat}
          >
            {labelBatal}
          </Button>
          <Button type="button" variant={variant} onClick={onKonfirmasi} disabled={memuat}>
            {memuat ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
            {labelKonfirmasi}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
