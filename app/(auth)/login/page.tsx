import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun ENM Property untuk mengelola properti dan langganan Anda.",
};

export default function LoginPage() {
  return <LoginForm />;
}
