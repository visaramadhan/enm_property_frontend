import { AuthProvider } from "@/components/providers/auth-provider";
import { HeaderPublik } from "@/components/layout/header-publik";

/**
 * Tata letak katalog paket publik.
 *
 * Memakai kerangka ringan seperti area checkout supaya halaman tetap dapat
 * diakses tanpa sesi. `AuthProvider` dipasang agar tombol "Buka dashboard"
 * muncul ketika pengguna sudah masuk.
 */
export default function PaketLayout(props: LayoutProps<"/paket">) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-canvas">
        <HeaderPublik tagline="Paket Langganan" />

        <main className="flex flex-1 justify-center px-4 py-[30px] lg:px-8">
          <div className="flex w-full max-w-5xl flex-col gap-6">{props.children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
