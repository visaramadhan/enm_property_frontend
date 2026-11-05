import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Kerangka halaman ringkasan (4 kartu statistik + 2 panel) yang dipakai
 * bersama oleh dashboard admin dan mitra saat data sedang dimuat.
 */
export function SkeletonRingkasan() {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indeks) => (
          <Card key={indeks} className="gap-0 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-7 w-28" />
              </div>
              <Skeleton className="size-10 rounded-field" />
            </div>
            <Skeleton className="mt-4 h-3.5 w-32" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="gap-4 p-6 lg:col-span-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
          <div className="mt-2 flex flex-col gap-5">
            {Array.from({ length: 4 }).map((_, indeks) => (
              <div key={indeks} className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="gap-4 p-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <div className="mt-2 flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, indeks) => (
              <div key={indeks} className="flex items-center justify-between gap-3">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-12" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
