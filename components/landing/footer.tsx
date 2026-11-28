"use client";

import type { ReactNode } from "react";
import Link from "next/link";
// lucide-react v1 tidak lagi menyertakan ikon merek (Instagram/LinkedIn), jadi
// media sosial memakai ikon generik dengan `aria-label` yang tetap deskriptif.
import { Briefcase, Camera, Clock, Mail, MapPin, MessageCircle, Music2 } from "lucide-react";

import { EditableText } from "@/components/editor/editable-text";
import type { Bahasa } from "@/lib/bahasa";
import { cn } from "@/lib/utils";
import type { LandingContentView } from "@/types/api";

/**
 * Kaki halaman (footer) landing page ENM Property.
 *
 * Terdiri dari empat kolom yang responsif (1 kolom di seluler, 2 kolom di
 * tablet, 4 kolom di desktop): identitas perusahaan, navigasi perusahaan,
 * tautan legal, dan kontak dukungan. Seluruh teks kontak serta identitas
 * dibaca dari CMS sehingga dapat disunting lewat menu Landing Page maupun
 * editor visual.
 */

/** Konten bawaan footer saat kolom CMS masih kosong. */
const BAWAAN = {
  brandInitial: "EP",
  brandName: "ENM Property (PT Eka Nevada Mandiri)",
  description:
    "Platform listing properti untuk mencari properti yang sesuai atau memasarkan listing melalui akun mitra.",
  descriptionEn:
    "A property listing platform to find the right property or market listings through a partner account.",
  address: "Jl. Sunset Road No. 88, Seminyak, Kuta, Badung, Bali 80361",
  addressEn: "Jl. Sunset Road No. 88, Seminyak, Kuta, Badung, Bali 80361",
  phone: "+62 812-3456-7890",
  email: "support@enmproperty.com",
  hours: "Senin – Sabtu, 09.00 – 18.00 WITA",
  hoursEn: "Monday – Saturday, 09.00 – 18.00 WITA",
  instagram: "enmproperty2026",
  tiktok: "enmproperty",
  linkedin: "enm-property",
  copyright: "PT Eka Nevada Mandiri (ENM Property). All rights reserved.",
} as const;

/** Tautan kolom "Perusahaan" beserta padanan bahasa Inggrisnya. */
const TAUTAN_PERUSAHAAN = [
  { href: "/about-us", id: "Tentang Kami", en: "About Us" },
  { href: "/katalog", id: "Properti Dijual & Disewa", en: "Properties for Sale & Rent" },
  { href: "#paket", id: "Paket Mitra", en: "Partner Plans" },
  { href: "#panduan", id: "Panduan Kemitraan", en: "Partnership Guide" },
  { href: "/katalog", id: "Katalog Properti", en: "Property Catalog" },
] as const;

/** Tautan kolom "Legal". */
const TAUTAN_LEGAL = [
  { href: "/disclaimer", id: "Disclaimer", en: "Disclaimer" },
  { href: "/privacy-policy", id: "Kebijakan Privasi", en: "Privacy Policy" },
  { href: "/vendor-agreement", id: "Perjanjian Mitra", en: "Vendor Agreement" },
] as const;

/** Empat tautan cepat pada bilah bawah. */
const TAUTAN_CEPAT = [
  { href: "/about-us", id: "Tentang Kami", en: "About Us" },
  { href: "/disclaimer", id: "Disclaimer", en: "Disclaimer" },
  { href: "/privacy-policy", id: "Kebijakan Privasi", en: "Privacy Policy" },
  { href: "/vendor-agreement", id: "Perjanjian Mitra", en: "Vendor Agreement" },
] as const;

/** Mengubah nomor telepon menjadi tautan `wa.me`. */
function tautanWhatsApp(nomor: string): string {
  const angka = nomor.replace(/[^\d]/g, "").replace(/^0/, "62");
  return `https://wa.me/${angka}`;
}

interface FooterProps {
  /** Konten lengkap landing page (dipakai mengambil kolom footer). */
  konten: LandingContentView;
  /** Bahasa halaman; menentukan label statis dan varian teks. */
  bahasa: Bahasa;
  /**
   * Simpul tahun hak cipta yang dihitung di server (`"use cache"`), agar tidak
   * dievaluasi langsung saat prerender. Bila kosong (editor sisi klien),
   * tahun dihitung saat render klien.
   */
  tahun?: ReactNode;
  className?: string;
}

