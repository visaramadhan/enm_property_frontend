"use client";

import Link from "next/link";

import { inisialSitus, useIdentitasSitus } from "@/components/shared/logo-situs";
import { cn } from "@/lib/utils";

/**
 * Elemen brand area autentikasi yang nilainya diambil dari pengaturan sistem
 * (`site_name`, `site_logo_url`, `login_image_url`), sehingga admin dapat
 * mengganti logo dan gambar panel masuk tanpa mengubah kode.
 *
 * Logika pembacaan identitas situs dipusatkan pada `shared/logo-situs.tsx`
 * (dipakai juga header publik, landing, dan dashboard) agar hanya ditulis sekali.
 */

/** Langkah pengenalan mitra pada panel brand area masuk. */
const LANGKAH = [
  {
    nomor: "01",
    judul: "Daftar & pilih paket",
    deskripsi: "Buat akun mitra lalu pilih paket langganan sesuai kebutuhan listing.",
  },
  {
    nomor: "02",
    judul: "Unggah properti",
    deskripsi: "Lengkapi data properti, foto, dan harga sewa dalam satu formulir.",
  },
  {
    nomor: "03",
    judul: "Terima leads",
    deskripsi: "Pantau performa listing dan tindak lanjuti calon penyewa.",
  },
];

/** Dua konteks warna: `terang` untuk latar putih, `gelap` untuk panel gelap. */
const GAYA = {
  terang: { nama: "text-ink", keterangan: "text-ink-muted" },
  gelap: { nama: "text-secondary-foreground", keterangan: "text-secondary-foreground/60" },
} as const;

/** Logo + nama situs yang dapat diubah admin melalui Pengaturan Sistem. */
export function LogoBrand({
  variasi = "terang",
  className,
}: {
  variasi?: keyof typeof GAYA;
  className?: string;
}) {
  const situs = useIdentitasSitus();
  const gaya = GAYA[variasi];

  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      {situs.logo_url ? (
        /* URL logo diatur admin sehingga host-nya berubah-ubah dan tidak dapat
           didaftarkan pada `images.remotePatterns`. */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={situs.logo_url}
          alt={situs.site_name}
          className="size-10 shrink-0 rounded-field object-cover"
        />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-field bg-primary text-sm font-bold text-primary-foreground">
          {inisialSitus(situs.site_name)}
        </span>
      )}
      <span className="flex flex-col">
        <span className={cn("text-sm font-semibold", gaya.nama)}>{situs.site_name}</span>
        <span className={cn("text-xs", gaya.keterangan)}>Platform Listing Properti</span>
      </span>
    </Link>
  );
}

/** Panel brand area autentikasi untuk layar lebar. */
export function PanelBrandAuth() {
  const situs = useIdentitasSitus();

  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-12 text-secondary-foreground lg:flex">
      {situs.login_image_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={situs.login_image_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
          />
          {/* Lapisan warna brand agar teks tetap terbaca di atas gambar. */}
          <div aria-hidden="true" className="absolute inset-0 bg-secondary/80" />
        </>
      ) : null}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(226,160,63,.20),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(200,90,50,.28),transparent_55%)]"
      />

      <LogoBrand variasi="gelap" className="relative" />

      <div className="relative flex flex-col gap-8">
        <h2 className="max-w-md text-3xl font-semibold leading-snug">
          Kelola listing properti Anda dari satu dashboard.
        </h2>

        <ol className="flex flex-col gap-6">
          {LANGKAH.map((item) => (
            <li key={item.nomor} className="flex gap-4">
              <span
                data-numeric
                className="text-sm font-semibold tracking-[.04em] text-accent"
                aria-hidden="true"
              >
                {item.nomor}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold">{item.judul}</span>
                <span className="max-w-sm text-sm text-secondary-foreground/70">
                  {item.deskripsi}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="relative text-xs text-secondary-foreground/50">
        &copy; {situs.site_name}. Seluruh harga dalam Rupiah (IDR) dan waktu WIB.
      </p>
    </aside>
  );
}
