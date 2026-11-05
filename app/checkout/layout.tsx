import Link from "next/link";

import { AuthProvider } from "@/components/providers/auth-provider";

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
        <header className="sticky top-0 z-30 flex h-[66px] items-center border-b border-line bg-surface/96 px-4 backdrop-blur lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-[12px] font-extrabold text-secondary-foreground">
              ENM
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-ink">ENM Property</span>
              <span className="text-[10px] font-semibold tracking-[0.145em] text-ink-subtle uppercase">
                Checkout Langganan
              </span>
            </span>
          </Link>
        </header>

        <main className="flex flex-1 justify-center px-4 py-[30px] lg:px-8">
          <div className="flex w-full max-w-3xl flex-col gap-6">{props.children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
