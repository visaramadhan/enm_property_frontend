"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, LoaderCircle, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { GaleriFoto } from "@/components/mitra/galeri-foto";
import { PilihFotoLokal } from "@/components/mitra/pilih-foto-lokal";
import {
  BidangProperti,
  kePermintaan,
  nilaiAwalProperti,
  nilaiDariProperti,
  skemaProperti,
  type NilaiProperti,
} from "@/components/properti/form-properti";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, pesanErrorApi } from "@/lib/api/client";
import {
  useBuatProperti,
  useDetailPropertiMitra,
  usePerbaruiProperti,
  useProfilMitra,
  useUnggahFotoMitra,
} from "@/lib/api/hooks";
import { formatAngka, formatRupiah, formatTanggalWib } from "@/lib/format";
import type { PropertyDetail } from "@/types/api";

/**
 * Formulir properti mitra (mode tambah & ubah).
 *
 * Skema, bidang, dan konversi nilai diambil dari `components/properti/form-properti.tsx`
 * sehingga aturan validasi hanya ditulis sekali (DRY). Penolakan paket dari
 * backend (403/422) ditampilkan sebagai peringatan di atas formulir agar mitra
 * memahami langkah yang dibutuhkan tanpa kehilangan isian yang sudah diketik.
 *
 * Pada mode tambah, foto dipilih lebih dulu secara lokal lalu diunggah otomatis
 * setelah properti tersimpan (endpoint unggah butuh ID properti).
 */

function KerangkaFormulir() {
  return (
    <>
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[540px] rounded-card lg:col-span-2" />
        <Skeleton className="h-72 rounded-card" />
      </div>
    </>
  );
}

function PanelProperti({
  mode,
  properti,
}: {
  mode: "baru" | "ubah";
  properti?: PropertyDetail;
}) {
  const router = useRouter();
  const buat = useBuatProperti();
  const ubah = usePerbaruiProperti();
  const unggah = useUnggahFotoMitra();
  const profil = useProfilMitra(mode === "baru");
  const [fotoBaru, setFotoBaru] = React.useState<File[]>([]);
  const form = useForm<NilaiProperti>({
    resolver: zodResolver(skemaProperti),
    defaultValues: properti ? nilaiDariProperti(properti) : nilaiAwalProperti,
  });

  const memuat = mode === "baru" ? buat.isPending || unggah.isPending : ubah.isPending;
  const galat = mode === "baru" ? buat.error : ubah.error;

  /* Backend menolak penyimpanan bila mitra belum memiliki paket aktif (403)
     atau kuota listing paket sudah penuh (422). */
  const blokirPaket =
    galat instanceof ApiError && (galat.status === 403 || galat.status === 422)
      ? pesanErrorApi(galat)
      : null;

  async function kirim(nilai: NilaiProperti) {
    const body = kePermintaan(nilai);
    try {
      if (mode === "ubah") {
        if (!properti) return;
        const hasil = await ubah.mutateAsync({ id: properti.id, body });
        form.reset(nilaiDariProperti(hasil));
        return;
      }
      const hasil = await buat.mutateAsync(body);
      // Foto yang dipilih sebelum properti tersimpan diunggah sekarang agar
      // mitra tidak perlu membuka halaman ubah untuk menambahkan gambar.
      if (fotoBaru.length > 0) {
        await unggah.mutateAsync({ propertyId: hasil.id, files: fotoBaru });
      }
      router.push("/mitra/properti");
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <>
      <PageHeader
        judul={mode === "baru" ? "Tambah Properti" : "Ubah Properti"}
        deskripsi={
          mode === "baru"
            ? "Lengkapi data listing lalu simpan sebagai draf atau ajukan untuk tayang."
            : "Perbarui informasi listing, lalu simpan perubahan."
        }
        aksi={
          <div className="flex flex-wrap gap-2">
            {mode === "baru" && profil.data ? (
              <Button variant="outline" asChild>
                <Link href={`/pengelola/${profil.data.id}?dari=dashboard`}>
                  <Eye />
                  Review katalog
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href="/mitra/properti">
                <ArrowLeft />
                Kembali
              </Link>
            </Button>
          </div>
        }
      />

      {blokirPaket ? (
        <Alert variant="warning">
          <AlertTitle>Paket langganan diperlukan</AlertTitle>
          <AlertDescription>{blokirPaket}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <form
              noValidate
              onSubmit={form.handleSubmit(kirim)}
              className="flex flex-col gap-6"
            >
              <BidangProperti control={form.control} />

              {mode === "baru" ? (
                <PilihFotoLokal berkas={fotoBaru} onUbah={setFotoBaru} />
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 border-t border-divider pt-6">
                <Button type="button" variant="outline" asChild>
                  <Link href="/mitra/properti">Batal</Link>
                </Button>
                <Button type="submit" disabled={memuat}>
                  {memuat ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Save />
                  )}
                  {mode === "baru" ? "Simpan properti" : "Simpan perubahan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {properti ? (
          <Card className="lg:sticky lg:top-6 lg:self-start">
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
              <CardDescription>Data ini diperbarui otomatis oleh sistem.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  jenis="properti"
                  status={properti.status}
                  label={properti.status_label}
                />
              </div>

              <DaftarDeskripsi
                kolom={1}
                item={[
                  { label: "Harga", nilai: formatRupiah(properti.price) },
                  { label: "Tayangan", nilai: formatAngka(properti.views) },
                  { label: "Unit tersedia", nilai: formatAngka(properti.units_available) },
                  { label: "Slug", nilai: properti.slug },
                  { label: "Diajukan", nilai: formatTanggalWib(properti.created_at) },
                  { label: "Diperbarui", nilai: formatTanggalWib(properti.updated_at) },
                ]}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:sticky lg:top-6 lg:self-start">
            <CardHeader>
              <CardTitle>Tips listing</CardTitle>
              <CardDescription>Agar properti lebih cepat mendapat peminat.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3 text-[13px] text-ink-muted">
                <li>Gunakan judul yang menyebut tipe properti dan lokasi.</li>
                <li>Isi luas tanah, luas bangunan, serta jumlah kamar bila ada.</li>
                <li>Pisahkan fasilitas dengan koma, contoh: Carport, Taman, Keamanan 24 jam.</li>
                <li>Pilih foto sebelum menyimpan; foto diunggah otomatis setelah properti tersimpan.</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function DetailPropertiMitra({ propertiId }: { propertiId: string }) {
  const detail = useDetailPropertiMitra(propertiId);

  return (
    <KontenAsync
      hasil={detail}
      skeleton={<KerangkaFormulir />}
      judulGagal="Gagal memuat properti"
    >
      {(properti) => (
        <>
          <PanelProperti mode="ubah" properti={properti} />
          <GaleriFoto propertiId={properti.id} foto={properti.photos ?? []} />
        </>
      )}
    </KontenAsync>
  );
}

export function FormulirPropertiMitra({ propertiId }: { propertiId?: string }) {
  if (!propertiId) return <PanelProperti mode="baru" />;
  return <DetailPropertiMitra propertiId={propertiId} />;
}
