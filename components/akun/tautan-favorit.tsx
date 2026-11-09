"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProfilSaya } from "@/lib/api/hooks";

/**
 * Tautan menuju daftar favorit pada kepala halaman profil.
 *
 * Hanya tampil untuk peran `customer` karena backend membatasi `/me/favorites*`
 * untuk peran tersebut; render awal (belum ada data profil) tidak menampilkan
 * apa pun sehingga tidak terjadi hydration mismatch.
 */
export function TautanFavorit() {
  const profil = useProfilSaya();

  if (profil.data?.role !== "customer") return null;

  return (
    <Button variant="outline" asChild>
      <Link href="/akun/favorit">
        <Heart />
        Favorit Saya
      </Link>
    </Button>
  );
}
