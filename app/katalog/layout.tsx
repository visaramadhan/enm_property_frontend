import { AuthProvider } from "@/components/providers/auth-provider";
import { MetadataDinamis } from "@/components/shared/metadata-dinamis";
import { HeaderPublik } from "@/components/layout/header-publik";

/**
 * Tata letak katalog properti publik.
 *
 * Memakai kerangka ringan seperti area paket/checkout agar halaman tetap dapat
 * diakses tanpa sesi. `AuthProvider` dipasang agar tombol aksi pada kepala
 * halaman dapat menyesuaikan status sesi pengunjung.
 */
export default function KatalogLayout(props: LayoutProps<"/katalog">) {
  return (
    <AuthProvider>
      <MetadataDinamis />
      <div className="flex min-h-screen flex-col bg-canvas">
        <HeaderPublik tagline="Katalog Properti" />

        <main className="flex flex-1 justify-center px-4 py-6 sm:py-[30px] lg:px-8">
          <div className="flex w-full min-w-0 max-w-7xl flex-col gap-6">{props.children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
