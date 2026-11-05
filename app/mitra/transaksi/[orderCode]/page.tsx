import { Suspense } from "react";
import type { Metadata } from "next";

import { DetailTransaksi } from "@/components/mitra/detail-transaksi";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Detail Transaksi",
  description: "Status pembayaran dan rincian transaksi langganan.",
};

/**
 * Detail transaksi dinamis: `params` baru diketahui saat permintaan berjalan
 * sehingga aksesnya dibungkus `<Suspense>` agar shell statis tetap diprerender.
 */
export default function MitraTransaksiDetailPage({
  params,
}: PageProps<"/mitra/transaksi/[orderCode]">) {
  return (
    <Suspense fallback={<KerangkaDetailTransaksi />}>
      {params.then(({ orderCode }) => (
        <DetailTransaksi orderCode={orderCode} />
      ))}
    </Suspense>
  );
}

function KerangkaDetailTransaksi() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}
