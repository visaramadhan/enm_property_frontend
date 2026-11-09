"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHapusFavorit, useProfilSaya, useTambahFavorit } from "@/lib/api/hooks";
import { useSudahTerpasang } from "@/lib/hooks/use-sudah-terpasang";
import { cn } from "@/lib/utils";
import type { PropertySummary } from "@/types/api";

/**
 * Tombol simpan/hapus properti ke daftar favorit pengunjung.
 *
 * Dipakai pada kartu katalog (ikon di sudut) dan panel detail properti
 * (tombol lebar). Status awal dibaca dari penanda `is_favorite` yang diisi
 * backend untuk pengunjung yang sudah masuk, lalu hasil mutasi terakhir dipakai
 * agar umpan balik terasa langsung tanpa menunggu daftar properti dimuat ulang.
 *
 * Pengunjung anonim diarahkan ke halaman masuk dengan tujuan kembali ke halaman
 * ini; peran selain `customer` tidak menampilkan tombol karena backend membatasi
 * `/me/favorites*` hanya untuk peran tersebut.
 */
export function TombolFavorit({
  properti,
  variasi = "ikon",
  className,
}: {
  properti: PropertySummary;
  /** `ikon`: tombol kecil di atas gambar. `tombol`: tombol lebar berlabel. */
  variasi?: "ikon" | "tombol";
  className?: string;
}) {
  const profil = useProfilSaya();
  const sudahTerpasang = useSudahTerpasang();
  const tambah = useTambahFavorit();
  const hapus = useHapusFavorit();
  const router = useRouter();
  const pathname = usePathname();

  /* Sesi hanya dipakai setelah komponen terpasang agar render pertama di klien
     tetap sama dengan hasil prerender (anonim). */
  const pengguna = sudahTerpasang ? profil.data ?? null : null;

  /* Hasil mutasi terakhir menimpa penanda dari server sampai data terbaru
     tiba, sehingga ikon berubah seketika saat ditekan. */
  const [hasil, setHasil] = React.useState<boolean | null>(null);
  const tersimpan = hasil ?? properti.is_favorite;

  if (pengguna && pengguna.role !== "customer") return null;

  const sibuk = tambah.isPending || hapus.isPending;

  async function alihkan(peristiwa: React.MouseEvent) {
    /* Kartu properti seluruhnya tertutup tautan detail; klik favorit tidak
       boleh ikut membuka halaman detail. */
    peristiwa.preventDefault();
    peristiwa.stopPropagation();

    if (!pengguna) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      const balasan = tersimpan
        ? await hapus.mutateAsync(properti.id)
        : await tambah.mutateAsync(properti.id);
      setHasil(balasan.is_favorite);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const ikonHati = (
    <Heart className={cn(tersimpan && "fill-current text-primary")} aria-hidden="true" />
  );

  if (variasi === "tombol") {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn("w-full", className)}
        aria-pressed={tersimpan}
        disabled={sibuk}
        onClick={alihkan}
      >
        {sibuk ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : ikonHati}
        {tersimpan ? "Tersimpan di favorit" : "Simpan ke favorit"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn("rounded-full bg-surface/90 backdrop-blur", className)}
      aria-pressed={tersimpan}
      aria-label={tersimpan ? "Hapus dari favorit" : "Simpan ke favorit"}
      title={tersimpan ? "Hapus dari favorit" : "Simpan ke favorit"}
      disabled={sibuk}
      onClick={alihkan}
    >
      {sibuk ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : ikonHati}
    </Button>
  );
}
