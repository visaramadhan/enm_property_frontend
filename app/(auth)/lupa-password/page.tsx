import type { Metadata } from "next";

import { LupaPasswordForm } from "@/components/auth/lupa-password-form";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Lupa Kata Sandi",
    "Minta tautan reset kata sandi untuk akun ENM Property Anda.",
  );
}

export default function LupaPasswordPage() {
  return (
    <>
      <LupaPasswordForm />
    </>
  );
}
