"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Kunci `sessionStorage` penanda bahwa pengunjung membuka beranda pada tab ini.
 *
 * Referrer browser tidak berubah saat navigasi antar-halaman sisi klien
 * (App Router), sehingga asal kunjungan perlu ditandai sendiri agar tombol
 * "Kembali ke beranda" hanya muncul untuk pengunjung yang memang dari beranda.
 */
const KUNCI_ASAL_BERANDA = "enm:asal-beranda";

/** Menandai bahwa pengunjung membuka beranda. Dipasang di halaman utama. */
export function PenandaAsalBeranda() {
  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(KUNCI_ASAL_BERANDA, "1");
    } catch {
      // Penyimpanan diblokir (mode privat): cukup andalkan referrer.
    }
  }, []);

  return null;
}

/** Membaca penanda asal beranda; aman dipanggil hanya di sisi klien. */
function dariBeranda() {
  try {
    if (window.sessionStorage.getItem(KUNCI_ASAL_BERANDA) === "1") return true;
  } catch {
    // Lanjut ke pemeriksaan referrer.
  }

  if (!document.referrer) return false;
  try {
    const rujukan = new URL(document.referrer);
    return rujukan.origin === window.location.origin && rujukan.pathname === "/";
  } catch {
    return false;
  }
}

/** Tanpa langganan: nilai dibaca sekali tiap render, bukan dari store eksternal. */
const tanpaLangganan = () => () => {};

/**
 * Membaca penanda asal beranda lewat `useSyncExternalStore` agar aman terhadap
 * prerender (snapshot server `false`) sekaligus tidak memicu setState di effect.
 */
function useDariBeranda() {
  return React.useSyncExternalStore(tanpaLangganan, dariBeranda, () => false);
}

/**
 * Tombol "Kembali ke beranda" untuk halaman publik.
 *
 * Secara bawaan hanya tampil bila pengunjung datang dari beranda. Setel
 * `selaluTampil` pada halaman yang memang selalu memerlukannya (mis. katalog).
 */
export function TombolBeranda({
  selaluTampil = false,
  className,
}: {
  selaluTampil?: boolean;
  className?: string;
}) {
  const berasalDariBeranda = useDariBeranda();

  if (!selaluTampil && !berasalDariBeranda) return null;

  return (
    <Button variant="ghost" size="sm" asChild className={cn("self-start", className)}>
      <Link href="/">
        <ArrowLeft />
        Kembali ke beranda
      </Link>
    </Button>
  );
}
