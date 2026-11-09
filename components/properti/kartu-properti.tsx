import Link from "next/link";
import { Bath, Bed, MapPin, Ruler, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatAngka } from "@/lib/format";
import type { PropertySummary } from "@/types/api";

/**
 * Kartu ringkas properti untuk grid katalog publik.
 *
 * Memakai rasio media 16:9 dan menampilkan penanda boost agar listing unggulan
 * mudah dikenali, sesuai panduan design system bagian kartu properti. Seluruh
 * kartu dapat diklik; tombol "Lihat detail" berada di atas tautan kartu
 * (`z-10`) sehingga tetap dapat ditekan.
 */
export function KartuProperti({ properti }: { properti: PropertySummary }) {
  const tujuan = `/katalog/${properti.slug}`;

  return (
    <Card className="relative gap-0 overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={tujuan}
        className="absolute inset-0 z-0"
        aria-label={`Lihat detail ${properti.title}`}
      />

      <div className="relative aspect-video w-full overflow-hidden bg-divider">
        {properti.cover_url ? (
          <img
            src={properti.cover_url}
            alt={properti.title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-[13px] text-ink-subtle">
            Tanpa foto
          </span>
        )}

        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge variant="primary">{properti.listing_type_label}</Badge>
          {properti.boost_active ? (
            <Badge variant="accent">
              <Sparkles />
              Unggulan
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-ink">{properti.title}</h3>

        <p className="flex items-center gap-1.5 text-[13px] text-ink-muted">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {properti.city}, {properti.province}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-muted">
          {properti.bedrooms > 0 ? (
            <span className="flex items-center gap-1.5">
              <Bed className="size-4" aria-hidden="true" />
              {formatAngka(properti.bedrooms)} kamar
            </span>
          ) : null}
          {properti.bathrooms > 0 ? (
            <span className="flex items-center gap-1.5">
              <Bath className="size-4" aria-hidden="true" />
              {formatAngka(properti.bathrooms)} mandi
            </span>
          ) : null}
          {properti.building_area > 0 ? (
            <span className="flex items-center gap-1.5">
              <Ruler className="size-4" aria-hidden="true" />
              {formatAngka(properti.building_area)} m²
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-1">
          <span data-numeric className="text-lg font-semibold tracking-tight text-ink">
            {properti.price_label}
          </span>

          <Button asChild variant="outline" className="relative z-10 w-full">
            <Link href={tujuan}>Lihat detail</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
