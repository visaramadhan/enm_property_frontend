"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { TextField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { titipPesanSesi } from "@/components/shared/pesan-sesi";
import { StatusBadge } from "@/components/shared/status-badge";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useHapusAkun, usePerbaruiProfilSaya, useProfilSaya } from "@/lib/api/hooks";
import { hapusAktivitas } from "@/lib/auth/aktivitas";
import { hapusAkunDummy } from "@/lib/auth/akun-dummy";
import { LABEL, LABEL_PERAN } from "@/lib/enum";
import { pesanErrorAuth } from "@/lib/firebase/errors";
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

/**
 * Re-autentikasi Firebase sesuai penyedia akun sebelum tindakan destruktif.
 *
 * Firebase mewajibkan login ulang terkini (`auth/requires-recent-login`) untuk
 * operasi sensitif. Akun dengan penyedia kata sandi diverifikasi memakai
 * `EmailAuthProvider`, sedangkan akun Google memakai popup penyedia yang sama.
 */
async function reautentikasiFirebase(sandi: string, emailCadangan?: string): Promise<void> {
  const [client, authMod] = await Promise.all([
    import("@/lib/firebase/client"),
    import("firebase/auth"),
  ]);
  if (!client.isFirebaseConfigured) return;

  const pengguna = client.getFirebaseAuth().currentUser;
  // Sesi demo / tanpa akun Firebase tidak memiliki kredensial untuk diversifikasi.
  if (!pengguna) return;

  const penyedia = pengguna.providerData.map((item) => item.providerId);
  if (penyedia.includes("password")) {
    const email = pengguna.email ?? emailCadangan;
    if (!email) throw new Error("Email akun tidak ditemukan untuk verifikasi.");
    const kredensial = authMod.EmailAuthProvider.credential(email, sandi);
    await authMod.reauthenticateWithCredential(pengguna, kredensial);
    return;
  }
  if (penyedia.includes("google.com")) {
    await authMod.reauthenticateWithPopup(pengguna, new authMod.GoogleAuthProvider());
  }
}

/** Menyeragamkan pesan galat Firebase Auth dan galat lain agar siap ditampilkan. */
function pesanGalatHapus(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) return pesanErrorAuth(error);
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan. Silakan coba lagi.";
}

/**
 * Zona Berbahaya: penghapusan akun permanen.
 *
 * Tersedia bagi semua peran (termasuk mitra). Sebelum menghapus, pengguna wajib
 * mengetik frasa konfirmasi persis dan melewati re-autentikasi Firebase bila
 * akun memakai penyedia Google. Setelah berhasil, sesi dibersihkan dan pengguna
 * kembali ke halaman utama dengan notifikasi tertunda.
 */
