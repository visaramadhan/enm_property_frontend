import { Suspense } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MuatSesi, RoleGuard } from "@/components/layout/role-guard";
import { AuthProvider } from "@/components/providers/auth-provider";
import { peranDashboard } from "@/lib/navigation";

/** Batas `<Suspense>` diperlukan karena `RoleGuard` membaca `usePathname()`. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AuthProvider>
      <Suspense fallback={<MuatSesi />}>
        <RoleGuard peran={peranDashboard.admin}>
          <DashboardShell role="admin">{children}</DashboardShell>
        </RoleGuard>
      </Suspense>
    </AuthProvider>
  );
}
