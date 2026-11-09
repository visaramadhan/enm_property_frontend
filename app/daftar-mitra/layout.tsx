import { HeaderPublik } from "@/components/layout/header-publik";
import { AuthProvider } from "@/components/providers/auth-provider";

/**
 * Tata letak halaman pendaftaran mitra (permintaan A).
 *
 * Halaman ini dapat dibuka sebelum pengguna masuk (dari landing, halaman paket,
 * atau menu akun), sehingga memakai kerangka publik ringan tanpa sidebar
 * dashboard. `AuthProvider` tetap dipasang agar keadaan sesi dapat dibaca untuk
 * memutuskan apakah menampilkan formulir atau ajakan masuk.
 */
export default function DaftarMitraLayout(props: LayoutProps<"/daftar-mitra">) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-canvas">
        <HeaderPublik tagline="Pendaftaran Mitra" />

        <main className="flex flex-1 justify-center px-4 py-[30px] lg:px-8">
          <div className="flex w-full max-w-3xl flex-col gap-6">{props.children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