function ZonaBerbahaya({ pengguna }: { pengguna: UserView }) {
  const { t } = useBahasa();
  const queryClient = useQueryClient();
  const hapus = useHapusAkun();

  const [terbuka, setTerbuka] = React.useState(false);
  const [konfirmasi, setKonfirmasi] = React.useState("");
  const [sandi, setSandi] = React.useState("");
  const [butuhSandi, setButuhSandi] = React.useState(false);
  const [galat, setGalat] = React.useState<string | null>(null);

  const frasa = "HAPUS AKUN";
  const cocok = konfirmasi.trim() === frasa;
  const bolehKirim = cocok && (!butuhSandi || sandi.length > 0) && !hapus.isPending;

  /* Deteksi penyedia akun setiap modal dibuka untuk menyisipkan bidang sandi. */
  React.useEffect(() => {
    if (!terbuka) return;
    let aktif = true;
    void (async () => {
      try {
        const client = await import("@/lib/firebase/client");
        const orang = client.isFirebaseConfigured
          ? client.getFirebaseAuth().currentUser
          : null;
        const pakaiSandi = Boolean(
          orang?.providerData.some((item) => item.providerId === "password"),
        );
        if (aktif) setButuhSandi(pakaiSandi);
      } catch {
        if (aktif) setButuhSandi(false);
      }
    })();
    return () => {
      aktif = false;
    };
  }, [terbuka]);

  function ubahTerbuka(nilai: boolean) {
    if (hapus.isPending) return;
    setTerbuka(nilai);
    if (!nilai) {
      setKonfirmasi("");
      setSandi("");
      setGalat(null);
    }
  }

  async function konfirmasiHapus() {
    setGalat(null);
    try {
      await reautentikasiFirebase(sandi, pengguna.email);
      await hapus.mutateAsync();

      hapusAkunDummy();
      hapusAktivitas();
      try {
        const [{ signOut }, { getFirebaseAuth }] = await Promise.all([
          import("firebase/auth"),
          import("@/lib/firebase/client"),
        ]);
        await signOut(getFirebaseAuth());
      } catch {
        // Firebase belum dikonfigurasi; sesi lokal tetap dibersihkan.
      }
      queryClient.clear();
      titipPesanSesi(
        "Akun dihapus permanen",
        "Akun Anda beserta seluruh katalog properti, foto, dan riwayat pesanan telah dihapus secara permanen.",
      );
      window.location.replace("/");
    } catch (error) {
      setGalat(pesanGalatHapus(error));
    }
  }

  return (
    <Card className="border-danger/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-danger-ink">
          <Trash2 className="size-4" aria-hidden="true" />
          {t("Zona Berbahaya")}
        </CardTitle>
        <CardDescription>
          {t("Tindakan pada bagian ini bersifat permanen dan tidak dapat dibatalkan.")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Alert variant="danger">
          <AlertTitle>{t("Hapus akun permanen")}</AlertTitle>
          <AlertDescription>
            {t(
              "Menghapus akun akan menghapus profil mitra, SELURUH katalog properti aktif maupun nonaktif, foto, riwayat pesanan, dan akses akun Anda secara permanen.",
            )}
          </AlertDescription>
        </Alert>

        <div>
          <Button variant="danger" onClick={() => ubahTerbuka(true)}>
            <Trash2 />
            {t("Hapus akun saya")}
          </Button>
        </div>
      </CardContent>

      <Dialog open={terbuka} onOpenChange={ubahTerbuka}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-danger-ink">{t("Hapus akun permanen")}</DialogTitle>
            <DialogDescription>
              {t(
                "Tindakan ini tidak dapat dibatalkan. Seluruh data akun dan katalog mitra akan hilang selamanya.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Alert variant="danger" tanpaIkon>
              <AlertDescription>
                {t(
                  "Profil mitra, SELURUH katalog properti aktif/nonaktif, foto, riwayat pesanan, dan akses akun akan dihapus permanen.",
                )}
              </AlertDescription>
            </Alert>

            {butuhSandi ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="sandi-hapus-akun">{t("Kata sandi")}</Label>
                <Input
                  id="sandi-hapus-akun"
                  type="password"
                  autoComplete="current-password"
                  value={sandi}
                  disabled={hapus.isPending}
                  onChange={(event) => setSandi(event.target.value)}
                />
                <p className="text-[13px] text-ink-muted">
                  {t("Masukkan kata sandi untuk memverifikasi ulang akun Anda.")}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="konfirmasi-hapus-akun">
                {t("Ketik {frasa} untuk mengonfirmasi.", { frasa })}
              </Label>
              <Input
                id="konfirmasi-hapus-akun"
                autoComplete="off"
                value={konfirmasi}
                disabled={hapus.isPending}
                onChange={(event) => setKonfirmasi(event.target.value)}
                placeholder={frasa}
              />
            </div>

            {galat ? (
              <p className="rounded-field border border-danger-border bg-danger-tint p-3 text-[13px] text-danger-ink">
                {galat}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={hapus.isPending}
              onClick={() => ubahTerbuka(false)}
            >
              {t("Batal")}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={!bolehKirim}
              onClick={() => void konfirmasiHapus()}
            >
              {hapus.isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
              {t("Hapus akun permanen")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
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
        {(pengguna) => (
          <div className="flex flex-col gap-6">
            <KartuProfil pengguna={pengguna} />
            <ZonaBerbahaya pengguna={pengguna} />
          </div>
        )}
      </KontenAsync>
    </>
  );
}
