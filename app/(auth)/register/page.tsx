import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar Mitra",
  description: "Buat akun mitra ENM Property dan mulai pasang listing properti Anda.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
