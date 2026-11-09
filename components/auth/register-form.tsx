"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle, UserPlus } from "lucide-react";
import { z } from "zod";

import { AuthHeader, BrandSeluler, PeringatanFirebase } from "@/components/auth/elemen-auth";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { CheckboxField, PasswordField, TextField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { useSiapkanSesi } from "@/lib/api/use-sesi";
import { tujuanLanjut } from "@/lib/navigation";
import { toastGagal, toastGagalAuth, toastSukses } from "@/lib/toast";

/** Batas panjang mengikuti DTO backend agar validasi klien dan server selaras. */
const skemaDaftar = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  setuju: z.boolean().refine((nilai) => nilai, "Anda harus menyetujui syarat dan ketentuan"),
});

type NilaiDaftar = z.infer<typeof skemaDaftar>;

/**
 * Formulir pendaftaran akun.
 *
 * Hanya membuat akun (nama, email, kata sandi). Data badan usaha tidak diminta di
 * sini: pengguna dapat mendaftar sebagai mitra, memilih paket, lalu melengkapi
 * profil kemitraan setelah pembayaran berhasil.
 */
export function RegisterForm() {
  const router = useRouter();
  const siapkanSesi = useSiapkanSesi();
  const [mengirim, setMengirim] = React.useState(false);

  const form = useForm<NilaiDaftar>({
    resolver: zodResolver(skemaDaftar),
    defaultValues: { nama: "", email: "", password: "", setuju: false },
  });

  async function kirimDaftar(values: NilaiDaftar) {
    setMengirim(true);

    try {
      const [
        { createUserWithEmailAndPassword, updateProfile, sendEmailVerification },
        { getFirebaseAuth },
      ] = await Promise.all([import("firebase/auth"), import("@/lib/firebase/client")]);

      const auth = getFirebaseAuth();
      const kredensial = await createUserWithEmailAndPassword(auth, values.email, values.password);

      // Nama pengguna dipakai sebagai klaim token sehingga baris pengguna lokal
      // langsung terisi saat `POST /auth/session`.
      await updateProfile(kredensial.user, { displayName: values.nama });
      await sendEmailVerification(kredensial.user);
    } catch (error) {
      toastGagalAuth("Gagal mendaftar", error);
      setMengirim(false);
      return;
    }

    try {
      await siapkanSesi();
      toastSukses(
        "Pendaftaran berhasil",
        "Akun Anda dibuat. Pilih paket langganan untuk mulai memasang properti.",
      );
      router.replace(tujuanLanjut() ?? "/paket");
    } catch (error) {
      toastGagal("Gagal menyiapkan sesi", error);
      // Akun Firebase sudah terbentuk; arahkan ke halaman masuk agar pengguna
      // dapat melanjutkan tanpa membuat akun baru.
      router.replace("/login?lanjut=/paket");
    } finally {
      setMengirim(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <TombolBeranda />
      <BrandSeluler />
      <PeringatanFirebase />

      <AuthHeader
        judul="Daftar akun"
        deskripsi="Buat akun ENM Property. Setelah masuk, Anda dapat mendaftar sebagai mitra dan memilih paket langganan."
      />

      <form onSubmit={form.handleSubmit(kirimDaftar)} noValidate className="flex flex-col gap-5">
        <fieldset disabled={mengirim} className="flex flex-col gap-5">
          <TextField
            control={form.control}
            name="nama"
            label="Nama lengkap"
            autoComplete="name"
            placeholder="Nama lengkap"
            wajib
          />

          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nama@email.com"
            wajib
          />

          <PasswordField
            control={form.control}
            name="password"
            label="Kata sandi"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            wajib
          />
        </fieldset>

        <CheckboxField
          control={form.control}
          name="setuju"
          label="Saya menyetujui syarat dan ketentuan serta kebijakan privasi ENM Property."
        />

        <Button type="submit" size="lg" className="w-full" disabled={mengirim}>
          {mengirim ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <UserPlus />}
          Buat akun
        </Button>
      </form>

      <p className="text-center text-sm text-ink-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
