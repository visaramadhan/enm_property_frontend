import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  Check,
  Home as IkonHome,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";

import { EditableImage } from "@/components/editor/editable-image";
import { EditableText } from "@/components/editor/editable-text";
import { LandingPageEditor } from "@/components/editor/landing-page-editor";
import { EditableFaq } from "@/components/landing/editable-faq";
import { Footer } from "@/components/landing/footer";
import { HeaderLanding } from "@/components/landing/header-landing";
import { SkemaItemList } from "@/components/landing/skema-item-list";
import { TombolLacak } from "@/components/landing/tombol-lacak";
import { KartuProperti } from "@/components/properti/kartu-properti";
import { PenandaAsalBeranda } from "@/components/shared/asal-beranda";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { kontenLandingAman, paketPublikAman, propertiUnggulanAman } from "@/lib/api/server";
import { terjemah } from "@/lib/app-i18n";
import { formatAngka, formatRupiah } from "@/lib/format";
import { kamus, type Bahasa, type Kamus } from "@/lib/landing-i18n";
import { NAMA_SITUS, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type {
  LandingContentView,
  LandingFAQItem,
  LandingFooterLink,
  PlanView,
  PropertySummary,
} from "@/types/api";

/** Kelas pembungkus konten agar lebar maksimum dan padding seragam (DRY). */
const KONTAINER = "mx-auto w-full max-w-7xl px-4 lg:px-8";
/** Jarak aman jangkar bagian agar judul tidak tertutup kepala halaman lengket. */
const JANGKAR = "scroll-mt-[72px]";

/** Jumlah properti pilihan yang ditampilkan pada bagian katalog halaman depan. */
const JUMLAH_PROPERTI = 3;

/**
 * Ikon dan warna tiap keunggulan platform. Teksnya berasal dari kamus bahasa
 * (`keunggulan.item`) sehingga bagian ini tetap satu sumber data per bahasa.
 */
const IKON_KEUNGGULAN = [
  { ikon: Search, kelasIkon: "bg-primary/10 text-primary" },
  { ikon: MessageCircle, kelasIkon: "bg-secondary/10 text-secondary" },
  { ikon: IkonHome, kelasIkon: "bg-accent/16 text-ink" },
] as const;

/* --------------------------------------------------- Konten terpilih ------ */

/**
 * Nilai konten CMS yang sudah dipilih sesuai bahasa.
 *
 * Halaman Inggris memakai kolom `*_en`; bila kolom itu kosong, nilainya jatuh
 * ke teks bawaan kamus Inggris (bukan ke kolom Indonesia) supaya halaman `/en`
 * tidak pernah tampil campur bahasa.
 */
interface KontenTerpilih {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  metaTitle: string;
  metaDescription: string;
  ctaTitle: string;
  ctaDescription: string;
  keunggulanTitle: string;
  keunggulanSubtitle: string;
  propertiTitle: string;
  propertiSubtitle: string;
  paketTitle: string;
  paketSubtitle: string;
  panduanTitle: string;
  panduanSubtitle: string;
  faqTitle: string;
  faqSubtitle: string;
  /** Daftar tanya-jawab; memakai CMS bila terisi, selain itu teks bawaan kamus. */
  faqItems: LandingFAQItem[];
  footerBrandInitial: string;
  footerBrandName: string;
  footerDescription: string;
  footerCopyright: string;
  /** Tautan footer; memakai CMS bila terisi, selain itu teks bawaan kamus. */
  footerLinks: LandingFooterLink[];
}

/** Memilih kolom konten CMS sesuai bahasa lalu mengisi nilai kosong dari kamus. */
function pilihKonten(konten: LandingContentView, bahasa: Bahasa): KontenTerpilih {
  const kam = kamus(bahasa);
  const bawa = kam.bawaan;
  const inggris = bahasa === "en";
  const pilih = (id: string, en: string) => (inggris ? en : id) || "";
  const faqDariCms = inggris ? konten.faq_items_en : konten.faq_items;
  const tautanDariCms = (inggris ? konten.footer_links_en : konten.footer_links) ?? [];

  return {
    heroTitle: pilih(konten.hero_title, konten.hero_title_en) || bawa.judulHero,
    heroSubtitle: pilih(konten.hero_subtitle, konten.hero_subtitle_en) || bawa.subJudulHero,
    heroCta: pilih(konten.hero_cta_text, konten.hero_cta_text_en) || bawa.labelCtaHero,
    metaTitle: pilih(konten.meta_title, konten.meta_title_en),
    metaDescription: pilih(konten.meta_description, konten.meta_description_en),
    ctaTitle: pilih(konten.cta_title, konten.cta_title_en) || bawa.judulCta,
    ctaDescription: pilih(konten.cta_description, konten.cta_description_en) || bawa.deskripsiCta,
    keunggulanTitle: pilih(konten.keunggulan_title, konten.keunggulan_title_en) || bawa.judulKeunggulan,
    keunggulanSubtitle:
      pilih(konten.keunggulan_subtitle, konten.keunggulan_subtitle_en) || bawa.deskripsiKeunggulan,
    propertiTitle: pilih(konten.properti_title, konten.properti_title_en) || bawa.judulProperti,
    propertiSubtitle:
      pilih(konten.properti_subtitle, konten.properti_subtitle_en) || bawa.deskripsiProperti,
    paketTitle: pilih(konten.paket_title, konten.paket_title_en) || bawa.judulPaket,
    paketSubtitle: pilih(konten.paket_subtitle, konten.paket_subtitle_en) || bawa.deskripsiPaket,
    panduanTitle: pilih(konten.panduan_title, konten.panduan_title_en) || bawa.judulPanduan,
    panduanSubtitle:
      pilih(konten.panduan_subtitle, konten.panduan_subtitle_en) || bawa.deskripsiPanduan,
    faqTitle: pilih(konten.faq_title, konten.faq_title_en) || bawa.judulFaq,
    faqSubtitle: pilih(konten.faq_subtitle, konten.faq_subtitle_en) || bawa.deskripsiFaq,
    faqItems: faqDariCms.length > 0 ? faqDariCms : kam.faq.item,
    footerBrandInitial: konten.footer_brand_initial || kam.footer.brandInitial,
    footerBrandName: konten.footer_brand_name || kam.footer.brandName,
    footerDescription:
      pilih(konten.footer_description, konten.footer_description_en) || kam.footer.deskripsi,
    footerCopyright: pilih(konten.footer_copyright, konten.footer_copyright_en) || kam.footer.hakCipta,
    footerLinks: tautanDariCms.length > 0 ? tautanDariCms : kam.footer.tautan,
  };
}

/* --------------------------------------------------------------- Metadata -- */

/**
 * Metadata halaman landing untuk satu bahasa.
 *
 * Seluruh nilai berasal dari modul Metadata SEO di CMS (`standar_cms.txt`
 * bagian 1.B). Halaman Indonesia memakai kolom utama, halaman Inggris memakai
 * varian `*_en`, dan keduanya ditautkan lewat `alternates.languages` (hreflang)
 * agar Googlebot mengenali pasangan terjemahan.
 */
export async function metadataLanding(bahasa: Bahasa): Promise<Metadata> {
  const konten = await kontenLandingAman();
  const k = kamus(bahasa);
  const t = pilihKonten(konten, bahasa);

  const judul = t.metaTitle || t.heroTitle || `${NAMA_SITUS} - ${k.meta.judulBawaan}`;
  const deskripsi = t.metaDescription || t.heroSubtitle || k.bawaan.subJudulHero;
  const gambar = konten.meta_og_image || konten.hero_image_url;
  const kanonik = bahasa === "en" ? `${SITE_URL}/en` : SITE_URL;

  return {
    // `absolute` mencegah judul dari CMS ditempeli template judul di layout.
    title: { absolute: judul },
    description: deskripsi,
    alternates: {
      canonical: kanonik,
      languages: {
        "id-ID": SITE_URL,
        "en-US": `${SITE_URL}/en`,
        "x-default": SITE_URL,
      },
    },
    openGraph: {
      type: "website",
      locale: k.meta.locale,
      url: kanonik,
      siteName: NAMA_SITUS,
      title: judul,
      description: deskripsi,
      images: gambar ? [{ url: gambar, width: 1200, height: 630, alt: judul }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: judul,
      description: deskripsi,
      images: gambar ? [gambar] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

/* ------------------------------------------------------------------ Halaman */

/**
 * Landing page untuk satu bahasa.
 *
 * Dirender sebagai Server Component sehingga seluruh teks utama sudah ada di
 * HTML awal — syarat perayapan Googlebot (`standa_seo_web.txt` bagian 1.A).
 * Dipakai bersama oleh rute `/` (Indonesia) dan `/en` (Inggris); bahasa
 * menentukan kolom CMS dan kamus teks statis yang dipakai.
 */
export async function LandingHalaman({ bahasa }: { bahasa: Bahasa }) {
  const [konten, properti, paket] = await Promise.all([
    kontenLandingAman(),
    propertiUnggulanAman(JUMLAH_PROPERTI),
    paketPublikAman(),
  ]);

  const t = pilihKonten(konten, bahasa);
  const k = kamus(bahasa);
  const area = konten.highlight_areas.slice(0, 6);
  const areaUtama = area[0] ?? "Bali";

  return (
    <LandingPageEditor bahasa={bahasa}>
      <HeaderLanding bahasa={bahasa} />
      <PenandaAsalBeranda />
      <main className="flex flex-1 flex-col">
        <Hero konten={konten} t={t} k={k} properti={properti} area={area} areaUtama={areaUtama} />
        <Keunggulan t={t} k={k} />
        <PropertiPilihan daftar={properti} t={t} k={k} />
        <PaketMitra daftar={paket} t={t} k={k} bahasa={bahasa} />
        <PanduanMitra t={t} k={k} />
        <EditableFaq
          eyebrow={k.faq.eyebrow}
          judul={t.faqTitle}
          subjudul={t.faqSubtitle}
          items={t.faqItems}
        />
      </main>

      <Footer konten={konten} bahasa={bahasa} tahun={<TahunHakCipta />} />
    </LandingPageEditor>
  );
}

/* ------------------------------------------------------------- Bagian UI -- */

/** Label kecil bergaris di sisi kiri judul bagian. */
function Eyebrow({
  children,
  center = false,
  gold = false,
}: {
  children: ReactNode;
  center?: boolean;
  gold?: boolean;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase",
        "before:h-0.5 before:w-5 before:rounded-full before:bg-current before:content-['']",
        gold ? "text-accent" : "text-primary",
        center && "justify-center",
      )}
    >
      {children}
    </p>
  );
}

/** Judul bagian terpusat dengan deskripsi singkat. */
function KepalaBagian({ children }: { children: ReactNode }) {
  return <div className="mx-auto mb-9 max-w-[720px] text-center">{children}</div>;
}

/**
 * Menyusun sumber gambar kolase hero.
 *
 * Urutan prioritas: daftar gambar kolase dari CMS (`hero_images`), lalu gambar
 * hero tunggal (`hero_image_url`), dan terakhir foto properti teratas. Dengan
 * begitu kolase tetap terisi walau tim marketing baru mengunggah sebagian.
 */
function gambarKolase(
  daftarCms: string[],
  hero: string,
  daftar: PropertySummary[],
): string[] {
  const dariProperti = daftar.map((item) => item.cover_url);
  return [...daftarCms, hero, ...dariProperti].filter((url) => url.length > 0).slice(0, 4);
}

/** Bagian hero: judul utama (H1 tunggal), CTA, wilayah unggulan, dan kolase foto. */
function Hero({
  konten,
  t,
  k,
  properti,
  area,
  areaUtama,
}: {
  konten: LandingContentView;
  t: KontenTerpilih;
  k: Kamus;
  properti: PropertySummary[];
  area: string[];
  areaUtama: string;
}) {
  const gambar = gambarKolase(konten.hero_images, konten.hero_image_url, properti);
  const altKolase = k.hero.altKolase(areaUtama, t.heroTitle);

  return (
    <section
      id="beranda"
      className={cn(JANGKAR, "bg-[linear-gradient(180deg,#FBF9F6,#F7F3ED)] pt-12 pb-14 md:pt-16 md:pb-[72px]")}
    >
      <div className={cn(KONTAINER, "grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12")}>
        <div>
          <Eyebrow>{k.hero.eyebrow}</Eyebrow>

          <EditableText
            as="h1"
            kunci="hero_title"
            nilai={t.heroTitle}
            className="my-4 max-w-2xl text-[clamp(30px,4.2vw,44px)] leading-[1.15] font-bold tracking-[-0.04em] text-ink"
          />

          <EditableText
            as="p"
            multiline
            kunci="hero_subtitle"
            nilai={t.heroSubtitle}
            className="max-w-[470px] text-base leading-[1.65] text-ink-muted"
          />

          <div className="mt-6 mb-4 flex flex-wrap gap-3">
            <TombolLacak href="/katalog" section="hero_banner" label={t.heroCta} size="lg">
              {t.heroCta} →
            </TombolLacak>
            <Button asChild variant="outline" size="lg">
              <Link href="/register?role=mitra">{k.hero.ctaSekunder}</Link>
            </Button>
          </div>

          {area.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">
                {k.hero.labelArea}
              </span>
              {area.map((nama) => (
                <Link
                  key={nama}
                  href={`/katalog?city=${encodeURIComponent(nama)}`}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  {nama}
                </Link>
              ))}
            </div>
          ) : null}

          <p className="mt-5 flex items-center gap-2 text-xs text-ink-muted">
            <ShieldCheck className="size-4 shrink-0 text-secondary" aria-hidden="true" />
            {k.hero.catatan}
          </p>
        </div>

        <div className="relative h-[300px] sm:h-[400px]" aria-label={k.hero.ariaKolase}>
          <EditableImage
            indeks={0}
            sumber={gambar[0]}
            alt={altKolase}
            utama
            kelas="top-0 right-0 left-[20%] h-[210px] sm:left-[34%] sm:h-[285px]"
          />
          <EditableImage
            indeks={1}
            sumber={gambar[1]}
            alt={altKolase}
            kelas="top-[130px] right-[56%] left-0 h-[130px] border-[5px] border-canvas sm:top-[150px] sm:right-1/2 sm:h-[185px]"
          />
          <EditableImage
            indeks={2}
            sumber={gambar[2]}
            alt={altKolase}
            kelas="bottom-0 left-[40%] right-[22%] h-[100px] border-[5px] border-canvas sm:h-[140px]"
          />
          <EditableImage
            indeks={3}
            sumber={gambar[3]}
            alt={altKolase}
            kelas="right-0 bottom-0 left-[78%] hidden h-[90px] sm:block"
          />

          <div className="absolute top-[14px] right-[2%] left-[30%] z-2 flex items-center gap-2 rounded-[10px] border border-line bg-surface px-3 py-2.5 text-xs font-semibold shadow-md sm:top-[22px] sm:right-[4%] sm:left-[66%]">
            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {k.hero.chip}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Tiga keunggulan utama platform. */
function Keunggulan({ t, k }: { t: KontenTerpilih; k: Kamus }) {
  return (
    <section className="border-y border-line bg-surface">
      <div className={cn(KONTAINER, "py-9")}>
        {t.keunggulanTitle || t.keunggulanSubtitle ? (
          <KepalaBagian>
            <Eyebrow center>{k.keunggulan.eyebrow}</Eyebrow>
            <EditableText
              as="h2"
              kunci="keunggulan_title"
              nilai={t.keunggulanTitle}
              className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-ink"
            />
            {t.keunggulanSubtitle ? (
              <EditableText
                as="p"
                kunci="keunggulan_subtitle"
                nilai={t.keunggulanSubtitle}
                className="text-sm text-ink-muted"
              />
            ) : null}
          </KepalaBagian>
        ) : null}

        <div className="grid md:grid-cols-3 md:divide-x md:divide-line">
          {k.keunggulan.item.map((item, indeks) => {
            const Ikon = IKON_KEUNGGULAN[indeks].ikon;
            return (
              <article key={item.judul} className="flex gap-4 px-1 py-3 md:px-6 md:first:pl-0">
                <div
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-card",
                    IKON_KEUNGGULAN[indeks].kelasIkon,
                  )}
                >
                  <Ikon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-semibold text-ink">{item.judul}</h3>
                  <p className="text-sm leading-[1.55] text-ink-muted">{item.deskripsi}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Daftar properti pilihan.
 *
 * Urutan kartu mengikuti algoritma pengurutan backend; urutan yang sama juga
 * dipakai pada skema JSON-LD `ItemList` agar sinyal ke Googlebot konsisten
 * dengan peringkat internal platform.
 */
function PropertiPilihan({
  daftar,
  t,
  k,
}: {
  daftar: PropertySummary[];
  t: KontenTerpilih;
  k: Kamus;
}) {
  return (
    <section id="properti" className={cn(JANGKAR, "py-12 sm:py-14 lg:py-16")}>
      <div className={KONTAINER}>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{k.properti.eyebrow}</Eyebrow>
            <EditableText
              as="h2"
              kunci="properti_title"
              nilai={t.propertiTitle}
              className="my-2 text-2xl font-semibold tracking-[-0.025em] text-ink"
            />
            <EditableText
              as="p"
              kunci="properti_subtitle"
              nilai={t.propertiSubtitle}
              className="text-sm text-ink-muted"
            />
          </div>
          <Link
            href="/katalog"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-ink"
          >
            {k.properti.lihatSemua}
          </Link>
        </div>

        {daftar.length > 0 ? (
          <>
            <SkemaItemList
              nama={k.properti.skemaNama(daftar[0]?.city ?? "Bali")}
              properti={daftar.map((item) => ({ slug: item.slug, title: item.title }))}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {daftar.map((item) => (
                <KartuProperti key={item.id} properti={item} />
              ))}
            </div>
          </>
        ) : (
          <p className="rounded-card border border-line bg-surface p-6 text-sm text-ink-muted">
            {k.properti.kosongTeks}{" "}
            <Link href="/katalog" className="font-semibold text-primary">
              {k.properti.kosongTautan}
            </Link>{" "}
            {k.properti.kosongSufiks}
          </p>
        )}
      </div>
    </section>
  );
}

/** Label harga paket dengan fallback format rupiah. */
function labelHarga(paket: PlanView, labelGratis: string) {
  if (paket.is_free) return labelGratis;
  return paket.price_label || formatRupiah(paket.price);
}

/** Baris tabel perbandingan; nilainya dihitung dari satu sumber data paket. */
function barisPerbandingan(
  baris: Kamus["paket"]["baris"],
  labelGratis: string,
): Array<{ label: string; nilai: (paket: PlanView) => ReactNode }> {
  return [
    { label: baris.harga, nilai: (paket) => labelHarga(paket, labelGratis) },
    {
      label: baris.masaAktif,
      nilai: (paket) =>
        paket.duration_days > 0 ? baris.hari(formatAngka(paket.duration_days)) : baris.tanpaBatas,
    },
    {
      label: baris.kapasitas,
      nilai: (paket) =>
        paket.is_unlimited ? baris.tanpaBatas : baris.listing(formatAngka(paket.listing_quota)),
    },
    { label: baris.boost, nilai: (paket) => (paket.boost_enabled ? baris.tersedia : baris.tanpaNilai) },
    {
      label: baris.keyword,
      nilai: (paket) => (paket.keyword_access ? baris.tersedia : baris.tanpaNilai),
    },
    {
      label: baris.katalog,
      nilai: (paket) => (paket.catalog_access ? baris.tersedia : baris.tanpaNilai),
    },
    {
      label: baris.whatsapp,
      nilai: (paket) => (paket.whatsapp_access ? baris.tersedia : baris.tanpaNilai),
    },
    { label: baris.fitur, nilai: (paket) => baris.jumlahFitur(formatAngka(paket.features.length)) },
    {
      label: baris.pendaftaran,
      nilai: (paket) => (paket.is_free ? baris.registrasi : baris.checkout),
    },
    {
      label: baris.pembayaran,
      nilai: (paket) => (paket.is_free ? baris.tidakPerlu : baris.melaluiPembayaran),
    },
  ];
}

/**
 * Bagian paket kemitraan.
 *
 * Seluruh nilai (harga, kuota, dan akses fitur) dibaca dari data paket aktif
 * sehingga kartu dan tabel perbandingan di bawahnya selalu seragam
 * (`standar_cms.txt` bagian 1 — satu sumber data).
 */
function PaketMitra({
  daftar,
  t,
  k,
  bahasa,
}: {
  daftar: PlanView[];
  t: KontenTerpilih;
  k: Kamus;
  bahasa: Bahasa;
}) {
  const inggris = bahasa === "en";
  const unggulanId = daftar
    .filter((paket) => !paket.is_free)
    .reduce<PlanView | null>(
      (terbaik, paket) => (!terbaik || paket.level > terbaik.level ? paket : terbaik),
      null,
    )
    ?.id;
  const baris = barisPerbandingan(k.paket.baris, k.paket.gratis);

  return (
    <section id="paket" className={cn(JANGKAR, "bg-secondary py-12 sm:py-16")}>
      <div className={KONTAINER}>
        <KepalaBagian>
          <Eyebrow center gold>
            {k.paket.eyebrow}
          </Eyebrow>
          <EditableText
            as="h2"
            kunci="paket_title"
            nilai={t.paketTitle}
            className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-white"
          />
          <EditableText
            as="p"
            kunci="paket_subtitle"
            nilai={t.paketSubtitle}
            className="text-sm text-white/80"
          />
        </KepalaBagian>

        {daftar.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {daftar.map((paket) => (
                <article
                  key={paket.id}
                  className={cn(
                    "flex flex-col rounded-panel border bg-surface p-6 text-center",
                    paket.id === unggulanId ? "border-2 border-accent" : "border-line",
                  )}
                >
                  <Badge
                    variant={paket.is_free ? "success" : "primary"}
                    className="self-center"
                  >
                    {paket.is_free ? k.paket.badgeGratis : k.paket.badgeMitra}
                  </Badge>

                  <h3 className="mt-3.5 mb-1.5 text-xl font-bold tracking-[-0.03em] text-ink">
                    {paket.name}
                  </h3>

                  <p className="mb-4 min-h-[60px] text-[13px] leading-[1.55] text-ink-muted">
                    {(inggris ? paket.description_en : "") ||
                      (paket.description ? terjemah(bahasa, paket.description) : "") ||
                      k.paket.deskripsiBawaan}
                  </p>

                  <div className="mt-auto mb-4 rounded-[10px] border border-divider bg-canvas px-3.5 py-3">
                    <small className="block text-[11px] text-ink-muted">{k.paket.labelHarga}</small>
                    <strong data-numeric className="my-0.5 block text-base font-semibold text-ink">
                      {labelHarga(paket, k.paket.gratis)}
                    </strong>
                    <small className="block text-[11px] text-ink-muted">
                      {paket.duration_days > 0
                        ? k.paket.baris.hari(formatAngka(paket.duration_days))
                        : k.paket.tanpaBatasWaktu}
                    </small>
                  </div>

                  <Button
                    asChild
                    variant={paket.id === unggulanId ? "primary" : "outline"}
                    className="w-full"
                  >
                    <Link href={`/checkout/${paket.slug}`}>{k.paket.pilih(paket.name)}</Link>
                  </Button>
                </article>
              ))}
            </div>

            <p className="mt-4.5 text-center text-[11px] text-white/70">{k.paket.catatan}</p>

            <div className="mt-10 sm:mt-14">
              <h3 className="mb-4.5 text-center text-xl font-semibold text-white">
                {k.paket.perbandingan}
              </h3>
              <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
                <table className="w-full min-w-[760px] border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="bg-[#263E34] p-4 text-left text-[13px] font-semibold text-white">
                        {k.paket.kolomInfo}
                      </th>
                      {daftar.map((paket) => (
                        <th
                          key={paket.id}
                          className="bg-[#263E34] p-4 text-center text-[13px] font-semibold text-white"
                        >
                          {paket.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {baris.map((item) => (
                      <tr key={item.label}>
                        <th className="border-t border-line bg-canvas p-4 text-left font-semibold text-ink">
                          {item.label}
                        </th>
                        {daftar.map((paket) => (
                          <td
                            key={paket.id}
                            className="border-t border-line bg-surface p-4 text-center text-ink-muted"
                          >
                            {item.nilai(paket)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-white/70">{k.paket.catatanTabel}</p>
            </div>
          </>
        ) : (
          <p className="rounded-card border border-white/25 bg-white/10 p-6 text-center text-sm text-white/85">
            {k.paket.kosongTeks}{" "}
            <Link href="/paket" className="font-semibold text-accent">
              {k.paket.kosongTautan}
            </Link>{" "}
            {k.paket.kosongSufiks}
          </p>
        )}
      </div>
    </section>
  );
}

/** Panduan kemitraan: empat langkah, daftar persiapan, dan alur setelah mendaftar. */
function PanduanMitra({ t, k }: { t: KontenTerpilih; k: Kamus }) {
  return (
    <section id="panduan" className={cn(JANGKAR, "bg-canvas py-12 sm:py-16")}>
      <div className={KONTAINER}>
        <KepalaBagian>
          <Eyebrow center>{k.panduan.eyebrow}</Eyebrow>
          <EditableText
            as="h2"
            kunci="panduan_title"
            nilai={t.panduanTitle}
            className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-ink"
          />
          <EditableText
            as="p"
            kunci="panduan_subtitle"
            nilai={t.panduanSubtitle}
            className="text-sm text-ink-muted"
          />
        </KepalaBagian>

        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {k.panduan.langkah.map((langkah) => (
            <article
              key={langkah.nomor}
              className="rounded-panel border border-line bg-surface p-6 shadow-sm"
            >
              <div className="grid size-[38px] place-items-center rounded-[11px] bg-primary-tint text-xs font-extrabold text-primary">
                {langkah.nomor}
              </div>
              <h3 className="mt-3.5 mb-2 text-base font-bold text-ink">{langkah.judul}</h3>
              <p className="mb-3.5 text-[13px] leading-[1.65] text-ink-muted">{langkah.deskripsi}</p>
              {"tautan" in langkah && langkah.tautan ? (
                <Link
                  href={langkah.tautan.href}
                  className="inline-block rounded-[5px] bg-secondary-tint px-2 py-[5px] text-[11px] font-bold text-secondary"
                >
                  {langkah.tautan.label} ↗
                </Link>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Eyebrow>{k.panduan.sebelumEyebrow}</Eyebrow>
            <h2 className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-ink">
              {k.panduan.sebelumJudul}
            </h2>
            <p className="mb-4.5 text-sm leading-[1.6] text-ink-muted">{k.panduan.sebelumDeskripsi}</p>

            <div className="flex flex-col gap-3">
              {k.panduan.persiapan.map((item) => (
                <div key={item.judul} className="flex gap-3 text-[13px] leading-[1.6] text-ink-muted">
                  <span
                    className="grid size-[25px] shrink-0 place-items-center rounded-lg bg-secondary-tint text-secondary"
                    aria-hidden="true"
                  >
                    <Check className="size-3.5" />
                  </span>
                  <span>
                    <strong className="block text-ink">{item.judul}</strong>
                    {item.keterangan}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-panel border border-line bg-surface p-6">
            <Eyebrow>{k.panduan.setelahEyebrow}</Eyebrow>
            <div className="mt-2">
              {k.panduan.alur.map((alur, indeks) => (
                <div
                  key={alur.judul}
                  className="flex gap-5 border-b border-divider py-4 last:border-b-0"
                >
                  <div className="grid size-[34px] shrink-0 place-items-center rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground">
                    {indeks + 1}
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-bold text-ink">{alur.judul}</h3>
                    <p className="text-xs leading-[1.6] text-ink-muted">{alur.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Tahun hak cipta.
 *
 * `new Date()` tidak boleh dievaluasi langsung saat prerender (Next.js 16
 * menandainya sebagai nilai tidak stabil), maka nilainya dihitung di dalam
 * cakupan `"use cache"` dengan profil `cacheLife` eksplisit agar tetap ikut
 * diprerender dan disimpan.
 */
async function TahunHakCipta() {
  "use cache";
  cacheLife({ stale: 86400, revalidate: 604800, expire: 2592000 });

  return <>{new Date().getFullYear()}</>;
}
