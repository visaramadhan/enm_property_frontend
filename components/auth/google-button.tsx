"use client";

import * as React from "react";
import type { User } from "firebase/auth";
import { LoaderCircle } from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { Button } from "@/components/ui/button";
import { kodeErrorAuth } from "@/lib/firebase/errors";
import { toastGagalAuth, toastInfo } from "@/lib/toast";
import { cn } from "@/lib/utils";

/** Logo Google monokrom yang mengikuti warna teks tombol. */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 11.1v2.9h7.1c-.3 1.9-2.2 5.5-7.1 5.5A7.85 7.85 0 0 1 4.1 11.7 7.85 7.85 0 0 1 12 3.8c2.4 0 4.1 1 5.1 1.9l2.3-2.2C17.9 2.2 15.2 1 12 1 5.9 1 1 5.9 1 12s4.9 11 11 11c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2.1H12z" />
    </svg>
  );
}

/**
 * Mengambil email dari galat `auth/account-exists-with-different-credential`.
 *
 * Firebase menyimpan email yang bentrok pada `customData.email` sehingga
 * formulir masuk dapat mengisinya otomatis untuk memudahkan penautan akun.
 */
function emailKonflik(error: unknown): string {
  if (typeof error === "object" && error !== null && "customData" in error) {
    const custom = (error as { customData?: { email?: unknown } }).customData;
    if (custom && typeof custom.email === "string") return custom.email;
  }
  return "";
}

/**
 * Tombol masuk dengan Google yang dipakai bersama halaman masuk dan daftar.
 *
 * Komponen menangani pembukaan popup Firebase, status memuat, dan notifikasi
 * kegagalan; pemanggil hanya menentukan apa yang dilakukan setelah berhasil
 * (mis. sinkronisasi sesi lalu pengalihan rute).
 *
 * Bila email sudah terdaftar memakai kata sandi, Firebase menolak popup dengan
 * galat `auth/account-exists-with-different-credential`; alih-alih pesan galat
 * mentah, pengguna diarahkan masuk memakai metode lamanya lalu menautkan Google
 * dari halaman Profil Saya (`onKonflikAkun` mengisi email agar cepat).
 */
export function GoogleButton({
  label,
  onSukses,
  onKonflikAkun,
  disabled,
  className,
}: {
  label?: string;
  onSukses: (pengguna: User) => void | Promise<void>;
  /** Dipanggil saat email sudah terdaftar dengan metode lain (mis. kata sandi). */
  onKonflikAkun?: (email: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useBahasa();
  const [memuat, setMemuat] = React.useState(false);

  async function masukGoogle() {
    setMemuat(true);
    try {
      const [{ GoogleAuthProvider, signInWithPopup }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/client"),
      ]);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const kredensial = await signInWithPopup(getFirebaseAuth(), provider);
      await onSukses(kredensial.user);
    } catch (error) {
      if (kodeErrorAuth(error) === "auth/account-exists-with-different-credential") {
        onKonflikAkun?.(emailKonflik(error));
        toastInfo(
          t("Email sudah terdaftar"),
          t(
            "Akun dengan email ini memakai metode masuk lain. Masuk memakai metode tersebut, lalu tautkan Google dari halaman Profil Saya.",
          ),
        );
        return;
      }
      toastGagalAuth(t("Gagal masuk dengan Google"), error);
    } finally {
      setMemuat(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn("w-full", className)}
      onClick={masukGoogle}
      disabled={disabled || memuat}
    >
      {memuat ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <GoogleMark />}
      {label ?? t("Lanjutkan dengan Google")}
    </Button>
  );
}
