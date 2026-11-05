import { LABEL } from "@/lib/enum";
import { formatRupiah } from "@/lib/format";
import type { PropertySummary } from "@/types/api";

/** Sel judul + tipe & lokasi properti, dipakai di seluruh tabel properti. */
export function SelProperti({ properti }: { properti: PropertySummary }) {
  return (
    <span className="flex flex-col">
      <span className="font-medium text-ink">{properti.title}</span>
      <span className="text-xs text-ink-muted">
        {properti.property_type_label} · {properti.city}, {properti.province}
      </span>
    </span>
  );
}

/** Sel harga beserta periode sewanya. */
export function SelHarga({ properti }: { properti: PropertySummary }) {
  return (
    <span className="flex flex-col">
      <span data-numeric className="font-medium text-ink">
        {formatRupiah(properti.price)}
      </span>
      <span className="text-xs text-ink-muted">
        {properti.listing_type_label}
        {properti.price_period ? ` · ${LABEL.periodeHarga[properti.price_period]}` : ""}
      </span>
    </span>
  );
}
