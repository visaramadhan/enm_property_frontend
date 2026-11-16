import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { PenjagaSudahMasuk } from "@/components/auth/penjaga-sudah-masuk";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Masuk",
    "Masuk ke akun ENM Property untuk mengelola properti dan langganan Anda.",
  );
}

export default function LoginPage() {
  return (
    <>
      <PenjagaSudahMasuk />
      <LoginForm />
    </>
  );
}
