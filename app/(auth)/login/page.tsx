import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { PenjagaSudahMasuk } from "@/components/auth/penjaga-sudah-masuk";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun ENM Property untuk mengelola properti dan langganan Anda.",
};

export default function LoginPage() {
  return (
    <>
      <PenjagaSudahMasuk />
      <LoginForm />
    </>
  );
}
