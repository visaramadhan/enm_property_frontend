import { Progress } from "@/components/ui/progress";
import { formatAngka } from "@/lib/format";
import type { PropertyStats } from "@/types/api";

const BARIS: { kunci: keyof PropertyStats; label: string; indikator: string }[] = [
  { kunci: "active", label: "Tayang", indikator: "bg-success" },
  { kunci: "pending_review", label: "Menunggu review", indikator: "bg-warning" },
  { kunci: "draft", label: "Draf", indikator: "bg-ink-subtle" },
  { kunci: "inactive", label: "Nonaktif", indikator: "bg-secondary" },
  { kunci: "expired", label: "Kedaluwarsa", indikator: "bg-danger" },
];

/**
 * Rincian jumlah properti per status dalam bentuk bilah progres.
 * Dipakai bersama oleh dashboard admin dan mitra (DRY) karena keduanya
 * menerima bentuk statistik properti yang sama dari backend.
 */
export function DistribusiStatusProperti({ statistik }: { statistik: PropertyStats }) {
  return (
    <div className="flex flex-col gap-5">
      {BARIS.map((item) => {
        const jumlah = statistik[item.kunci] ?? 0;
        const persen = statistik.total > 0 ? Math.round((jumlah / statistik.total) * 100) : 0;
        return (
          <div key={item.kunci} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink-muted">{item.label}</span>
              <span data-numeric className="font-semibold text-ink">
                {formatAngka(jumlah)}
              </span>
            </div>
            <Progress value={persen} indicatorClassName={item.indikator} />
          </div>
        );
      })}
    </div>
  );
}
