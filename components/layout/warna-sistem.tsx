"use client";

import { useEffect } from "react";

import { useIdentitasSitus } from "@/components/shared/logo-situs";

/**
 * Menerapkan warna aksen sistem (Pengaturan Sistem → "Warna sistem") ke seluruh
 * antarmuka.
 *
 * Warna ditulis sebagai custom property `--color-primary` pada elemen `<html>`
 * sehingga token warna turunan (mis. focus ring) ikut menyesuaikan tanpa perlu
 * mengubah kode. Nilai hanya diubah setelah komponen terpasang agar HTML hasil
 * prerender tetap identik (bebas hydration mismatch), dan hanya diterapkan bila
 * berupa HEX enam digit yang valid.
 */
export function WarnaSistem() {
  const situs = useIdentitasSitus();
  const warna = ((situs as { brand_color?: string }).brand_color ?? "").trim();

  useEffect(() => {
    const akar = document.documentElement;
    if (/^#[0-9a-fA-F]{6}$/.test(warna)) {
      akar.style.setProperty("--color-primary", warna);
    } else {
      akar.style.removeProperty("--color-primary");
    }
  }, [warna]);

  return null;
}
