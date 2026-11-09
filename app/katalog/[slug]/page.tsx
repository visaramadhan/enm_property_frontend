import { Suspense } from "react";
import type { Metadata } from "next";

import { DetailPropertiPublik } from "@/components/katalog/detail-properti-publik";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Detail Properti",
  description: "Lihat detail properti beserta spesifikasi, fasilitas, dan kontak mitra.",
};

/**
 * Halaman detail properti publik.
 *
 * Segmen dinamis tanpa `generateStaticParams` sehingga `params` hanya diketahui
 * saat permintaan berjalan; aksesnya dibungkus `<Suspense>` agar shell statis
 * tetap dapat diprerender (sesuai panduan Cache Components).
 */
export default function DetailPropertiPage({ params }: PageProps<"/katalog/[slug]">) {
  return (
    <Suspense fallback={<KerangkaDetail />}>
      {params.then(({ slug }) => (
        <DetailPropertiPublik slug={slug} />
      ))}
    </Suspense>
  );
}

function KerangkaDetail() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6">
        <Skeleton className="aspect-video w-full rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
      <Skeleton className="h-72 rounded-card" />
    </div>
  );
}
