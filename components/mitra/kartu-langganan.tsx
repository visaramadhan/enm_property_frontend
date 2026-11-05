"use client";

import Link from "next/link";
import { CalendarClock, Package } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SubscriptionView } from "@/types/api";

/**
 * Ringkasan paket langganan mitra (masa aktif + kuota listing).
 * Dipakai bersama di dashboard mitra dan halaman Paket & Langganan (DRY).
 */
export function KartuLangganan({
  langganan,
  className,
}: {
  langganan: SubscriptionView;
  className?: string;
}) {
  const kuotaTotal = langganan.listing_quota < 0 ? -1 : langganan.listing_quota;
  const persenKuota =
    kuotaTotal > 0 ? Math.min(100, Math.round((langganan.listings_used / kuotaTotal) * 100)) : 0;

  return (
    <Card className={cn("gap-5", className)}>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>Paket Aktif</CardTitle>
          <CardDescription>
            {langganan.is_active
              ? `Sisa ${formatAngka(langganan.days_remaining)} hari · berakhir ${formatTanggalWib(langganan.ends_at)}`
              : `Berakhir ${formatTanggalWib(langganan.ends_at)}`}
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge
            jenis="langganan"
            status={langganan.status}
            label={langganan.status_label}
          />
          <span className="text-xs text-ink-muted">{langganan.plan_name}</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink-muted">
              <Package className="size-4 text-ink-subtle" aria-hidden="true" />
              Kuota listing
            </span>
            <span data-numeric className="font-semibold text-ink">
              {formatAngka(langganan.listings_used)}
              {kuotaTotal > 0 ? `/${formatAngka(kuotaTotal)}` : " (tanpa batas)"}
            </span>
          </div>
          {kuotaTotal > 0 ? (
            <Progress value={persenKuota} indicatorClassName="bg-secondary" />
          ) : null}
        </div>

        {langganan.show_alert ? (
          <p className="rounded-field bg-warning/10 p-4 text-[13px] text-ink-muted">
            Masa aktif paket Anda tersisa {formatAngka(langganan.days_remaining)} hari. Perpanjang
            sekarang agar listing tetap tayang tanpa jeda.
          </p>
        ) : (
          <p className="flex items-center gap-2 rounded-field bg-divider p-4 text-[13px] text-ink-muted">
            <CalendarClock className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            Masa aktif berakhir {formatTanggalWib(langganan.ends_at)}.
          </p>
        )}

        <Button className="w-full" asChild>
          <Link href="/mitra/langganan">Kelola Langganan</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
