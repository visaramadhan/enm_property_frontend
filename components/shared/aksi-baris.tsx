"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AksiBarisItem {
  label: string;
  ikon?: LucideIcon;
  onPilih: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

/**
 * Menu aksi baris tabel (tiga titik) yang dipakai seluruh halaman daftar.
 *
 * Menjaga posisi, animasi, dan gaya menu tetap sama di setiap modul (DRY)
 * sehingga halaman hanya mendeklarasikan daftar aksinya.
 */
export function AksiBaris({
  aksi,
  label = "Aksi baris",
}: {
  aksi: AksiBarisItem[];
  label?: string;
}) {
  if (aksi.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {aksi.map((item) => (
          <DropdownMenuItem
            key={item.label}
            variant={item.variant}
            disabled={item.disabled}
            onSelect={() => item.onPilih()}
          >
            {item.ikon ? <item.ikon /> : null}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
