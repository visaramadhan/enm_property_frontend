import type { Metadata } from "next";

import { LupaPasswordForm } from "@/components/auth/lupa-password-form";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi",
  description: "Minta tautan reset kata sandi untuk akun ENM Property Anda.",
};

export default function LupaPasswordPage() {
  return <LupaPasswordForm />;
}
