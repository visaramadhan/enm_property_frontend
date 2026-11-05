import { CircleAlert } from "lucide-react";

import { LogoBrand } from "@/components/auth/brand-auth";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

/**
 * Elemen presentasi bersama untuk seluruh halaman autentikasi.
 *
 * Dipakai oleh masuk, daftar, dan lupa kata sandi agar judul, tautan brand
 * seluler, serta peringatan konfigurasi hanya ditulis satu kali (DRY).
 */

/** Judul + deskripsi halaman autentikasi. */
export function AuthHeader({
  judul,
  deskripsi,
  className,
}: {
  judul: string;
  deskripsi?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{judul}</h1>
      {deskripsi ? <p className="text-sm text-ink-muted">{deskripsi}</p> : null}
    </div>
  );
}

/** Tautan brand yang hanya tampil pada layar kecil (panel brand tersembunyi). */
export function BrandSeluler() {
  return <LogoBrand className="lg:hidden" />;
}

/** Peringatan bila env var Firebase belum diisi sehingga form auth tidak berfungsi. */
export function PeringatanFirebase() {
  if (isFirebaseConfigured) return null;

  return (
    <div role="alert" className="flex gap-3 rounded-card border border-warning/40 bg-warning/10 p-4">
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
      <p className="text-xs text-ink-muted">
        Firebase belum dikonfigurasi. Lengkapi{" "}
        <code className="rounded bg-divider px-1 py-0.5 font-mono text-[11px]">
          NEXT_PUBLIC_FIREBASE_*
        </code>{" "}
        pada <code className="rounded bg-divider px-1 py-0.5 font-mono text-[11px]">.env.local</code>{" "}
        sebelum melanjutkan.
      </p>
    </div>
  );
}
