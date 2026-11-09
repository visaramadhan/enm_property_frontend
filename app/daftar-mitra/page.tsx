import { Suspense } from "react";
import type { Metadata } from "next";

import { DaftarMitra } from "@/components/mitra/daftar-mitra";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Daftar Sebagai Mitra",
  description:
    "Isi data badan usaha dan pilih paket langganan untuk memasang properti di katalog ENM Property.",
};

/**
 * Halaman pendaftaran mitra (permintaan A).
 *
 * `searchParams` dibaca lewat `<Suspense>` (pola Cache Components) agar shell
 * statis tetap dapat diprerender; nilai `lanjut` divalidasi sebagai path
 * internal sebelum diteruskan ke formulir.
 */
export default function DaftarMitraPage({ searchParams }: PageProps<"/daftar-mitra">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-card" />}>
      {searchParams.then((params) => {
        const nilai = params.lanjut;
        const lanjut =
          typeof nilai === "string" && nilai.startsWith("/") && !nilai.startsWith("//")
            ? nilai
            : undefined;
        return <DaftarMitra lanjut={lanjut} />;
      })}
    </Suspense>
  );
}
