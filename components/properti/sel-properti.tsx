"use client";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { LABEL, labelHargaProperti } from "@/lib/enum";
import type { PropertySummary } from "@/types/api";

/** Sel judul + tipe & lokasi properti, dipakai di seluruh tabel properti. */
export function SelProperti({ properti }: { properti: PropertySummary }) {
  const { t } = useBahasa();

  return (
    <span className="flex flex-col">
      <span className="font-medium text-ink">{properti.title}</span>
      <span className="text-xs text-ink-muted">
        {t(LABEL.tipeProperti[properti.property_type])} · {properti.city}, {properti.province}
      </span>
    </span>
  );
}

/** Sel harga beserta periode sewanya. */
export function SelHarga({ properti }: { properti: PropertySummary }) {
  const { t } = useBahasa();

  return (
    <span className="flex flex-col">
      <span data-numeric className="font-medium text-ink">
        {labelHargaProperti(properti.price, properti.price_period, t)}
      </span>
      <span className="text-xs text-ink-muted">{t(LABEL.tipePenawaran[properti.listing_type])}</span>
    </span>
  );
}
