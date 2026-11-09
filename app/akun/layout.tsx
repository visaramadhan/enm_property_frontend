import { HeaderPublik } from "@/components/layout/header-publik";
import { RoleGuard } from "@/components/layout/role-guard";
import { AuthProvider } from "@/components/providers/auth-provider";
import type { Role } from "@/types/api";

/**
 * Tata letak area akun pengunjung (profil singkat dan daftar favorit).
 *
 * Berbeda dari dashboard per peran, halaman akun terbuka untuk semua peran yang
 * sudah masuk — karena itu penjaganya memakai daftar peran lengkap. Isi tiap
 * halaman tetap mengikuti izin backend (mis. favorit hanya untuk `customer`).
 */
const SEMUA_PERAN = [
  "customer",
  "mitra",
  "admin",
  "superadmin",
  "owner",
] as const satisfies readonly Role[];

export default function AkunLayout(props: LayoutProps<"/akun">) {
  return (
    <AuthProvider>
      <RoleGuard peran={SEMUA_PERAN}>
        <div className="flex min-h-screen flex-col bg-canvas">
          <HeaderPublik tagline="Akun Saya" />

          <main className="flex flex-1 justify-center px-4 py-[30px] lg:px-8">
            <div className="flex w-full max-w-5xl flex-col gap-6">{props.children}</div>
          </main>
        </div>
      </RoleGuard>
    </AuthProvider>
  );
}
