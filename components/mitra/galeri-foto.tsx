"use client";

import * as React from "react";
import { ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHapusFotoMitra, useTetapkanFotoUtama, useUnggahFotoMitra } from "@/lib/api/hooks";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PhotoView } from "@/types/api";

/**
 * Galeri foto properti mitra (unggah, tetapkan foto utama, hapus).
 *
 * Dipakai halaman Ubah Properti sehingga seluruh aksi media memakai mutasi
 * yang sama dengan daftar properti dan tidak ada logika unggah yang ditulis
 * ulang di halaman lain (DRY).
 */
export function GaleriFoto({ propertiId, foto }: { propertiId: string; foto: PhotoView[] }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const unggah = useUnggahFotoMitra();
  const hapus = useHapusFotoMitra();
  const utama = useTetapkanFotoUtama();
  const [targetHapus, setTargetHapus] = React.useState<PhotoView | null>(null);

  async function pilihBerkas(event: React.ChangeEvent<HTMLInputElement>) {
    const berkas = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (berkas.length === 0) return;
    try {
      await unggah.mutateAsync({ propertyId: propertiId, files: berkas });
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function tetapkanUtama(photoId: string) {
    try {
      await utama.mutateAsync({ propertyId: propertiId, photoId });
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function konfirmasiHapus() {
    if (!targetHapus) return;
    try {
      await hapus.mutateAsync({ propertyId: propertiId, photoId: targetHapus.id });
      setTargetHapus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const sedangMengubah = unggah.isPending || hapus.isPending || utama.isPending;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Galeri Foto</CardTitle>
          <CardDescription>
            {formatAngka(foto.length)} foto terunggah. Foto utama dipakai sebagai sampul listing.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={unggah.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {unggah.isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus />
          )}
          Unggah foto
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={pilihBerkas}
        />
      </CardHeader>

      <CardContent>
        {foto.length === 0 ? (
          <EmptyState
            ikon={ImagePlus}
            judul="Belum ada foto"
            deskripsi="Unggah minimal satu foto agar listing Anda lebih menarik calon penyewa maupun pembeli."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {foto.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-card border border-line bg-hover"
              >
                <div className="relative">
                  {/* Foto dilayani backend dengan host dinamis (`STORAGE_PUBLIC_BASE_URL`)
                      sehingga tidak dapat didaftarkan pada `images.remotePatterns`. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  {item.is_primary ? (
                    <Badge variant="accent" className="absolute left-2 top-2">
                      Utama
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-1 border-t border-divider bg-surface p-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Jadikan foto utama"
                    disabled={item.is_primary || sedangMengubah}
                    onClick={() => void tetapkanUtama(item.id)}
                  >
                    <Star className={cn(item.is_primary && "fill-accent text-accent")} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hapus foto"
                    disabled={sedangMengubah}
                    onClick={() => setTargetHapus(item)}
                  >
                    <Trash2 className="text-danger" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {targetHapus ? (
        <ConfirmDialog
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetHapus(null);
          }}
          judul="Hapus foto"
          deskripsi="Foto akan dihapus permanen dari listing ini."
          labelKonfirmasi="Hapus"
          variant="danger"
          memuat={hapus.isPending}
          onKonfirmasi={() => void konfirmasiHapus()}
        />
      ) : null}
    </Card>
  );
}
