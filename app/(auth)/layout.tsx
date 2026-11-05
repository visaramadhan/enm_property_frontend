import { PanelBrandAuth } from "@/components/auth/brand-auth";

/**
 * Tata letak area autentikasi: panel brand (nilai logo dan gambarnya mengikuti
 * Pengaturan Sistem) di kiri dan formulir di kanan.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <PanelBrandAuth />

      <main className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-md flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
