"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Modal baca-saja bersama (rincian mitra, detail invoice, tautan reset sandi).
 *
 * Dipakai seluruh halaman yang menampilkan rincian tanpa formulir sehingga
 * animasi, ukuran panel, dan tata letak judul tetap seragam tanpa menulis
 * ulang struktur `Dialog` di setiap halaman (DRY).
 */
export function DetailDialog({
  terbuka,
  onUbahTerbuka,
  judul,
  deskripsi,
  children,
  footer,
  ukuran = "max-w-2xl",
}: {
  terbuka: boolean;
  onUbahTerbuka: (terbuka: boolean) => void;
  judul: string;
  deskripsi?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ukuran?: string;
}) {
  return (
    <Dialog open={terbuka} onOpenChange={onUbahTerbuka}>
      <DialogContent className={cn(ukuran)}>
        <DialogHeader>
          <DialogTitle>{judul}</DialogTitle>
          {deskripsi ? <DialogDescription>{deskripsi}</DialogDescription> : null}
        </DialogHeader>

        {children}

        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
