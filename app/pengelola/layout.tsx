import { AuthProvider } from "@/components/providers/auth-provider";
import { HeaderPublik } from "@/components/layout/header-publik";

/**
 * Tata letak halaman pengelola (mitra) publik.
 *
 * Memakai kerangka ringan yang sama dengan `/katalog` agar halaman profil
 * pengelola dapat dibuka tanpa sesi, sementara `AuthProvider` tetap dipasang
 * supaya tombol aksi pada kepala halaman menyesuaikan status sesi pengunjung.
 */
export default function PengelolaLayout(props: LayoutProps<"/pengelola">) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-canvas">
        <HeaderPublik tagline="Profil Pengelola" />

        <main className="flex flex-1 justify-center px-4 py-[30px] lg:px-8">
          <div className="flex w-full max-w-7xl flex-col gap-6">{props.children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
