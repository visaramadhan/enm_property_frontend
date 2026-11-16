"use client";

import { useBahasa } from "@/components/providers/bahasa-provider";
import type { Bahasa } from "@/lib/bahasa";
import { cn } from "@/lib/utils";

/**
 * Sakelar bahasa ID/EN untuk area aplikasi (autentikasi, checkout, dashboard).
 *
 * Berbeda dengan sakelar di landing page yang berpindah rute (`/` ↔ `/en`),
 * sakelar ini hanya menyimpan preferensi ke cookie lalu menyegarkan tampilan,
 * karena halaman aplikasi tunggal melayani kedua bahasa.
 */
export function ToggleBahasa({ className }: { className?: string }) {
  const { bahasa, gantiBahasa, t } = useBahasa();

  return (
    <div
      className={cn("inline-flex items-center rounded-full border border-line p-0.5", className)}
      role="group"
      aria-label={t("Ganti bahasa")}
    >
      {(["id", "en"] as const).map((target: Bahasa) => (
        <button
          key={target}
          type="button"
          onClick={() => gantiBahasa(target)}
          aria-current={bahasa === target ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase transition-colors",
            bahasa === target
              ? "bg-primary text-primary-foreground"
              : "text-secondary hover:text-primary",
          )}
        >
          {target}
        </button>
      ))}
    </div>
  );
}
