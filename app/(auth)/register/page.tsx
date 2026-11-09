import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar Akun",
  description: "Buat akun ENM Property, lalu pilih paket langganan untuk mulai memasang listing.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
