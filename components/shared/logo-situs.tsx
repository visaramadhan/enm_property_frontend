"use client";

import Link from "next/link";

import { usePengaturanPublik } from "@/lib/api/hooks";
import { useSudahTerpasang } from "@/lib/hooks/use-sudah-terpasang";
import { cn } from "@/lib/utils";

/**
 * Identitas situs (nama + logo) yang dapat diubah admin melalui Pengaturan Sistem.
 *
 * Nilainya dibaca dari endpoint publik `/settings` sehingga perubahan logo oleh
 * admin langsung berdampak ke seluruh halaman (landing, katalog, dashboard, auth)
 * tanpa menyentuh kode. Selama pengaturan belum termuat dipakai nilai bawaan agar
 * tampilan tetap utuh dan hasil hidrasi identik dengan hasil prerender.
 */

/** Nilai bawaan ketika pengaturan belum termuat atau backend belum berjalan. */
export const BAWAAN_SITUS = {
  site_name: "ENM Property",
  nav_title: "ENM Property",
  logo_url: "",
  brand_color: "",
  login_image_url: "",
} as const;

/** Monogram nama situs bila logo belum diatur admin. */
export function inisialSitus(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return "EN";
  return kata
    .slice(0, 2)
    .map((bagian) => bagian.charAt(0))
    .join("")
    .toUpperCase();
}

/** Identitas situs siap pakai; aman dipanggil sebelum komponen terpasang. */
export function useIdentitasSitus() {
  const pengaturan = usePengaturanPublik();
  const sudahTerpasang = useSudahTerpasang();
  return sudahTerpasang && pengaturan.data ? pengaturan.data : BAWAAN_SITUS;
}

/**
 * Penanda logo situs: gambar yang diunggah admin, atau monogram bila belum ada.
 *
 * Kelas pembungkus diatur pemanggil agar ukuran dan warna tiap area tetap sesuai
 * design system.
 */
export function LogoMark({ className }: { className?: string }) {
  const situs = useIdentitasSitus();

  if (situs.logo_url) {
    return (
      /* URL logo diatur admin sehingga host-nya berubah-ubah dan tidak dapat
         didaftarkan pada `images.remotePatterns`. */
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={situs.logo_url}
        alt={situs.site_name}
        className={cn("shrink-0 object-cover", className)}
      />
    );
  }

  return (
    <span aria-hidden="true" className={cn("grid shrink-0 place-items-center", className)}>
      {inisialSitus(situs.site_name)}
    </span>
  );
}

/**
 * Brand ringkas (logo + nama, opsional tagline) untuk header publik/dashboard.
 *
 * Dipakai bersama agar penanda brand hanya ditulis satu kali (DRY) dan otomatis
 * mengikuti logo serta nama situs dari pengaturan admin.
 */
export function LogoHeader({
  tagline,
  kelasMark,
  kelasNama,
  kelasTagline,
  className,
  label = "Beranda",
}: {
  tagline?: string;
  kelasMark?: string;
  kelasNama?: string;
  kelasTagline?: string;
  className?: string;
  label?: string;
}) {
  const situs = useIdentitasSitus();

  return (
    <Link href="/" aria-label={label} className={cn("flex items-center gap-3", className)}>
      <LogoMark className={kelasMark} />
      <span className="flex min-w-0 flex-col">
        <span className={cn("truncate text-sm font-extrabold tracking-tight text-ink", kelasNama)}>
          {situs.nav_title || situs.site_name}
        </span>
        {tagline ? (
          <span
            className={cn(
              "truncate text-[10px] font-semibold tracking-[0.145em] text-ink-subtle uppercase",
              kelasTagline,
            )}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
