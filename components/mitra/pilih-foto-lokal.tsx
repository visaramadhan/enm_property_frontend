"use client";

import * as React from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Batas jumlah foto per listing, selaras dengan `MAX_PHOTOS_PER_PROPERTY` backend. */
export const MAKS_FOTO_LISTING = 10;

/**
 * Pemilih foto lokal untuk formulir tambah listing.
 *
 * Foto belum dapat diunggah ke backend sebelum properti tersimpan (endpoint
 * unggah membutuhkan ID properti). Komponen ini menahan berkas di sisi klien
 * beserta pratinjaunya; halaman pemanggil mengunggahnya setelah properti dibuat.
 */
export function PilihFotoLokal({
  berkas,
  onUbah,
  maksimal = MAKS_FOTO_LISTING,
}: {
  berkas: File[];
  onUbah: (berkas: File[]) => void;
  maksimal?: number;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Pratinjau memakai object URL yang dibebaskan kembali saat daftar berubah
  // atau komponen dilepas agar tidak menahan memori berkas.
  const pratinjau = React.useMemo(() => berkas.map((file) => URL.createObjectURL(file)), [berkas]);
  React.useEffect(() => () => pratinjau.forEach((url) => URL.revokeObjectURL(url)), [pratinjau]);

  function pilih(event: React.ChangeEvent<HTMLInputElement>) {
    const dipilih = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (dipilih.length === 0) return;
    onUbah([...berkas, ...dipilih].slice(0, maksimal));
  }

  function hapus(indeks: number) {
    onUbah(berkas.filter((_, i) => i !== indeks));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Foto Properti</CardTitle>
          <CardDescription>
            Pilih hingga {maksimal} foto. Foto pertama menjadi sampul listing.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={berkas.length >= maksimal}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus />
          Pilih foto
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={pilih}
        />
      </CardHeader>

      <CardContent>
        {berkas.length === 0 ? (
          <p className="rounded-sm border border-dashed border-line px-4 py-6 text-center text-[13px] text-ink-muted">
            Belum ada foto dipilih. Foto akan diunggah otomatis setelah properti tersimpan.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pratinjau.map((url, indeks) => (
              <li
                key={url}
                className="overflow-hidden rounded-card border border-line bg-hover"
              >
                {/* Pratinjau berkas lokal (blob URL) tidak melalui `next/image`. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-center justify-between gap-1 border-t border-divider bg-surface p-1.5">
                  <span className="pl-1 text-xs text-ink-muted">
                    {indeks === 0 ? "Sampul" : `Foto ${indeks + 1}`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hapus foto"
                    onClick={() => hapus(indeks)}
                  >
                    <Trash2 className="text-danger" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
