import { Suspense } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MuatSesi, RoleGuard } from "@/components/layout/role-guard";
import { ModalPerjanjianMitra } from "@/components/mitra/modal-perjanjian";
import { AuthProvider } from "@/components/providers/auth-provider";
import { MetadataDinamis } from "@/components/shared/metadata-dinamis";
import { peranDashboard } from "@/lib/navigation";

/**
 * `RoleGuard` membaca `usePathname()` untuk menyusun parameter `lanjut` saat
 * mengalihkan pengguna ke halaman masuk. Pada rute dinamis (`/mitra/properti/[id]`)
 * nilai path hanya tersedia saat runtime sehingga batas `<Suspense>` diperlukan
 * agar shell statis tetap dapat diprerender (sesuai panduan Cache Components).
 */
export default function MitraLayout({ children }: LayoutProps<"/mitra">) {
  return (
    <AuthProvider>
      {/* Penanda runtime di shell segmen: halaman di dalam area ini dibungkus
          `<Suspense>` layout (dan `loading.tsx`) sehingga penanda milik halaman
          tidak berada di shell statis rute; penanda ini menjaga agar metadata
          dinamis (cookie bahasa) tetap diizinkan saat prerender. */}
      <MetadataDinamis />
      <Suspense fallback={<MuatSesi />}>
        <RoleGuard peran={peranDashboard.mitra}>
          <DashboardShell role="mitra">{children}</DashboardShell>
          {/* Modal perjanjian tampil otomatis sampai mitra menyetujuinya. */}
          <ModalPerjanjianMitra />
        </RoleGuard>
      </Suspense>
    </AuthProvider>
  );
}
