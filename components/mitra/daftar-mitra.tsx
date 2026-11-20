"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, LogIn, ShoppingBag, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  BidangMitra,
  buatSkemaMitra,
  keRegisterPartner,
  nilaiAwalMitra,
  type NilaiMitra,
} from "@/components/mitra/form-mitra";
import { PilihKTP } from "@/components/mitra/pilih-ktp";
import { useAuth } from "@/components/providers/auth-provider";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDaftarkanMitra, useUnggahKtp } from "@/lib/api/hooks";
import { useSiapkanSesi } from "@/lib/api/use-sesi";
import { toastGagal } from "@/lib/toast";

/**
 * Halaman "Daftar Sebagai Mitra" (permintaan A).
 *
 * Alur: isi data badan usaha → akun langsung aktif sebagai mitra → pilih paket
 * → bayar. Berbeda dari halaman `/register` (yang hanya membuat akun), halaman
 * ini khusus mengisi data kemitraan. Bila pengunjung belum masuk, ia diarahkan
 * lebih dulu ke halaman masuk sambil membawa tujuan kembali ke halaman ini.
 *
 * Formulir memakai ulang skema & bidang dari `form-mitra.tsx` agar aturan
 * validasi sama dengan halaman Profil Mitra (DRY).
 */
export function DaftarMitra({ lanjut }: { lanjut?: string }) {
  const { t } = useBahasa();
  const { pengguna, memuat } = useAuth();

  return (
    <>
      <PageHeader
        judul={t("Daftar Sebagai Mitra")}
        deskripsi={t("Isi data badan usaha Anda, lalu pilih paket langganan untuk mulai memasang listing.")}
      />

      {memuat ? (
        <Skeleton className="h-96 rounded-card" />
      ) : !pengguna ? (
        <KartuAjakanMasuk lanjut={lanjut} />
      ) : pengguna.partner ? (
        <KartuSudahMitra lanjut={lanjut} />
      ) : (
        <FormulirPendaftaran lanjut={lanjut} />
      )}
    </>
  );
}

/** Ajakan masuk/daftar akun sebelum mengisi data kemitraan. */
function KartuAjakanMasuk({ lanjut }: { lanjut?: string }) {
  const { t } = useBahasa();
  /* Tujuan kembali harus mempertahankan tujuan asal (`lanjut`) sehingga setelah
     masuk/daftar akun pengunjung kembali ke halaman ini beserta tujuannya. */
  const kembali = lanjut ? `/daftar-mitra?lanjut=${encodeURIComponent(lanjut)}` : "/daftar-mitra";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="size-4 text-secondary" aria-hidden="true" />
          {t("Masuk atau daftar akun dulu")}
        </CardTitle>
        <CardDescription>
          {t("Pendaftaran mitra memerlukan akun agar data badan usaha dan langganan Anda tersimpan.")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/login?lanjut=${encodeURIComponent(kembali)}`}>
            <LogIn />
            {t("Masuk")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/register?lanjut=${encodeURIComponent(kembali)}`}>
            <UserPlus />
            {t("Daftar akun")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Ditampilkan bila pengguna sudah memiliki profil mitra. */
function KartuSudahMitra({ lanjut }: { lanjut?: string }) {
  const { t } = useBahasa();
  const tujuan = lanjut ?? "/paket";

  return (
    <Card className="border-success/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
          {t("Anda sudah terdaftar sebagai mitra")}
        </CardTitle>
        <CardDescription>
          {t("Data badan usaha Anda sudah tercatat. Lanjutkan memilih paket langganan untuk memasang listing.")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={tujuan}>
            <ShoppingBag />
            {t("Pilih Paket Langganan")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/mitra/profil">{t("Lihat Profil Mitra")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/** Formulir data badan usaha; begitu dikirim, akun langsung berperan mitra. */
function FormulirPendaftaran({ lanjut }: { lanjut?: string }) {
  const { t } = useBahasa();
  const router = useRouter();
  const daftar = useDaftarkanMitra();
  const unggah = useUnggahKtp();
  const siapkanSesi = useSiapkanSesi();
  const [ktp, setKtp] = React.useState<File | null>(null);

  const skema = React.useMemo(() => buatSkemaMitra(t), [t]);

  const form = useForm<NilaiMitra>({
    resolver: zodResolver(skema),
    defaultValues: nilaiAwalMitra,
  });

  const sibuk = daftar.isPending || unggah.isPending;

  async function kirim(nilai: NilaiMitra) {
    if (!ktp) {
      toastGagal(
        t("Foto KTP wajib diunggah"),
        new Error(t("Unggah foto KTP sebelum melanjutkan pendaftaran.")),
      );
      return;
    }
    try {
      // Unggah KTP lebih dahulu, lalu kirim URL-nya bersama data badan usaha.
      const { url } = await unggah.mutateAsync(ktp);
      await daftar.mutateAsync({ ...keRegisterPartner(nilai), ktp_photo_url: url });
      // Peran pengguna naik menjadi mitra; sesi disegarkan agar area /mitra dan
      // halaman checkout mitra langsung dapat diakses tanpa masuk ulang.
      await siapkanSesi().catch(() => undefined);
      router.push(lanjut ?? "/paket");
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <form onSubmit={form.handleSubmit(kirim)} noValidate className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Data Badan Usaha")}</CardTitle>
          <CardDescription>
            {t("Informasi ini tampil pada halaman properti dan kontak calon penyewa.")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <BidangMitra control={form.control} />
        </CardContent>
      </Card>

      <PilihKTP berkas={ktp} onUbah={setKtp} />

      <p className="text-[13px] text-ink-muted">
        {t("Dengan melanjutkan, akun Anda langsung aktif sebagai mitra dan Anda dapat memilih paket langganan pada langkah berikutnya.")}
      </p>

      <div className="flex justify-end">
        <Button type="submit" disabled={sibuk}>
          {sibuk ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />}
          {t("Daftar & lanjut pilih paket")}
        </Button>
      </div>
    </form>
  );
}
