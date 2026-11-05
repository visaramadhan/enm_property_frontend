import type { Metadata } from "next";

import { FavoritMitra } from "@/components/mitra/favorit-mitra";

export const metadata: Metadata = {
  title: "Favorit",
  description: "Properti yang Anda simpan untuk ditinjau kembali.",
};

export default function MitraFavoritPage() {
  return <FavoritMitra />;
}
