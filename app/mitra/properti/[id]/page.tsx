import { Suspense } from "react";
import type { Metadata } from "next";

import { FormulirPropertiMitra } from "@/components/mitra/formulir-properti";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Ubah Properti",
  description: "Perbarui informasi listing properti dan kelola galeri foto.",
};

/**
 * Segmen dinamis pertama proyek ini.
 *
 * Karena `cacheComponents` aktif dan tidak ada `generateStaticParams`, nilai
 * `params` baru diketahui saat permintaan berjalan sehingga aksesnya wajib
 * dibungkus `<Suspense>` (shell statis tetap diprerender, isi dimuat menyusul).
 */
export default function UbahPropertiPage({ params }: PageProps<"/mitra/properti/[id]">) {
  return (
    <Suspense fallback={<KerangkaUbahProperti />}>
      {params.then(({ id }) => (
        <FormulirPropertiMitra propertiId={id} />
      ))}
    </Suspense>
  );
}

function KerangkaUbahProperti() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[540px] rounded-card lg:col-span-2" />
        <Skeleton className="h-72 rounded-card" />
      </div>
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}
