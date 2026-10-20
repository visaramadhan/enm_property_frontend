import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Delta = {
  nilai: string;
  arah: "naik" | "turun";
};

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  keterangan,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: Delta;
  keterangan?: string;
}) {
  const naik = delta?.arah === "naik";

  return (
    <Card className="gap-0 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="truncate text-[13px] font-medium text-ink-muted">{label}</span>
          <span
            data-numeric
            className="text-2xl font-semibold tracking-tight text-ink break-words"
          >
            {value}
          </span>
        </div>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-field bg-divider text-secondary"
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>
      </div>

      {delta || keterangan ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                naik ? "text-success" : "text-danger",
              )}
            >
              {naik ? (
                <ArrowUpRight className="size-4" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="size-4" aria-hidden="true" />
              )}
              <span data-numeric>{delta.nilai}</span>
            </span>
          ) : null}
          {keterangan ? <span className="text-ink-muted">{keterangan}</span> : null}
        </div>
      ) : null}
    </Card>
  );
}
