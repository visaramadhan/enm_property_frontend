import type { LucideIcon } from "lucide-react";

import { formatAngka } from "@/lib/format";

export type MetrikItem = {
  label: string;
  nilai: number;
  ikon: LucideIcon;
};

/** Daftar metrik berlabel dengan ikon, dipakai di panel ringkasan dashboard. */
export function DaftarMetrik({ item }: { item: MetrikItem[] }) {
  return (
    <ul className="flex flex-col divide-y divide-divider">
      {item.map(({ label, nilai, ikon: Ikon }) => (
        <li key={label} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <span className="flex items-center gap-2.5 text-sm text-ink-muted">
            <Ikon className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            {label}
          </span>
          <span data-numeric className="text-sm font-semibold text-ink">
            {formatAngka(nilai)}
          </span>
        </li>
      ))}
    </ul>
  );
}
