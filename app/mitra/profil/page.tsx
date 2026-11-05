import type { Metadata } from "next";

import { ProfilMitra } from "@/components/mitra/profil-mitra";

export const metadata: Metadata = {
  title: "Profil Mitra",
  description: "Kelola data badan usaha dan informasi akun kemitraan Anda.",
};

export default function MitraProfilPage() {
  return <ProfilMitra />;
}
