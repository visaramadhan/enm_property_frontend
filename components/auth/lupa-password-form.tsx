"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, LoaderCircle, MailCheck } from "lucide-react";
import { z } from "zod";

import { AuthHeader, BrandSeluler, PeringatanFirebase } from "@/components/auth/elemen-auth";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { TextField } from "@/components/shared/form-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toastGagalAuth, toastSukses } from "@/lib/toast";

function buatSkemaLupa(t: (teks: string) => string) {
  return z.object({
    email: z.email(t("Format email tidak valid")),
  });
}

type NilaiLupa = z.infer<ReturnType<typeof buatSkemaLupa>>;

export function LupaPasswordForm() {
  const { t } = useBahasa();
  const [mengirim, setMengirim] = React.useState(false);
  const [terkirim, setTerkirim] = React.useState<string | null>(null);

  const skemaLupa = React.useMemo(() => buatSkemaLupa(t), [t]);

  const form = useForm<NilaiLupa>({
    resolver: zodResolver(skemaLupa),
    defaultValues: { email: "" },
  });

  async function kirimPermintaan(values: NilaiLupa) {
    setMengirim(true);
    try {
      const [{ sendPasswordResetEmail }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/client"),
      ]);
      await sendPasswordResetEmail(getFirebaseAuth(), values.email);
      setTerkirim(values.email);
      toastSukses(t("Tautan terkirim"), t("Periksa kotak masuk atau folder spam email Anda."));
    } catch (error) {
      toastGagalAuth(t("Gagal mengirim tautan"), error);
    } finally {
      setMengirim(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BrandSeluler />
      <PeringatanFirebase />

      <AuthHeader
        judul={t("Lupa kata sandi?")}
        deskripsi={t(
          "Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.",
        )}
      />

      {terkirim ? (
        <Alert variant="success">
          <AlertTitle>{t("Tautan reset telah dikirim")}</AlertTitle>
          <AlertDescription>
            {t("Kami mengirim tautan ke")} <span className="font-medium text-ink">{terkirim}</span>.{" "}
            {t("Tautan berlaku terbatas, segera buat kata sandi baru.")}
          </AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={form.handleSubmit(kirimPermintaan)} noValidate className="flex flex-col gap-5">
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

        <Button type="submit" size="lg" className="w-full" disabled={mengirim}>
          {mengirim ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <MailCheck />}
          {t("Kirim tautan reset")}
        </Button>
      </form>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 rounded-field text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("Kembali ke halaman masuk")}
      </Link>
    </div>
  );
}
