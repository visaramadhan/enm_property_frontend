import { AuthProvider } from "@/components/providers/auth-provider";
import { HeaderPublik } from "@/components/layout/header-publik";

/**
 * Tata letak area checkout berbasis tautan.
 *
 * Halaman ini menjadi tujuan tautan yang disalin admin dari katalog paket
 * (`/checkout/<slug>`) ke landing page. Karena ringkasan paket memakai endpoint
 * publik, tata letaknya sengaja memakai kerangka ringan (tanpa sidebar dashboard)
 * agar tetap rapi saat dibuka oleh calon mitra yang belum masuk. `AuthProvider`
 * tetap dipasang supaya panel konfirmasi dapat mengenali sesi yang sudah aktif.
 */
export default function CheckoutLayout(props: LayoutProps<"/checkout">) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-canvas">
        <HeaderPublik tagline="Checkout Langganan" />

        <main className="flex flex-1 justify-center px-4 py-[30px] lg:px-8">
          <div className="flex w-full max-w-3xl flex-col gap-6">{props.children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
