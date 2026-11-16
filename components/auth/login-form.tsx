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
import { useBahasa } from "@/components/providers/bahasa-provider";
import { TombolBeranda } from "@/components/shared/asal-beranda";
import { CheckboxField, PasswordField, TextField } from "@/components/shared/form-field";
import { ToggleBahasa } from "@/components/shared/toggle-bahasa";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSiapkanSesi } from "@/lib/api/use-sesi";
import { dashboardPeran, tujuanLanjut } from "@/lib/navigation";
import { toastGagal, toastGagalAuth, toastSukses } from "@/lib/toast";

/** Pesan validasi dibentuk dari kamus agar ikut berganti saat bahasa diubah. */
function buatSkemaMasuk(t: (teks: string) => string) {
  return z.object({
    email: z.email(t("Format email tidak valid")),
    password: z.string().min(8, t("Kata sandi minimal 8 karakter")),
    ingatSaya: z.boolean(),
  });
}

type NilaiMasuk = z.infer<ReturnType<typeof buatSkemaMasuk>>;

export function LoginForm() {
  const router = useRouter();
  const { t } = useBahasa();
  const siapkanSesi = useSiapkanSesi();
  const [mengirim, setMengirim] = React.useState(false);

  const skemaMasuk = React.useMemo(() => buatSkemaMasuk(t), [t]);

  const form = useForm<NilaiMasuk>({
    resolver: zodResolver(skemaMasuk),
    defaultValues: { email: "", password: "", ingatSaya: true },
  });

  function arahkan(peran: string) {
    toastSukses(t("Berhasil masuk"), t("Mengalihkan ke dashboard Anda..."));
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

      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (error) {
      toastGagalAuth(t("Gagal masuk"), error);
      setMengirim(false);
      return;
    }

    try {
      const sesi = await siapkanSesi();
      arahkan(sesi.role);
    } catch (error) {
      toastGagal(t("Gagal menyiapkan sesi"), error);
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
      toastGagal(t("Gagal menyiapkan sesi"), error);
    } finally {
      setMengirim(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <TombolBeranda />
        <ToggleBahasa />
      </div>
      <BrandSeluler />
      <PeringatanFirebase />

      <AuthHeader
        judul={t("Masuk ke akun Anda")}
        deskripsi={t("Kelola properti, langganan, dan prospek Anda dalam satu dashboard.")}
      />

      <form onSubmit={form.handleSubmit(kirimMasuk)} noValidate className="flex flex-col gap-5">
        <TextField
          control={form.control}
          name="email"
          label={t("Email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@email.com"
          wajib
        />

        <PasswordField
          control={form.control}
          name="password"
          label={t("Kata sandi")}
          placeholder={t("Minimal 8 karakter")}
          autoComplete="current-password"
          wajib
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <CheckboxField control={form.control} name="ingatSaya" label={t("Ingat saya")} />
          <Link
            href="/lupa-password"
            className="rounded-field text-[13px] font-medium text-primary hover:underline"
          >
            {t("Lupa kata sandi?")}
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={mengirim}>
          {mengirim ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
          {t("Masuk")}
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-ink-muted">{t("atau")}</span>
          <Separator className="flex-1" />
        </div>

        <GoogleButton
          label={t("Masuk dengan Google")}
          onSukses={masukDenganGoogle}
          disabled={mengirim}
        />
      </form>

      <p className="text-center text-sm text-ink-muted">
        {t("Belum punya akun?")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t("Daftar akun")}
        </Link>
      </p>

      <section className="flex flex-col gap-3 rounded-panel border border-line bg-hover/40 p-4 text-center">
        <p className="flex items-center justify-center gap-2 text-[13px] font-semibold text-ink">
          <Store className="size-4 text-secondary" aria-hidden="true" />
          {t("Ingin memasarkan properti?")}
        </p>
        <p className="text-xs text-ink-muted">
          {t(
            "Daftar sebagai mitra untuk mengisi data badan usaha, memilih paket, dan mulai memasang listing di katalog.",
          )}
        </p>
        <Button variant="outline" asChild>
          <Link href="/daftar-mitra">{t("Daftar Sebagai Mitra")}</Link>
        </Button>
      </section>
    </div>
  );
}