export function Footer({ konten, bahasa, tahun, className }: FooterProps) {
  const inggris = bahasa === "en";
  const lbl = inggris
    ? {
        brandAria: "ENM Property home",
        perusahaan: "Company",
        legal: "Legal",
        kontak: "Contact Us",
      }
    : {
        brandAria: "ENM Property beranda",
        perusahaan: "Perusahaan",
        legal: "Legal",
        kontak: "Hubungi Kami",
      };

  const brandInitial = konten.footer_brand_initial || BAWAAN.brandInitial;
  const brandName = konten.footer_brand_name || BAWAAN.brandName;
  const telepon = konten.footer_phone || BAWAAN.phone;
  const surel = konten.footer_email || BAWAAN.email;
  const instagram = konten.footer_instagram || BAWAAN.instagram;
  const tiktok = konten.footer_tiktok || BAWAAN.tiktok;
  const linkedin = konten.footer_linkedin || BAWAAN.linkedin;

  return (
    <footer className={cn("border-t border-line bg-surface pt-12 pb-6", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kolom 1: identitas perusahaan */}
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label={lbl.brandAria}>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                <EditableText
                  kunci="footer_brand_initial"
                  nilai={brandInitial}
                  bervariasi={false}
                  badge={false}
                />
              </span>
              <EditableText
                as="span"
                kunci="footer_brand_name"
                nilai={brandName}
                nilaiEn={brandName}
                bervariasi={false}
                className="text-base font-bold tracking-tight text-ink"
              />
            </Link>

            <EditableText
              as="p"
              multiline
              kunci="footer_description"
              nilai={konten.footer_description || BAWAAN.description}
              nilaiEn={konten.footer_description_en || BAWAAN.descriptionEn}
              className="mt-3 max-w-[340px] text-xs leading-[1.7] text-ink-muted"
            />

            <p className="mt-4 flex items-start gap-2 text-xs leading-[1.7] text-ink-muted">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <EditableText
                as="span"
                multiline
                kunci="footer_address"
                nilai={konten.footer_address || BAWAAN.address}
                nilaiEn={konten.footer_address_en || BAWAAN.addressEn}
                className="text-xs leading-[1.7] text-ink-muted"
              />
            </p>
          </div>

          {/* Kolom 2: navigasi perusahaan */}
          <nav aria-label={lbl.perusahaan}>
            <h3 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink uppercase">
              {lbl.perusahaan}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {TAUTAN_PERUSAHAAN.map((tautan) => (
                <li key={`${tautan.href}-${tautan.id}`}>
                  <Link
                    href={tautan.href}
                    className="text-xs text-ink-muted transition-colors hover:text-primary"
                  >
                    {inggris ? tautan.en : tautan.id}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolom 3: tautan legal */}
          <nav aria-label={lbl.legal}>
            <h3 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink uppercase">
              {lbl.legal}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {TAUTAN_LEGAL.map((tautan) => (
                <li key={tautan.href}>
                  <Link
                    href={tautan.href}
                    className="text-xs text-ink-muted transition-colors hover:text-primary"
                  >
                    {inggris ? tautan.en : tautan.id}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolom 4: kontak & media sosial */}
          <div>
            <h3 className="mb-3 text-xs font-bold tracking-[0.08em] text-ink uppercase">
              {lbl.kontak}
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-ink-muted">
              <li className="flex items-center gap-2">
                <MessageCircle className="size-3.5 shrink-0 text-secondary" aria-hidden="true" />
                <a
                  href={tautanWhatsApp(telepon)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  <EditableText
                    kunci="footer_phone"
                    nilai={telepon}
                    bervariasi={false}
                    badge={false}
                  />
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 shrink-0 text-secondary" aria-hidden="true" />
                <a
                  href={`mailto:${surel}`}
                  className="transition-colors hover:text-primary"
                >
                  <EditableText kunci="footer_email" nilai={surel} bervariasi={false} badge={false} />
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-3.5 shrink-0 text-secondary" aria-hidden="true" />
                <EditableText
                  as="span"
                  multiline
                  kunci="footer_hours"
                  nilai={konten.footer_hours || BAWAAN.hours}
                  nilaiEn={konten.footer_hours_en || BAWAAN.hoursEn}
                  className="text-xs leading-[1.7] text-ink-muted"
                />
              </li>
            </ul>

            <div className="mt-4 flex items-center gap-2">
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram @${instagram}`}
                className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-primary hover:text-primary"
              >
                <Camera className="size-4" aria-hidden="true" />
              </a>
              <a
                href={`https://tiktok.com/@${tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`TikTok @${tiktok}`}
                className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-primary hover:text-primary"
              >
                <Music2 className="size-4" aria-hidden="true" />
              </a>
              <a
                href={`https://linkedin.com/company/${linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn ${linkedin}`}
                className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-primary hover:text-primary"
              >
                <Briefcase className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Bilah bawah */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-divider pt-5 text-[11px] text-ink-subtle sm:flex-row">
          <p className="text-center sm:text-left">
            © {tahun ?? new Date().getFullYear()}{" "}
            <EditableText
              kunci="footer_copyright"
              nilai={konten.footer_copyright || BAWAAN.copyright}
              nilaiEn={konten.footer_copyright_en || BAWAAN.copyright}
            />
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {TAUTAN_CEPAT.map((tautan) => (
              <li key={tautan.href}>
                <Link href={tautan.href} className="transition-colors hover:text-primary">
                  {inggris ? tautan.en : tautan.id}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
