import { HeaderPublik } from "@/components/layout/header-publik";
import { AuthProvider } from "@/components/providers/auth-provider";

/**
 * Tata letak halaman pembayaran langganan di luar dashboard (item 6).
 *
 * Halaman ini memuat instruksi QRIS/virtual account satu order. Karena masih
 * bagian dari alur checkout — dan dapat dibuka tepat setelah calon mitra
 * menekan "Lanjut ke pembayaran" — kerangkanya sengaja ringan (kepala halaman
 * publik, tanpa sidebar dashboard). `AuthProvider` tetap dipasang supaya
 * keadaan sesi terbaca bila pengguna membuka halaman ini dari area dashboard.
 */
export default function PembayaranLayout(props: LayoutProps<"/pembayaran">) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-canvas">
        <HeaderPublik tagline="Pembayaran Langganan" />

        <main className="flex flex-1 justify-center px-4 py-[30px] lg:px-8">
          <div className="flex w-full max-w-3xl flex-col gap-6">{props.children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
