import { Suspense } from "react";
import type { Metadata } from "next";

import { HalamanPengelola } from "@/components/katalog/halaman-pengelola";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Profil Pengelola",
  description: "Lihat seluruh properti yang dikelola oleh mitra ENM Property.",
};

/**
 * Halaman profil pengelola (mitra) beserta katalog miliknya.
 *
 * Segmen dinamis tanpa `generateStaticParams` sehingga `params` diketahui saat
 * permintaan berjalan; aksesnya dibungkus `<Suspense>` agar shell statis tetap
 * dapat diprerender (sesuai panduan Cache Components).
 */
export default function PengelolaPage({ params }: PageProps<"/pengelola/[id]">) {
  return (
    <Suspense fallback={<KerangkaPengelola />}>
      {params.then(({ id }) => (
        <HalamanPengelola id={id} />
      ))}
    </Suspense>
  );
}

function KerangkaPengelola() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 rounded-card" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, indeks) => (
          <Skeleton key={indeks} className="h-80 rounded-card" />
        ))}
      </div>
    </div>
  );
}
