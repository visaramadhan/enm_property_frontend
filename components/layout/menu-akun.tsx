"use client";

import Link from "next/link";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Store, UserCog } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfilSaya } from "@/lib/api/hooks";
import { useKeluar } from "@/lib/api/use-sesi";
import { inisialDari } from "@/lib/format";
import { useSudahTerpasang } from "@/lib/hooks/use-sudah-terpasang";
import { dashboardPeran } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { UserView } from "@/types/api";

/**
 * Menu akun sadar-sesi untuk kepala halaman publik.
 *
 * Sebelumnya tombol "Masuk" tampil statis sehingga pengguna yang sudah masuk
 * tetap melihatnya dan dapat membuka halaman masuk berulang kali. Komponen ini
 * membaca profil aktif lewat `useProfilSaya` (tersedia di seluruh halaman karena
 * `QueryClientProvider` dipasang di root) lalu menampilkan tautan masuk atau
 * menu akun sesuai keadaan sesi.
 *
 * Sesi hanya dibaca setelah komponen terpasang (`useSudahTerpasang`) agar
 * render pertama di klien tetap sama dengan HTML hasil prerender.
 */

/** Bagian data akun yang dipakai menu ini. */
type Akun = Pick<UserView, "name" | "email" | "role" | "avatar_url" | "partner">;

function IsiMenu({ akun, keluar }: { akun: Akun; keluar: () => Promise<void> }) {
  const berandaDashboard = dashboardPeran(akun.role);
  /* Pengguna dianggap mitra bila sudah memiliki profil kemitraan; peran `mitra`
     dipakai sebagai cadangan. Dipakai untuk mengganti tautan "Daftar Sebagai
     Mitra" menjadi tautan "Dashboard". */
  const terdaftarMitra = Boolean(akun.partner) || akun.role === "mitra";
  const tujuanDashboard = berandaDashboard !== "/" ? berandaDashboard : terdaftarMitra ? "/mitra" : null;

  return (
    <DropdownMenuContent align="end" className="w-60">
      <DropdownMenuLabel className="flex flex-col gap-0.5">
        <span className="truncate text-sm font-semibold normal-case tracking-normal text-ink">
          {akun.name}
        </span>
        <span className="truncate text-xs font-normal normal-case tracking-normal text-ink-muted">
          {akun.email}
        </span>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <Link href="/akun">
          <UserCog />
          Profil Saya
        </Link>
      </DropdownMenuItem>

      {akun.role === "customer" ? (
        <DropdownMenuItem asChild>
          <Link href="/akun/favorit">
            <Heart />
            Favorit Saya
          </Link>
        </DropdownMenuItem>
      ) : null}

      {!terdaftarMitra ? (
        <DropdownMenuItem asChild>
          <Link href="/daftar-mitra">
            <Store />
            Daftar Sebagai Mitra
          </Link>
        </DropdownMenuItem>
      ) : null}

      {tujuanDashboard ? (
        <DropdownMenuItem asChild>
          <Link href={tujuanDashboard}>
            <LayoutDashboard />
            Dashboard
          </Link>
        </DropdownMenuItem>
      ) : null}

      <DropdownMenuSeparator />

      <DropdownMenuItem variant="danger" onSelect={() => void keluar()}>
        <LogOut />
        Keluar
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export function MenuAkun({
  variasi = "tombol",
  className,
}: {
  /** `tombol`: pemicu berupa tombol di kepala halaman. `tautan`: tautan teks. */
  variasi?: "tombol" | "tautan";
  className?: string;
}) {
  const profil = useProfilSaya();
  const sudahTerpasang = useSudahTerpasang();
  const keluar = useKeluar();

  const akun: Akun | null = sudahTerpasang && profil.data ? profil.data : null;

  if (variasi === "tautan") {
    return (
      <Link href={akun ? "/akun" : "/login"} className={className}>
        {akun ? "Akun Saya" : "Masuk"}
      </Link>
    );
  }

  if (!akun) {
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href="/login">Masuk</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          aria-label={`Menu akun ${akun.name}`}
        >
          <Avatar size="sm">
            {akun.avatar_url ? <AvatarImage src={akun.avatar_url} alt="" /> : null}
            <AvatarFallback>{inisialDari(akun.name)}</AvatarFallback>
          </Avatar>
          <span className="max-w-[120px] truncate">{akun.name}</span>
          <ChevronDown className="shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <IsiMenu akun={akun} keluar={keluar} />
    </DropdownMenu>
  );
}
