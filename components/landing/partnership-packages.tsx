"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { EditableText } from "@/components/editor/editable-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Bagian paket kemitraan (`#paket`).
 *
 * Tata letak kartu menyesuaikan jumlah paket secara otomatis:
 * - kurang dari 4 paket -> baris fleksibel terpusat (`flex flex-wrap justify-center`)
 *   dengan lebar kartu tetap agar tidak melar;
 * - 4 paket atau lebih -> grid 4 kolom; paket ke-5 dan seterusnya turun ke
 *   baris berikutnya dan tetap rata kiri.
 * Dengan begitu komponen tetap rapi untuk variasi 2-6 paket.
 */

/** Bentuk data paket siap tampil (tidak bergantung DTO backend). */
export interface PaketKemitraan {
  id: string;
  nama: string;
  /** Label harga siap tampil, mis. "Gratis" atau "Rp 500.000". */
  harga: string;
  /** Durasi paket, mis. "365 hari". */
  durasi: string;
  /** Badge opsional di atas nama, mis. "Paling Populer". */
  badge?: string;
  /** Menandai paket unggulan (garis tepi aksen). */
  unggulan?: boolean;
  /** Daftar fitur yang ditampilkan dengan ikon centang. */
  fitur: string[];
  /** Label tombol tanpa panah; panah ditambahkan otomatis. */
  ctaLabel: string;
  /** Tujuan tombol. */
  ctaHref: string;
}

/**
 * Data contoh untuk pratinjau/uji tata letak. Salin lalu ubah panjangnya
 * (2-6 item) untuk memeriksa perilaku tata letak dinamis.
 */
export const PAKET_CONTOH: PaketKemitraan[] = [
  {
    id: "free",
    nama: "Free",
    harga: "Gratis",
    durasi: "365 hari",
    badge: "Mulai Gratis",
    fitur: ["5 listing aktif", "Kontak WhatsApp", "Tampil di katalog publik"],
    ctaLabel: "Pilih Free",
    ctaHref: "/checkout/free",
  },
  {
    id: "standard",
    nama: "Standard",
    harga: "Rp 500.000",
    durasi: "365 hari",
    badge: "Paling Populer",
    unggulan: true,
    fitur: ["50 listing aktif", "Boost listing", "Akses katalog lengkap", "Prioritas pencarian"],
    ctaLabel: "Pilih Standard",
    ctaHref: "/checkout/standard",
  },
  {
    id: "business",
    nama: "Business",
    harga: "Rp 1.500.000",
    durasi: "365 hari",
    fitur: ["Tanpa batas listing", "Boost + keyword", "Nomor WhatsApp khusus", "Dukungan prioritas"],
    ctaLabel: "Pilih Business",
    ctaHref: "/checkout/business",
  },
];

interface PartnershipPackagesProps {
  /** Daftar paket yang ditampilkan. */
  paket: PaketKemitraan[];
  /** Judul bagian. */
  judul: string;
  /** Deskripsi singkat bagian. */
  subjudul: string;
  /** Variasi bahasa Inggris untuk penampilan halaman `/en`. */
  judulEn?: string;
  subjudulEn?: string;
  /** Label kecil di atas judul. */
  eyebrow?: string;
  /** Catatan kecil di bawah kartu. */
  catatan?: string;
  /** Konten tambahan setelah catatan, mis. tabel perbandingan. */
  tambahan?: ReactNode;
  /** Memakai palet gelap (dipakai halaman landing). */
  gelap?: boolean;
  className?: string;
}

export function PartnershipPackages({
  paket,
  judul,
  subjudul,
  judulEn,
  subjudulEn,
  eyebrow,
  catatan,
  tambahan,
  gelap = false,
  className,
}: PartnershipPackagesProps) {
  /* Aturan tata letak dinamis: grid untuk 4 paket atau lebih, selain itu baris
     fleksibel terpusat dengan lebar kartu tetap. */
  const banyak = paket.length >= 4;
  const kelasWadah = banyak
    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    : "flex flex-wrap justify-center gap-6";
  const kelasKartu = banyak ? "" : "w-full sm:w-[320px] lg:w-[300px]";

  return (
    <section id="paket" className={cn("scroll-mt-[72px] py-12 sm:py-16", gelap ? "bg-secondary" : "bg-canvas", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-9 max-w-[720px] text-center">
          {eyebrow ? (
            <p
              className={cn(
                "inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase",
                "before:h-0.5 before:w-5 before:rounded-full before:bg-current before:content-['']",
                gelap ? "text-accent" : "text-primary",
              )}
            >
              {eyebrow}
            </p>
          ) : null}

          <EditableText
            as="h2"
            kunci="paket_title"
            nilai={judul}
            nilaiEn={judulEn ?? judul}
            className={cn(
              "my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em]",
              gelap ? "text-white" : "text-ink",
            )}
          />
          <EditableText
            as="p"
            kunci="paket_subtitle"
            nilai={subjudul}
            nilaiEn={subjudulEn ?? subjudul}
            className={cn("text-sm", gelap ? "text-white/80" : "text-ink-muted")}
          />
        </div>

        {paket.length > 0 ? (
          <>
            <div className={kelasWadah}>
              {paket.map((item) => (
                <article
                  key={item.id}
                  className={cn(
                    "flex h-full flex-col justify-between rounded-panel border bg-surface p-6 text-center",
                    item.unggulan ? "border-2 border-accent" : "border-line",
                    kelasKartu,
                  )}
                >
                  <div>
                    {item.badge ? (
                      <Badge variant={item.unggulan ? "primary" : "success"} className="mb-3 inline-flex">
                        {item.badge}
                      </Badge>
                    ) : null}

                    <h3 className="text-xl font-bold tracking-[-0.03em] text-ink">{item.nama}</h3>

                    <div className="my-4 rounded-[10px] border border-divider bg-canvas px-3.5 py-3">
                      <strong data-numeric className="block text-base font-semibold text-ink">
                        {item.harga}
                      </strong>
                      <small className="block text-[11px] text-ink-muted">{item.durasi}</small>
                    </div>

                    <ul className="mb-5 flex flex-col gap-2 text-left">
                      {item.fitur.map((fitur) => (
                        <li key={fitur} className="flex items-start gap-2 text-[13px] text-ink-muted">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-hidden="true" />
                          {fitur}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    variant={item.unggulan ? "primary" : "outline"}
                    className="mt-auto w-full"
                  >
                    <Link href={item.ctaHref}>{item.ctaLabel} →</Link>
                  </Button>
                </article>
              ))}
            </div>

            {catatan ? (
              <p className={cn("mt-4.5 text-center text-[11px]", gelap ? "text-white/70" : "text-ink-subtle")}>
                {catatan}
              </p>
            ) : null}
          </>
        ) : (
          <p
            className={cn(
              "rounded-card border p-6 text-center text-sm",
              gelap ? "border-white/25 bg-white/10 text-white/85" : "border-line bg-surface text-ink-muted",
            )}
          >
            Daftar paket sedang tidak dapat dimuat.
          </p>
        )}

        {tambahan}
      </div>
    </section>
  );
}
