"use client";

import { MenuAkun } from "@/components/layout/menu-akun";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { LogoHeader } from "@/components/shared/logo-situs";
import { ToggleBahasa } from "@/components/shared/toggle-bahasa";

/**
 * Kepala halaman ringan untuk area publik (katalog paket & checkout).
 *
 * Dipakai bersama oleh tata letak `/paket` dan `/checkout` agar identitas brand
 * dan tinggi bilah atas seragam tanpa menggandakan penanda (DRY). Logo dan nama
 * situs dibaca dari pengaturan admin (`LogoHeader`) sehingga perubahan logo
 * langsung tampil di sini.
 *
 * Sakelar bahasa ikut ditampilkan agar pengunjung dapat mengganti bahasa pada
 * halaman publik maupun area checkout.
 */
export function HeaderPublik({ tagline }: { tagline: string }) {
  const { t } = useBahasa();

  return (
    <header className="sticky top-0 z-30 flex h-[66px] items-center gap-3 border-b border-line bg-surface/96 px-4 backdrop-blur lg:px-8">
      <LogoHeader
        tagline={t(tagline)}
        kelasMark="size-9 rounded-md bg-secondary text-[12px] font-extrabold text-secondary-foreground"
      />

      <div className="ml-auto flex items-center gap-2">
        <ToggleBahasa />
        <MenuAkun />
      </div>
    </header>
  );
}
