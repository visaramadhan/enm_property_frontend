"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle, Store } from "lucide-react";
import { z } from "zod";

import { AuthHeader, BrandSeluler, PeringatanFirebase } from "@/components/auth/elemen-auth";
import { GoogleButton } from "@/components/auth/google-button";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { CheckboxField, PasswordField, TextField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSiapkanSesi } from "@/lib/api/use-sesi";
import { dashboardPeran, tujuanLanjut } from "@/lib/navigation";
import { toastGagal, toastGagalAuth, toastPeringatan, toastSukses } from "@/lib/toast";

const skemaMasuk = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  ingatSaya: z.boolean(),
});

type NilaiMasuk = z.infer<typeof skemaMasuk>;

export function LoginForm() {
  const router = useRouter();
  const siapkanSesi = useSiapkanSesi();
  const [mengirim, setMengirim] = React.useState(false);

  const form = useForm<NilaiMasuk>({
    resolver: zodResolver(skemaMasuk),
    defaultValues: { email: "", password: "", ingatSaya: true },
  });

  function arahkan(peran: string) {
    toastSukses("Berhasil masuk", "Mengalihkan ke dashboard Anda...");
    router.replace(tujuanLanjut() ?? dashboardPeran(peran));
  }

  async function kirimMasuk(values: NilaiMasuk) {
    setMengirim(true);

    try {
      const [{ signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence }, { getFirebaseAuth }] =
        await Promise.all([import("firebase/auth"), import("@/lib/firebase/client")]);

      const auth = getFirebaseAuth();
      await setPersistence(
        auth,
        values.ingatSaya ? browserLocalPersistence : browserSessionPersistence,
      );

      const kredensial = await signInWithEmailAndPassword(auth, values.email, values.password);
      if (!kredensial.user.emailVerified) {
        toastPeringatan(
          "Email belum diverifikasi",
          "Sebagian fitur dibatasi sampai email Anda diverifikasi.",
        );
      }
    } catch (error) {
      toastGagalAuth("Gagal masuk", error);
      setMengirim(false);
      return;
    }

    try {
      const sesi = await siapkanSesi();
      arahkan(sesi.role);
    } catch (error) {
      toastGagal("Gagal menyiapkan sesi", error);
    } finally {
      setMengirim(false);
    }
  }

  async function masukDenganGoogle() {
    setMengirim(true);
    try {
      const sesi = await siapkanSesi();
      arahkan(sesi.role);
    } catch (error) {
      toastGagal("Gagal menyiapkan sesi", error);
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
        judul="Masuk ke akun Anda"
        deskripsi="Kelola properti, langganan, dan prospek Anda dalam satu dashboard."
      />

      <form onSubmit={form.handleSubmit(kirimMasuk)} noValidate className="flex flex-col gap-5">
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
          autoComplete="current-password"
          wajib
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <CheckboxField control={form.control} name="ingatSaya" label="Ingat saya" />
          <Link
            href="/lupa-password"
            className="rounded-field text-[13px] font-medium text-primary hover:underline"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={mengirim}>
          {mengirim ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
          Masuk
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-ink-muted">atau</span>
          <Separator className="flex-1" />
        </div>

        <GoogleButton label="Masuk dengan Google" onSukses={masukDenganGoogle} disabled={mengirim} />
      </form>

      <p className="text-center text-sm text-ink-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Daftar akun
        </Link>
      </p>

      <section className="flex flex-col gap-3 rounded-panel border border-line bg-hover/40 p-4 text-center">
        <p className="flex items-center justify-center gap-2 text-[13px] font-semibold text-ink">
          <Store className="size-4 text-secondary" aria-hidden="true" />
          Ingin memasarkan properti?
        </p>
        <p className="text-xs text-ink-muted">
          Daftar sebagai mitra untuk mengisi data badan usaha, memilih paket, dan mulai memasang
          listing di katalog.
        </p>
        <Button variant="outline" asChild>
          <Link href="/daftar-mitra">Daftar Sebagai Mitra</Link>
        </Button>
      </section>
    </div>
  );
}
