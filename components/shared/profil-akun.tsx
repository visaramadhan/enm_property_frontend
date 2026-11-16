"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { TextField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerbaruiProfilSaya, useProfilSaya } from "@/lib/api/hooks";
import { LABEL, LABEL_PERAN } from "@/lib/enum";
import { formatWib, inisialDari } from "@/lib/format";
import type { UserView } from "@/types/api";

/**
 * Halaman "Profil Saya" bersama.
 *
 * Dipakai dashboard admin, mitra, dan owner sehingga formulir penyuntingan
 * akun (`PUT /me`) hanya ditulis satu kali (DRY). Data dibaca melalui
 * `useProfilSaya` dan disimpan melalui `usePerbaruiProfilSaya`.
 */

/** Skema validasi dibuat per pemanggil agar pesan error mengikuti bahasa aktif. */
function buatSkemaProfil(t: (teks: string) => string) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(3, t("Nama minimal 3 karakter"))
      .max(100, t("Nama maksimal 100 karakter")),
    phone: z
      .string()
      .trim()
      .refine(
        (nilai) => nilai === "" || (nilai.length >= 8 && nilai.length <= 20),
        t("Nomor telepon 8-20 digit"),
      ),
  });
}

type NilaiProfil = z.infer<ReturnType<typeof buatSkemaProfil>>;

function KartuProfil({ pengguna }: { pengguna: UserView }) {
  const { t } = useBahasa();
  const skemaProfil = React.useMemo(() => buatSkemaProfil(t), [t]);
  const simpan = usePerbaruiProfilSaya();
  const form = useForm<NilaiProfil>({
    resolver: zodResolver(skemaProfil),
    defaultValues: { name: pengguna.name, phone: pengguna.phone ?? "" },
  });

  const awal = { name: pengguna.name, phone: pengguna.phone ?? "" };
  const berubah = form.watch("name").trim() !== awal.name || form.watch("phone").trim() !== awal.phone;

  async function kirim(nilai: NilaiProfil) {
    try {
      await simpan.mutateAsync({
        name: nilai.name.trim(),
        phone: nilai.phone.trim() || undefined,
      });
      form.reset({ name: nilai.name.trim(), phone: nilai.phone.trim() });
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t("Identitas Akun")}</CardTitle>
          <CardDescription>{t("Perbarui nama tampilan dan nomor telepon Anda.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(kirim)} noValidate className="flex flex-col gap-5">
            <div className="flex items-center gap-4 rounded-card border border-divider bg-hover/50 p-4">
              <Avatar size="lg">
                {pengguna.avatar_url ? <AvatarImage src={pengguna.avatar_url} alt="" /> : null}
                <AvatarFallback>{inisialDari(pengguna.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-semibold text-ink">{pengguna.name}</span>
                <span className="truncate text-[13px] text-ink-muted">{pengguna.email}</span>
              </div>
            </div>

            <TextField
              control={form.control}
              name="name"
              label={t("Nama lengkap")}
              wajib
              autoComplete="name"
            />
            <TextField
              control={form.control}
              name="phone"
              label={t("Nomor telepon")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              deskripsi={t("Opsional, 8-20 digit.")}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={simpan.isPending || !berubah}>
                {simpan.isPending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save />}
                {t("Simpan perubahan")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Informasi Akun")}</CardTitle>
          <CardDescription>{t("Data ini hanya dapat diubah oleh superadmin.")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{LABEL_PERAN[pengguna.role]}</Badge>
            <StatusBadge jenis="pengguna" status={pengguna.status} label={LABEL.statusPengguna[pengguna.status]} />
            {pengguna.email_verified ? (
              <StatusBadge jenis="pengguna" status="active" label={t("Email terverifikasi")} />
            ) : (
              <StatusBadge
                jenis="properti"
                status="pending_review"
                label={t("Email belum terverifikasi")}
              />
            )}
          </div>

          <DaftarDeskripsi
            kolom={1}
            item={[
              { label: t("Email"), nilai: pengguna.email },
              {
                label: t("Terakhir masuk"),
                nilai: pengguna.last_login_at
                  ? formatWib(pengguna.last_login_at)
                  : t("Belum pernah"),
              },
              { label: t("Terdaftar"), nilai: formatWib(pengguna.created_at) },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function ProfilAkun({
  judul,
  deskripsi,
  tanpaHeader = false,
  tombolBeranda = false,
  aksi,
}: {
  judul?: string;
  deskripsi?: string;
  /** Sembunyikan judul halaman bila komponen ini digabung dengan kartu lain. */
  tanpaHeader?: boolean;
  /** Tampilkan tombol "Kembali ke beranda" (halaman akun publik). */
  tombolBeranda?: boolean;
  /** Tombol tambahan di sisi kanan judul halaman (mis. tautan favorit). */
  aksi?: React.ReactNode;
}) {
  const { t } = useBahasa();
  const profil = useProfilSaya();
  const teksJudul = judul ?? t("Profil Saya");
  /* Halaman akun publik (tombolBeranda) memakai deskripsi versi penyewa. */
  const teksDeskripsi =
    deskripsi ??
    (tombolBeranda
      ? t("Perbarui identitas akun Anda dan lihat properti yang tersimpan.")
      : t("Kelola informasi akun dan keamanan Anda."));

  return (
    <>
      {tombolBeranda ? <TombolBeranda selaluTampil /> : null}
      {tanpaHeader ? null : (
        <PageHeader judul={teksJudul} deskripsi={teksDeskripsi} aksi={aksi} />
      )}
      <KontenAsync
        hasil={profil}
        skeleton={
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-card lg:col-span-2" />
            <Skeleton className="h-96 rounded-card" />
          </div>
        }
        judulGagal={t("Gagal memuat profil")}
      >
        {(pengguna) => <KartuProfil pengguna={pengguna} />}
      </KontenAsync>
    </>
  );
}
