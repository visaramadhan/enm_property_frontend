"use client";

import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { lacakEvent } from "@/lib/analytics";

type VarianTombol = VariantProps<typeof Button>["variant"];
type UkuranTombol = VariantProps<typeof Button>["size"];

interface PropsTombolLacak {
  /** Tujuan internal tautan. */
  href: string;
  /** Nama bagian halaman, mis. `hero_banner` atau `cta_mitra`. */
  section: string;
  /** Label tombol yang tercatat pada GA4 (biasanya teks dinamis dari CMS). */
  label: string;
  children: ReactNode;
  variant?: VarianTombol;
  size?: UkuranTombol;
  className?: string;
}

/**
 * Tautan aksi landing page yang mengirim event GA4 `landing_page_cta_click`.
 *
 * Semua tombol landing yang teksnya berasal dari CMS memakai komponen ini agar
 * penamaan event dan parameternya seragam (`standar_cms.txt` bagian 4).
 */
export function TombolLacak({
  href,
  section,
  label,
  children,
  variant,
  size,
  className,
}: PropsTombolLacak) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link
        href={href}
        onClick={() => lacakEvent("landing_page_cta_click", { section_name: section, cta_label: label })}
      >
        {children}
      </Link>
    </Button>
  );
}
