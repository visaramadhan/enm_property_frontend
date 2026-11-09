import { Suspense } from "react";
import type { Metadata } from "next";

import { PembayaranOrder } from "@/components/mitra/pembayaran-order";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Pembayaran Langganan",
  description: "Selesaikan pembayaran paket melalui QRIS atau virtual account.",
};

/**
 * Halaman pembayaran satu order (item 6).
 *
 * Diletakkan di luar `/mitra` agar halaman pembayaran/invoice dapat dibuka
 * tanpa kerangka dashboard, sesuai alur checkout. Segmen dinamis tanpa
 * `generateStaticParams` sehingga `params` hanya diketahui saat permintaan
 * berjalan; aksesnya dibungkus `<Suspense>` agar shell statis tetap dapat
 * diprerender.
 */
export default function PembayaranOrderPage({ params }: PageProps<"/pembayaran/[orderCode]">) {
  return (
    <Suspense fallback={<KerangkaPembayaran />}>
      {params.then(({ orderCode }) => (
        <PembayaranOrder orderCode={orderCode} />
      ))}
    </Suspense>
  );
}

function KerangkaPembayaran() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-80 rounded-card" />
    </div>
  );
}
