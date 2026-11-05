import type { Metadata } from "next";

import { ProfilAkun } from "@/components/shared/profil-akun";

export const metadata: Metadata = {
  title: "Profil Saya",
  description: "Kelola informasi akun dan keamanan Anda.",
};

export default function OwnerProfilPage() {
  return <ProfilAkun />;
}
