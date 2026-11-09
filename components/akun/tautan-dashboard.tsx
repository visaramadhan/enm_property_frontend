"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProfilSaya } from "@/lib/api/hooks";

/**
 * Tautan menuju dashboard mitra pada kepala halaman profil.
 *
 * Hanya tampil untuk pengguna yang sudah terdaftar sebagai mitra (memiliki
 * profil kemitraan) sehingga pengunjung biasa tidak diarahkan ke area yang
 * tidak dapat mereka akses. Render awal (belum ada data profil) tidak
 * menampilkan apa pun agar tidak terjadi hydration mismatch.
 */
export function TautanDashboard() {
  const profil = useProfilSaya();

  if (!profil.data?.partner) return null;

  return (
    <Button asChild>
      <Link href="/mitra">
        <LayoutDashboard />
        Dashboard
      </Link>
    </Button>
  );
}
