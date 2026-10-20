"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { pesanErrorAuth } from "@/lib/firebase/errors";
import { cn } from "@/lib/utils";

const skemaMasuk = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  ingatSaya: z.boolean(),
});

const skemaLupaSandi = z.object({
  email: z.email("Format email tidak valid"),
});

type NilaiMasuk = z.infer<typeof skemaMasuk>;
type NilaiLupaSandi = z.infer<typeof skemaLupaSandi>;

/** Arahkan pengguna ke dashboard sesuai custom claim `role` pada token. */
function tujuanPeran(peran: unknown) {
  const nilai = typeof peran === "string" ? peran.toLowerCase() : "mitra";
  if (nilai === "admin" || nilai === "superadmin" || nilai === "owner") return "/admin";
  return "/mitra";
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 11.1v2.9h7.1c-.3 1.9-2.2 5.5-7.1 5.5A7.85 7.85 0 0 1 4.1 11.7 7.85 7.85 0 0 1 12 3.8c2.4 0 4.1 1 5.1 1.9l2.3-2.2C17.9 2.2 15.2 1 12 1 5.9 1 1 5.9 1 12s4.9 11 11 11c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2.1H12z" />
    </svg>
  );
}

function PesanError({ pesan }: { pesan?: string }) {
  if (!pesan) return null;
  return <p className="text-xs text-danger">{pesan}</p>;
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"masuk" | "lupa">("masuk");
  const [mengirim, setMengirim] = React.useState(false);
  const [lihatSandi, setLihatSandi] = React.useState(false);

  const formMasuk = useForm<NilaiMasuk>({
    resolver: zodResolver(skemaMasuk),
    defaultValues: { email: "", password: "", ingatSaya: true },
  });

  const formLupa = useForm<NilaiLupaSandi>({
    resolver: zodResolver(skemaLupaSandi),
    defaultValues: { email: "" },
  });

  async function kirimMasuk(values: NilaiMasuk) {
    setMengirim(true);
    try {
      const [{ signInWithEmailAndPassword, sendEmailVerification }, { getFirebaseAuth }] =
        await Promise.all([import("firebase/auth"), import("@/lib/firebase/client")]);

      const kredensial = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        values.email,
        values.password,
      );

      if (!kredensial.user.emailVerified) {
        toast.warning("Email belum diverifikasi", {
          description: "Sebagian fitur dibatasi sampai email Anda diverifikasi.",
          action: {
            label: "Kirim ulang",
            onClick: () => {
              void sendEmailVerification(kredensial.user);
            },
          },
        });
      }

      const token = await kredensial.user.getIdTokenResult();
      toast.success("Berhasil masuk", { description: "Mengalihkan ke dashboard Anda..." });
      router.replace(tujuanPeran(token.claims.role));
    } catch (error) {
      toast.error("Gagal masuk", { description: pesanErrorAuth(error) });
    } finally {
      setMengirim(false);
    }
  }

  async function kirimGoogle() {
    setMengirim(true);
    try {
      const [{ GoogleAuthProvider, signInWithPopup }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/client"),
      ]);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const kredensial = await signInWithPopup(getFirebaseAuth(), provider);
      const token = await kredensial.user.getIdTokenResult();

      toast.success("Berhasil masuk dengan Google");
      router.replace(tujuanPeran(token.claims.role));
    } catch (error) {
      toast.error("Gagal masuk dengan Google", { description: pesanErrorAuth(error) });
    } finally {
      setMengirim(false);
    }
  }

  async function kirimLupaSandi(values: NilaiLupaSandi) {
    setMengirim(true);
    try {
      const [{ sendPasswordResetEmail }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/client"),
      ]);

      await sendPasswordResetEmail(getFirebaseAuth(), values.email);

      toast.success("Tautan reset terkirim", {
        description: `Periksa kotak masuk ${values.email} untuk mengatur ulang kata sandi.`,
      });
      formLupa.reset();
      setMode("masuk");
    } catch (error) {
      toast.error("Gagal mengirim tautan reset", { description: pesanErrorAuth(error) });
    } finally {
      setMengirim(false);
    }
  }

  const peringatanFirebase = !isFirebaseConfigured ? (
    <div
      role="alert"
      className="flex gap-3 rounded-card border border-warning/40 bg-warning/10 p-4"
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
      <p className="text-xs text-ink-muted">
        Firebase belum dikonfigurasi. Lengkapi{" "}
        <code className="rounded bg-divider px-1 py-0.5 font-mono text-[11px]">
          NEXT_PUBLIC_FIREBASE_*
        </code>{" "}
        pada <code className="rounded bg-divider px-1 py-0.5 font-mono text-[11px]">.env.local</code>{" "}
        sebelum mencoba masuk.
      </p>
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-3 lg:hidden">
        <span className="grid size-10 place-items-center rounded-field bg-primary text-sm font-bold text-primary-foreground">
          EN
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-ink">ENM Property</span>
          <span className="text-xs text-ink-muted">Platform Listing Properti</span>
        </span>
      </Link>

      {peringatanFirebase}

      {mode === "masuk" ? (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Masuk ke akun Anda</h1>
            <p className="text-sm text-ink-muted">
              Kelola properti, langganan, dan prospek Anda dalam satu dashboard.
            </p>
          </div>

          <form
            onSubmit={formMasuk.handleSubmit(kirimMasuk)}
            noValidate
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@email.com"
                aria-invalid={Boolean(formMasuk.formState.errors.email)}
                {...formMasuk.register("email")}
              />
              <PesanError pesan={formMasuk.formState.errors.email?.message} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Kata sandi</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={lihatSandi ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Minimal 8 karakter"
                  className="pr-12"
                  aria-invalid={Boolean(formMasuk.formState.errors.password)}
                  {...formMasuk.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setLihatSandi((nilai) => !nilai)}
                  aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-field text-ink-subtle transition-colors duration-150 ease-out hover:text-ink"
                >
                  {lihatSandi ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <PesanError pesan={formMasuk.formState.errors.password?.message} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[13px] text-ink-muted">
                <input
                  type="checkbox"
                  className="size-4 rounded-[4px] border-line accent-primary"
                  {...formMasuk.register("ingatSaya")}
                />
                Ingat saya
              </label>
              <button
                type="button"
                onClick={() => setMode("lupa")}
                className="rounded-field text-[13px] font-medium text-primary hover:underline"
              >
                Lupa kata sandi?
              </button>
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

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={kirimGoogle}
              disabled={mengirim}
            >
              <GoogleMark className={cn("size-5")} />
              Masuk dengan Google
            </Button>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Daftar sebagai mitra
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Lupa kata sandi</h1>
            <p className="text-sm text-ink-muted">
              Masukkan email terdaftar, kami akan mengirim tautan untuk mengatur ulang kata sandi.
            </p>
          </div>

          <form
            onSubmit={formLupa.handleSubmit(kirimLupaSandi)}
            noValidate
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email-lupa">Email</Label>
              <Input
                id="email-lupa"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@email.com"
                aria-invalid={Boolean(formLupa.formState.errors.email)}
                {...formLupa.register("email")}
              />
              <PesanError pesan={formLupa.formState.errors.email?.message} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={mengirim}>
              {mengirim ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              Kirim tautan reset
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setMode("masuk")}
            >
              Kembali ke halaman masuk
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
