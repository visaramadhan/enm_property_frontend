"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle, UserPlus } from "lucide-react";
import { z } from "zod";

import { AuthHeader, BrandSeluler, PeringatanFirebase } from "@/components/auth/elemen-auth";
import { CheckboxField, PasswordField, TextField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { useSiapkanSesi } from "@/lib/api/use-sesi";
import { daftarkanMitra } from "@/lib/api/endpoints";
import { dashboardPeran } from "@/lib/navigation";
import { toastGagal, toastGagalAuth, toastSukses } from "@/lib/toast";
import type { RegisterPartnerRequest } from "@/types/api";

/** Batas panjang mengikuti DTO backend agar validasi klien dan server selaras. */
const skemaDaftar = z.object({
  picName: z
    .string()
    .trim()
    .min(3, "Nama penanggung jawab minimal 3 karakter")
    .max(100, "Nama penanggung jawab maksimal 100 karakter"),
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon minimal 8 digit")
    .max(20, "Nomor telepon maksimal 20 digit"),
  businessName: z
    .string()
    .trim()
    .min(3, "Nama bisnis minimal 3 karakter")
    .max(150, "Nama bisnis maksimal 150 karakter"),
  city: z.string().trim().min(1, "Kota wajib diisi").max(100, "Kota maksimal 100 karakter"),
  province: z
    .string()
    .trim()
    .min(1, "Provinsi wajib diisi")
    .max(100, "Provinsi maksimal 100 karakter"),
  address: z
    .string()
    .trim()
    .min(1, "Alamat wajib diisi")
    .max(255, "Alamat maksimal 255 karakter"),
  setuju: z
    .boolean()
    .refine((nilai) => nilai, "Anda harus menyetujui syarat dan ketentuan mitra"),
});

type NilaiDaftar = z.infer<typeof skemaDaftar>;

export function RegisterForm() {
  const router = useRouter();
  const siapkanSesi = useSiapkanSesi();
  const [mengirim, setMengirim] = React.useState(false);

  const form = useForm<NilaiDaftar>({
    resolver: zodResolver(skemaDaftar),
    defaultValues: {
      picName: "",
      email: "",
      password: "",
      phone: "",
      businessName: "",
      city: "",
      province: "",
      address: "",
      setuju: false,
    },
  });

  function kePayload(values: NilaiDaftar): RegisterPartnerRequest {
    return {
      business_name: values.businessName,
      pic_name: values.picName,
      phone: values.phone,
      email: values.email,
      address: values.address,
      city: values.city,
      province: values.province,
    };
  }

  async function kirimDaftar(values: NilaiDaftar) {
    setMengirim(true);

    try {
      const [
        { createUserWithEmailAndPassword, updateProfile, sendEmailVerification },
        { getFirebaseAuth },
      ] = await Promise.all([import("firebase/auth"), import("@/lib/firebase/client")]);

      const auth = getFirebaseAuth();
      const kredensial = await createUserWithEmailAndPassword(auth, values.email, values.password);

      // Nama penanggung jawab dipakai sebagai nama pengguna pada klaim token,
      // sehingga baris pengguna lokal langsung terisi saat `POST /auth/session`.
      await updateProfile(kredensial.user, { displayName: values.picName });
      await sendEmailVerification(kredensial.user);
    } catch (error) {
      toastGagalAuth("Gagal mendaftar", error);
      setMengirim(false);
      return;
    }

    // Firebase Auth berhasil: selanjutnya sinkronkan sesi lalu daftarkan mitra.
    try {
      const sesi = await siapkanSesi();
      await daftarkanMitra(kePayload(values));
      toastSukses(
        "Pendaftaran berhasil",
        "Akun mitra Anda dibuat. Lanjutkan dengan memilih paket langganan.",
      );
      router.replace(dashboardPeran(sesi.role));
    } catch (error) {
      toastGagal("Gagal menyelesaikan pendaftaran mitra", error);
      // Akun Firebase sudah terbentuk; arahkan ke login agar pengguna dapat
      // melanjutkan pendaftaran mitra tanpa membuat akun baru.
      router.replace("/login?lanjut=/mitra/langganan");
    } finally {
      setMengirim(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BrandSeluler />
      <PeringatanFirebase />

      <AuthHeader
        judul="Daftar sebagai mitra"
        deskripsi="Buat akun dan lengkapi data bisnis Anda untuk mulai memasang listing properti."
      />

      <form onSubmit={form.handleSubmit(kirimDaftar)} noValidate className="flex flex-col gap-5">
        <fieldset disabled={mengirim} className="flex flex-col gap-5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Akun
          </legend>

          <TextField
            control={form.control}
            name="picName"
            label="Nama penanggung jawab"
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

          <TextField
            control={form.control}
            name="phone"
            label="Nomor telepon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812xxxxxxx"
            wajib
          />
        </fieldset>

        <fieldset disabled={mengirim} className="flex flex-col gap-5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Data bisnis
          </legend>

          <TextField
            control={form.control}
            name="businessName"
            label="Nama bisnis / agensi"
            autoComplete="organization"
            placeholder="Contoh: Griya Utama Property"
            wajib
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="city"
              label="Kota / kabupaten"
              autoComplete="address-level2"
              wajib
            />
            <TextField
              control={form.control}
              name="province"
              label="Provinsi"
              autoComplete="address-level1"
              wajib
            />
          </div>

          <TextField
            control={form.control}
            name="address"
            label="Alamat"
            autoComplete="street-address"
            placeholder="Jalan, nomor, kelurahan"
            wajib
          />
        </fieldset>

        <CheckboxField
          control={form.control}
          name="setuju"
          label="Saya menyetujui syarat dan ketentuan serta kebijakan privasi mitra ENM Property."
        />

        <Button type="submit" size="lg" className="w-full" disabled={mengirim}>
          {mengirim ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <UserPlus />}
          Buat akun mitra
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
