"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { dashboardPeran } from "@/lib/navigation";
import type { Role } from "@/types/api";

/** Indikator sesi penuh layar saat peran pengguna belum diketahui. */
export function MuatSesi() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas">
      <div className="flex items-center gap-3 text-ink-muted">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        <span className="text-sm">Memuat sesi...</span>
      </div>
    </div>
  );
}

/**
 * Menjaga rute dashboard: mengalihkan pengguna yang belum masuk ke halaman
 * login dan pengguna dengan peran tidak sesuai ke dashboard miliknya.
 */
export function RoleGuard({
  peran,
  children,
}: {
  peran: readonly Role[];
  children: React.ReactNode;
}) {
  const { pengguna, memuat } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const diizinkan = Boolean(pengguna && peran.includes(pengguna.role));

  React.useEffect(() => {
    if (memuat) return;
    if (!pengguna) {
      router.replace(`/login?lanjut=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!diizinkan) router.replace(dashboardPeran(pengguna.role));
  }, [memuat, pengguna, diizinkan, pathname, router]);

  if (!diizinkan) return <MuatSesi />;
  return <>{children}</>;
}
