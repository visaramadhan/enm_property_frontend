import { Suspense } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MuatSesi, RoleGuard } from "@/components/layout/role-guard";
import { AuthProvider } from "@/components/providers/auth-provider";
import { MetadataDinamis } from "@/components/shared/metadata-dinamis";
import { peranDashboard } from "@/lib/navigation";

/** Batas `<Suspense>` diperlukan karena `RoleGuard` membaca `usePathname()`. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AuthProvider>
      {/* Penanda runtime di shell segmen: halaman di dalam area ini dibungkus
          `<Suspense>` layout (dan `loading.tsx`) sehingga penanda milik halaman
          tidak berada di shell statis rute; penanda ini menjaga agar metadata
          dinamis (cookie bahasa) tetap diizinkan saat prerender. */}
      <MetadataDinamis />
      <Suspense fallback={<MuatSesi />}>
        <RoleGuard peran={peranDashboard.admin}>
          <DashboardShell role="admin">{children}</DashboardShell>
        </RoleGuard>
      </Suspense>
    </AuthProvider>
  );
}
