import type { Metadata } from "next";

import { FavoritSaya } from "@/components/akun/favorit-saya";

export const metadata: Metadata = {
  title: "Favorit Saya",
  description: "Properti yang Anda simpan untuk ditinjau kembali.",
};

export default function AkunFavoritPage() {
  return <FavoritSaya />;
}
