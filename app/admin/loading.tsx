import { Skeleton } from "@/components/ui/skeleton";

/** Kerangka umum halaman dashboard saat segmen rute dimuat. */
export default function LoadingDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indeks) => (
          <Skeleton key={indeks} className="h-32 rounded-card" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-card lg:col-span-2" />
        <Skeleton className="h-80 rounded-card" />
      </div>

      <Skeleton className="h-72 rounded-card" />
    </div>
  );
}
