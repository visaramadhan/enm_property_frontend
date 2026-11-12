"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { BidangMitra, keRegisterPartner, nilaiDariMitra, skemaMitra, type NilaiMitra } from "@/components/mitra/form-mitra";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { ProfilAkun } from "@/components/shared/profil-akun";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanggananMitra, usePerbaruiProfilMitra, usePengaturanPublik, useProfilMitra } from "@/lib/api/hooks";
import { formatTanggalWib } from "@/lib/format";
import type { PartnerView } from "@/types/api";

/**
 * Halaman Profil Mitra.
 *
 * Menggabungkan dua sumber data: data badan usaha (`/vendor/profile`) dan
 * data akun pengguna (`/me`, lewat `ProfilAkun`). Formulir badan usaha
 * memakai ulang skema & bidang dari `form-mitra.tsx` sehingga tidak ada
 * duplikasi aturan validasi (DRY).
 */
export function ProfilMitra() {
  const profil = useProfilMitra();
  const langganan = useLanggananMitra();
  const pengaturan = usePengaturanPublik();

  // Nomor WhatsApp hanya dapat diisi bila paket mitra mengizinkannya. Paket
  // Gratis memakai nomor sistem; bila nomor sistem belum diatur, bidang
  // dibiarkan dapat disunting agar mitra tidak kehilangan kontaknya.
  const whatsappAktif = langganan.data?.whatsapp_access ?? true;
  const nomorSistem = pengaturan.data?.contact_whatsapp ?? "";

  return (
    <>
      <PageHeader
        judul="Profil Mitra"
        deskripsi="Lengkapi data badan usaha dan informasi akun kemitraan Anda."
      />

      <KontenAsync
        hasil={profil}
        skeleton={
          <div className="flex flex-col gap-6">
            <Skeleton className="h-40 rounded-card" />
            <Skeleton className="h-96 rounded-card" />
          </div>
        }
        judulGagal="Gagal memuat profil mitra"
      >
        {(mitra) => (
          <div className="flex flex-col gap-6">
            <KartuStatusMitra mitra={mitra} />
            <FormulirMitra mitra={mitra} whatsappAktif={whatsappAktif} nomorSistem={nomorSistem} />
          </div>
        )}
      </KontenAsync>

      <ProfilAkun deskripsi="Perbarui nama tampilan dan nomor telepon akun Anda." />
    </>
  );
}

/** Ringkasan status kemitraan dan persetujuan perjanjian. */
function KartuStatusMitra({ mitra }: { mitra: PartnerView }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Status Kemitraan</CardTitle>
          <CardDescription>Status akun mitra Anda.</CardDescription>
        </div>
        <StatusBadge jenis="mitra" status={mitra.status} label={mitra.status_label} />
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <DaftarDeskripsi
          kolom={3}
          item={[
            { label: "Mitra sejak", nilai: mitra.joined_at ? formatTanggalWib(mitra.joined_at) : "-" },
            {
              label: "Perjanjian",
              nilai: mitra.agreement_accepted_at
                ? `Disetujui ${formatTanggalWib(mitra.agreement_accepted_at)}`
                : "Belum disetujui",
            },
            { label: "Wilayah", nilai: `${mitra.city}, ${mitra.province}` },
          ]}
        />

        {mitra.status === "suspended" && mitra.suspended_reason ? (
          <p className="rounded-field border border-danger-border bg-danger-tint p-4 text-[13px] text-danger-ink">
            <span className="font-semibold">Alasan penangguhan: </span>
            {mitra.suspended_reason}
          </p>
        ) : null}

        {mitra.agreement_accepted_at ? (
          <p className="flex items-center gap-2 rounded-field border border-note-border bg-note-bg p-4 text-[13px] text-secondary">
            <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
            Perjanjian kemitraan Anda telah tercatat dan berlaku.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Formulir penyuntingan data badan usaha mitra. */
function FormulirMitra({
  mitra,
  whatsappAktif,
  nomorSistem,
}: {
  mitra: PartnerView;
  whatsappAktif: boolean;
  nomorSistem: string;
}) {
  const simpan = usePerbaruiProfilMitra();

  // Saat nomor WhatsApp dikelola sistem, bidang nomor diisi nomor sistem agar
  // tampil transparan kepada mitra (sendiri, tanpa bisa disunting).
  const dibatasi = !whatsappAktif && nomorSistem.trim() !== "";
  const nilaiAwal = React.useMemo(
    () => (dibatasi ? { ...nilaiDariMitra(mitra), phone: nomorSistem } : nilaiDariMitra(mitra)),
    [mitra, dibatasi, nomorSistem],
  );

  const form = useForm<NilaiMitra>({
    resolver: zodResolver(skemaMitra),
    defaultValues: nilaiAwal,
  });

  React.useEffect(() => {
    form.reset(nilaiAwal);
  }, [form, nilaiAwal]);

  async function kirim(nilai: NilaiMitra) {
    try {
      const hasil = await simpan.mutateAsync(keRegisterPartner(nilai));
      form.reset(dibatasi ? { ...nilaiDariMitra(hasil), phone: nomorSistem } : nilaiDariMitra(hasil));
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Badan Usaha</CardTitle>
        <CardDescription>
          Informasi ini tampil pada halaman properti dan kontak calon penyewa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(kirim)} noValidate className="flex flex-col gap-6">
          <BidangMitra control={form.control} whatsappAktif={whatsappAktif} nomorSistem={nomorSistem} />
          <div className="flex justify-end">
            <Button type="submit" disabled={simpan.isPending}>
              {simpan.isPending ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Save />
              )}
              Simpan data
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
