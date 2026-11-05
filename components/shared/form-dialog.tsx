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
import { cn } from "@/lib/utils";

/**
 * Modal formulir bersama untuk seluruh aksi buat/ubah.
 *
 * Semua halaman memakai komponen ini sehingga animasi, ukuran panel, tombol
 * aksi, dan penanganan status memuat selalu identik (DRY). `children` diisi
 * field-field dari `components/shared/form-field.tsx`.
 */
export function FormDialog({
  terbuka,
  onUbahTerbuka,
  judul,
  deskripsi,
  children,
  onSubmit,
  labelKirim = "Simpan",
  labelBatal = "Batal",
  memuat = false,
  ukuran = "max-w-lg",
}: {
  terbuka: boolean;
  onUbahTerbuka: (terbuka: boolean) => void;
  judul: string;
  deskripsi?: string;
  children: React.ReactNode;
  onSubmit: () => void;
  labelKirim?: string;
  labelBatal?: string;
  memuat?: boolean;
  ukuran?: string;
}) {
  return (
    <Dialog
      open={terbuka}
      onOpenChange={(nilai) => {
        // Cegah modal tertutup saat permintaan masih berjalan.
        if (!memuat) onUbahTerbuka(nilai);
      }}
    >
      <DialogContent className={cn(ukuran)}>
        <DialogHeader>
          <DialogTitle>{judul}</DialogTitle>
          {deskripsi ? <DialogDescription>{deskripsi}</DialogDescription> : null}
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-5"
        >
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
            <Button type="submit" disabled={memuat}>
              {memuat ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              {labelKirim}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
