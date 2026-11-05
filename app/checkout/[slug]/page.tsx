import { Suspense } from "react";
import type { Metadata } from "next";

import { CheckoutPaket } from "@/components/checkout/checkout-paket";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Checkout Paket",
  description: "Tinjau paket langganan yang Anda pilih sebelum melanjutkan pembayaran.",
};

/**
 * Checkout satu paket berbasis tautan.
 *
 * Segmen dinamis tanpa `generateStaticParams` sehingga `params` hanya diketahui
 * saat permintaan berjalan; aksesnya dibungkus `<Suspense>` agar shell statis
 * tetap dapat diprerender (sesuai panduan Cache Components).
 */
export default function CheckoutPaketPage({ params }: PageProps<"/checkout/[slug]">) {
  return (
    <Suspense fallback={<KerangkaCheckout />}>
      {params.then(({ slug }) => (
        <CheckoutPaket slug={slug} />
      ))}
    </Suspense>
  );
}

function KerangkaCheckout() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-72 rounded-card" />
      <Skeleton className="h-72 rounded-card" />
    </div>
  );
}
