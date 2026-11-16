import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Daftar Akun",
    "Buat akun ENM Property, lalu pilih paket langganan untuk mulai memasang listing.",
  );
}

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />
    </>
  );
}
