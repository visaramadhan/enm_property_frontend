import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  Check,
  Home as IkonHome,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { HeaderLanding } from "@/components/landing/header-landing";
import { MenuAkun } from "@/components/layout/menu-akun";
import { SkemaItemList } from "@/components/landing/skema-item-list";
import { TombolLacak } from "@/components/landing/tombol-lacak";
import { KartuProperti } from "@/components/properti/kartu-properti";
import { PenandaAsalBeranda } from "@/components/shared/asal-beranda";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { kontenLandingAman, paketPublikAman, propertiUnggulanAman } from "@/lib/api/server";
import { formatAngka, formatRupiah } from "@/lib/format";
import { NAMA_SITUS, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { LandingContentView, PlanView, PropertySummary } from "@/types/api";

/** Kelas pembungkus konten agar lebar maksimum dan padding seragam (DRY). */
const KONTAINER = "mx-auto w-full max-w-7xl px-4 lg:px-8";
/** Jarak aman jangkar bagian agar judul tidak tertutup kepala halaman lengket. */
const JANGKAR = "scroll-mt-[72px]";

/** Jumlah properti pilihan yang ditampilkan pada bagian katalog halaman depan. */
const JUMLAH_PROPERTI = 3;

/* --------------------------------------------------- Konten statis bagian -- */

/** Tiga keunggulan utama platform (bagian "Keunggulan"). */
const KEUNGGULAN = [
  {
    ikon: Search,
    judul: "Cari Properti",
    deskripsi: "Jelajahi listing properti untuk disewa atau dibeli sesuai kebutuhanmu.",
    kelasIkon: "bg-primary/10 text-primary",
  },
  {
    ikon: MessageCircle,
    judul: "Informasi dan Kontak",
    deskripsi: "Pelajari detail properti dan hubungi kontak yang tersedia melalui WhatsApp.",
    kelasIkon: "bg-secondary/10 text-secondary",
  },
  {
    ikon: IkonHome,
    judul: "Pasarkan Properti",
    deskripsi: "Kelola informasi, foto, harga, dan ketersediaan listing melalui akun mitra.",
    kelasIkon: "bg-accent/16 text-ink",
  },
] as const;

/** Empat langkah menjadi mitra. */
const LANGKAH_MITRA: ReadonlyArray<{
  nomor: string;
  judul: string;
  deskripsi: string;
  /** Tautan pendukung pada langkah tertentu (mis. menuju bagian paket). */
  tautan?: { href: string; label: string };
}> = [
  {
    nomor: "01",
    judul: "Pilih paket",
    deskripsi:
      "Bandingkan paket yang tersedia. Harga, durasi, kuota, dan fitur mengikuti data paket aktif ENM Property.",
    tautan: { href: "#paket", label: "Lihat paket" },
  },
  {
    nomor: "02",
    judul: "Masuk atau daftar",
    deskripsi: "Gunakan akun ENM. Jika belum memiliki akun, daftar melalui email atau Google Sign-In.",
  },
  {
    nomor: "03",
    judul: "Lengkapi data mitra",
    deskripsi:
      "Isi nama usaha atau agen dan nomor WhatsApp aktif. Alamat usaha dapat dilengkapi bila diperlukan.",
  },
  {
    nomor: "04",
    judul: "Setujui perjanjian",
    deskripsi:
      "Baca perjanjian kemitraan yang berlaku, kemudian ikuti proses aktivasi sesuai paket pilihan.",
  },
] as const;

/** Informasi yang perlu disiapkan sebelum mendaftar sebagai mitra. */
const PERSIAPAN_MITRA = [
  {
    judul: "Akun ENM Property",
    keterangan: "Email dan nama akun yang akan digunakan.",
  },
  {
    judul: "Nama usaha atau agen",
    keterangan: "Nama yang digunakan pada profil kemitraan.",
  },
  {
    judul: "Nomor WhatsApp aktif",
    keterangan: "Nomor kontak mitra yang dapat dihubungi.",
  },
  {
    judul: "Informasi properti",
    keterangan:
      "Judul, jenis listing, lokasi, foto, harga, dan ketersediaan sesuai kondisi properti.",
  },
  {
    judul: "Perjanjian kemitraan",
    keterangan: "Baca dan setujui versi perjanjian yang berlaku sebelum melanjutkan.",
  },
] as const;

/** Alur yang dijalani mitra setelah mendaftar. */
const ALUR_MITRA = [
  {
    judul: "Pilih alur aktivasi",
    deskripsi:
      "Paket Free tidak memerlukan pembayaran. Paket berlangganan melanjutkan ke tahapan pembayaran yang disediakan.",
  },
  {
    judul: "Lengkapi listing",
    deskripsi:
      "Isi data properti, foto, lokasi, harga per periode yang relevan, dan ketersediaan unit sesuai informasi aktual.",
  },
  {
    judul: "Simpan dan tayangkan",
    deskripsi:
      "Kelola listing dari dashboard mitra. Listing yang berstatus aktif akan tampil di katalog publik ENM Property.",
  },
  {
    judul: "Kelola kontak dan ketersediaan",
    deskripsi:
      "Perbarui informasi properti agar calon penyewa atau pembeli melihat detail yang sesuai dengan listing.",
  },
] as const;

/** Pertanyaan yang sering diajukan calon mitra. */
const DAFTAR_FAQ = [
  {
    tanya: "Apakah semua paket membutuhkan pembayaran?",
    jawab:
      "Tidak. Paket Free mengikuti alur pendaftaran tanpa pembayaran. Paket berlangganan melanjutkan ke tahapan pembayaran sesuai instruksi checkout.",
  },
  {
    tanya: "Apa perbedaan paket Free, Basic, Pro, dan Business?",
    jawab:
      "Setiap paket memiliki konfigurasi harga, durasi, kapasitas listing, metode kontak, dan daftar fitur. Rincian tiap paket mengikuti data paket aktif yang disediakan oleh ENM Property.",
  },
  {
    tanya: "Data apa yang wajib disiapkan untuk menjadi mitra?",
    jawab:
      "Siapkan akun ENM, nama usaha atau agen, nomor WhatsApp aktif, dan informasi properti seperti judul, lokasi, foto, serta harga.",
  },
  {
    tanya: "Kapan properti tampil di katalog publik?",
    jawab: "Listing yang berstatus aktif akan tampil di katalog publik ENM Property.",
  },
  {
    tanya: "Bagaimana cara mengelola listing setelah aktif?",
    jawab: "Kelola listing, foto, harga, kontak, dan ketersediaan dari dashboard mitra.",
  },
  {
    tanya: "Apakah paket dapat diperpanjang atau ditingkatkan?",
    jawab:
      "Ketentuan perpanjangan dan peningkatan paket mengikuti data paket aktif ENM Property.",
  },
] as const;

/** Teks bawaan bila kolom CMS belum diisi. */
const BAWAAN = {
  judulHero: "Temukan properti yang tepat untukmu.",
  subJudulHero:
    "Cari properti untuk disewa atau dibeli, lihat detail listing, lalu hubungi kontak yang tersedia melalui WhatsApp. Punya properti? Pasarkan dan kelola listing-mu melalui ENM Property.",
  labelCtaHero: "Sewa & Beli Properti",
  judulCta: "Siap memasarkan properti melalui ENM?",
  deskripsiCta:
    "Bandingkan paket, siapkan informasi mitra, lalu ikuti proses pendaftaran untuk mulai mengelola listing.",
  judulKeunggulan: "",
  deskripsiKeunggulan: "",
  judulProperti: "Temukan properti untuk disewa dan dibeli.",
  deskripsiProperti:
    "Jelajahi listing yang tersedia dan buka detailnya untuk informasi lebih lanjut.",
  judulPaket: "Pilih Paket Kemitraan",
  deskripsiPaket:
    "Temukan informasi paket dan ketentuan yang sesuai dengan kebutuhan listing propertimu.",
  judulPanduan: "Empat langkah menjadi mitra ENM",
  deskripsiPanduan: "Mulai dari menentukan paket hingga mengelola listing melalui akun mitra.",
  judulFaq: "Informasi sebelum bergabung",
  deskripsiFaq: "Ringkasan alur pendaftaran dan pengelolaan listing mitra.",
};

/* --------------------------------------------------------------- Metadata -- */

/**
 * Metadata halaman utama.
 *
 * Seluruh nilai berasal dari modul Metadata SEO di CMS (`standar_cms.txt`
 * bagian 1.B) sehingga judul, deskripsi, dan gambar pratinjau dapat diubah
 * tanpa deploy ulang.
 */
export async function generateMetadata(): Promise<Metadata> {
  const konten = await kontenLandingAman();

  const judul = konten.meta_title || konten.hero_title || `${NAMA_SITUS} - Listing Properti Bali`;
  const deskripsi = konten.meta_description || konten.hero_subtitle || BAWAAN.subJudulHero;
  const gambar = konten.meta_og_image || konten.hero_image_url;

  return {
    // `absolute` mencegah judul dari CMS ditempeli template judul di layout.
    title: { absolute: judul },
    description: deskripsi,
    alternates: { canonical: SITE_URL },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: SITE_URL,
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
 * Landing page utama (rute `/`).
 *
 * Dirender sebagai Server Component sehingga seluruh teks utama sudah ada di
 * HTML awal — syarat perayapan Googlebot (`standa_seo_web.txt` bagian 1.A).
 * Isi hero, metadata, wilayah unggulan, dan CTA mitra berasal dari CMS; daftar
 * properti dan paket berasal dari API publik dengan nilai cadangan bila
 * backend belum dapat dihubungi.
 */
export default async function Home() {
  const [konten, properti, paket] = await Promise.all([
    kontenLandingAman(),
    propertiUnggulanAman(JUMLAH_PROPERTI),
    paketPublikAman(),
  ]);

  const area = konten.highlight_areas.slice(0, 6);
  const areaUtama = area[0] ?? "Bali";

  return (
    <div className="flex flex-1 flex-col">
      <HeaderLanding />
      <PenandaAsalBeranda />
      <main className="flex flex-1 flex-col">
        <Hero konten={konten} properti={properti} area={area} areaUtama={areaUtama} />
        <Keunggulan konten={konten} />
        <PropertiPilihan daftar={properti} konten={konten} />
        <PaketMitra daftar={paket} konten={konten} />
        <PanduanMitra konten={konten} />
        <Faq konten={konten} />
        <CtaMitra konten={konten} />
      </main>

      <FooterLanding />
    </div>
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
 * Gambar utama diambil dari CMS (`hero_image_url`) lalu dilengkapi foto
 * properti teratas agar kolase tetap terisi sebelum tim marketing mengunggah
 * foto banner.
 */
function gambarKolase(hero: string, daftar: PropertySummary[]): string[] {
  return [hero, ...daftar.map((item) => item.cover_url)]
    .filter((url) => url.length > 0)
    .slice(0, 4);
}

/** Satu slot kolase hero; menampilkan blok netral bila gambar belum tersedia. */
function SlotKolase({
  src,
  alt,
  kelas,
  utama = false,
}: {
  src?: string;
  alt: string;
  kelas: string;
  utama?: boolean;
}) {
  return (
    <div className={cn("absolute overflow-hidden rounded-panel bg-divider shadow-md", kelas)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 960px) 80vw, 40vw"
          className="object-cover"
          loading={utama ? "eager" : "lazy"}
          fetchPriority={utama ? "high" : "auto"}
        />
      ) : null}
    </div>
  );
}

/** Bagian hero: judul utama (H1 tunggal), CTA, wilayah unggulan, dan kolase foto. */
function Hero({
  konten,
  properti,
  area,
  areaUtama,
}: {
  konten: LandingContentView;
  properti: PropertySummary[];
  area: string[];
  areaUtama: string;
}) {
  const judul = konten.hero_title || BAWAAN.judulHero;
  const subJudul = konten.hero_subtitle || BAWAAN.subJudulHero;
  const labelCta = konten.hero_cta_text || BAWAAN.labelCtaHero;
  const gambar = gambarKolase(konten.hero_image_url, properti);
  const altKolase = `Properti pilihan di ${areaUtama} - ${judul}`;

  return (
    <section
      id="beranda"
      className={cn(JANGKAR, "bg-[linear-gradient(180deg,#FBF9F6,#F7F3ED)] pt-16 pb-[72px]")}
    >
      <div className={cn(KONTAINER, "grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]")}>
        <div>
          <Eyebrow>Platform listing properti</Eyebrow>

          <h1 className="my-4 max-w-2xl text-[clamp(30px,4.2vw,44px)] leading-[1.15] font-bold tracking-[-0.04em] text-ink">
            {judul}
          </h1>

          <p className="max-w-[470px] text-base leading-[1.65] text-ink-muted">{subJudul}</p>

          <div className="mt-6 mb-4 flex flex-wrap gap-3">
            <TombolLacak href="/katalog" section="hero_banner" label={labelCta} size="lg">
              {labelCta} →
            </TombolLacak>
            <Button asChild variant="outline" size="lg">
              <Link href="/register?role=mitra">Pasang Properti +</Link>
            </Button>
          </div>

          {area.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">
                Area populer
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
            Informasi listing dan kontak dalam satu platform.
          </p>
        </div>

        <div className="relative h-[300px] sm:h-[400px]" aria-label="Kolase foto properti pilihan">
          <SlotKolase
            src={gambar[0]}
            alt={altKolase}
            utama
            kelas="top-0 right-0 left-[20%] h-[210px] sm:left-[34%] sm:h-[285px]"
          />
          <SlotKolase
            src={gambar[1]}
            alt={altKolase}
            kelas="top-[130px] right-[56%] left-0 h-[130px] border-[5px] border-canvas sm:top-[150px] sm:right-1/2 sm:h-[185px]"
          />
          <SlotKolase
            src={gambar[2]}
            alt={altKolase}
            kelas="bottom-0 left-[40%] right-[22%] h-[100px] border-[5px] border-canvas sm:h-[140px]"
          />
          <SlotKolase
            src={gambar[3]}
            alt={altKolase}
            kelas="right-0 bottom-0 left-[78%] hidden h-[90px] sm:block"
          />

          <div className="absolute top-[14px] right-[2%] left-[30%] z-2 flex items-center gap-2 rounded-[10px] border border-line bg-surface px-3 py-2.5 text-xs font-semibold shadow-md sm:top-[22px] sm:right-[4%] sm:left-[66%]">
            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            Jelajahi listing properti
          </div>
        </div>
      </div>
    </section>
  );
}

/** Tiga keunggulan utama platform. */
function Keunggulan({ konten }: { konten: LandingContentView }) {
  const judul = konten.keunggulan_title || BAWAAN.judulKeunggulan;
  const deskripsi = konten.keunggulan_subtitle || BAWAAN.deskripsiKeunggulan;

  return (
    <section className="border-y border-line bg-surface">
      <div className={cn(KONTAINER, "py-9")}>
        {judul ? (
          <KepalaBagian>
            <Eyebrow center>Keunggulan</Eyebrow>
            <h2 className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-ink">
              {judul}
            </h2>
            {deskripsi ? <p className="text-sm text-ink-muted">{deskripsi}</p> : null}
          </KepalaBagian>
        ) : null}

        <div className="grid md:grid-cols-3 md:divide-x md:divide-line">
          {KEUNGGULAN.map((item) => {
            const Ikon = item.ikon;
            return (
              <article key={item.judul} className="flex gap-4 px-1 py-3 md:px-6 md:first:pl-0">
                <div
                  className={cn("grid size-11 shrink-0 place-items-center rounded-card", item.kelasIkon)}
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
  konten,
}: {
  daftar: PropertySummary[];
  konten: LandingContentView;
}) {
  const judul = konten.properti_title || BAWAAN.judulProperti;
  const deskripsi = konten.properti_subtitle || BAWAAN.deskripsiProperti;

  return (
    <section id="properti" className={cn(JANGKAR, "py-14 lg:py-16")}>
      <div className={KONTAINER}>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Properti pilihan</Eyebrow>
            <h2 className="my-2 text-2xl font-semibold tracking-[-0.025em] text-ink">{judul}</h2>
            <p className="text-sm text-ink-muted">{deskripsi}</p>
          </div>
          <Link
            href="/katalog"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-ink"
          >
            Lihat semua properti →
          </Link>
        </div>

        {daftar.length > 0 ? (
          <>
            <SkemaItemList
              nama={`Daftar properti pilihan di ${daftar[0]?.city ?? "Bali"}`}
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
            Belum ada properti yang tayang saat ini.{" "}
            <Link href="/katalog" className="font-semibold text-primary">
              Buka katalog
            </Link>{" "}
            untuk melihat seluruh listing.
          </p>
        )}
      </div>
    </section>
  );
}

/** Label harga paket dengan fallback format rupiah. */
function labelHarga(paket: PlanView) {
  if (paket.is_free) return "Gratis";
  return paket.price_label || formatRupiah(paket.price);
}

/** Baris tabel perbandingan; nilainya dihitung dari satu sumber data paket. */
const BARIS_PERBANDINGAN: Array<{ label: string; nilai: (paket: PlanView) => ReactNode }> = [
  { label: "Harga paket", nilai: (paket) => labelHarga(paket) },
  {
    label: "Masa aktif",
    nilai: (paket) => (paket.duration_days > 0 ? `${formatAngka(paket.duration_days)} hari` : "Tanpa batas"),
  },
  {
    label: "Kapasitas listing",
    nilai: (paket) =>
      paket.is_unlimited ? "Tanpa batas" : `${formatAngka(paket.listing_quota)} listing`,
  },
  { label: "Boost listing", nilai: (paket) => (paket.boost_enabled ? "Tersedia" : "—") },
  { label: "Pengaturan keyword", nilai: (paket) => (paket.keyword_access ? "Tersedia" : "—") },
  { label: "Pengaturan katalog", nilai: (paket) => (paket.catalog_access ? "Tersedia" : "—") },
  { label: "Nomor WhatsApp", nilai: (paket) => (paket.whatsapp_access ? "Tersedia" : "—") },
  { label: "Daftar fitur", nilai: (paket) => `${formatAngka(paket.features.length)} fitur` },
  {
    label: "Proses pendaftaran",
    nilai: (paket) => (paket.is_free ? "Registrasi kemitraan" : "Checkout paket"),
  },
  {
    label: "Pembayaran",
    nilai: (paket) => (paket.is_free ? "Tidak diperlukan" : "Melalui alur pembayaran"),
  },
];

/**
 * Bagian paket kemitraan.
 *
 * Seluruh nilai (harga, kuota, dan akses fitur) dibaca dari data paket aktif
 * sehingga kartu dan tabel perbandingan di bawahnya selalu seragam
 * (`standar_cms.txt` bagian 1 — satu sumber data).
 */
function PaketMitra({ daftar, konten }: { daftar: PlanView[]; konten: LandingContentView }) {
  const judul = konten.paket_title || BAWAAN.judulPaket;
  const deskripsi = konten.paket_subtitle || BAWAAN.deskripsiPaket;
  const unggulanId = daftar
    .filter((paket) => !paket.is_free)
    .reduce<PlanView | null>((terbaik, paket) => (!terbaik || paket.level > terbaik.level ? paket : terbaik), null)
    ?.id;

  return (
    <section id="paket" className={cn(JANGKAR, "bg-secondary py-16")}>
      <div className={KONTAINER}>
        <KepalaBagian>
          <Eyebrow center gold>
            Untuk agen dan pemilik properti
          </Eyebrow>
          <h2 className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-white">
            {judul}
          </h2>
          <p className="text-sm text-white/80">{deskripsi}</p>
        </KepalaBagian>

        {daftar.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {daftar.map((paket) => (
                <article
                  key={paket.id}
                  className={cn(
                    "flex flex-col rounded-panel border bg-surface p-6",
                    paket.id === unggulanId ? "border-2 border-accent" : "border-line",
                  )}
                >
                  <Badge variant={paket.is_free ? "success" : "primary"} className="self-start">
                    {paket.is_free ? "Mulai gratis" : "Paket mitra"}
                  </Badge>

                  <h3 className="mt-3.5 mb-1.5 text-xl font-bold tracking-[-0.03em] text-ink">
                    {paket.name}
                  </h3>

                  <p className="mb-4 min-h-[60px] text-[13px] leading-[1.55] text-ink-muted">
                    {paket.description || "Paket langganan mitra ENM Property."}
                  </p>

                  <div className="mt-auto mb-4 rounded-[10px] border border-divider bg-canvas px-3.5 py-3">
                    <small className="block text-[11px] text-ink-muted">Harga paket</small>
                    <strong data-numeric className="my-0.5 block text-base font-semibold text-ink">
                      {labelHarga(paket)}
                    </strong>
                    <small className="block text-[11px] text-ink-muted">
                      {paket.duration_days > 0
                        ? `${formatAngka(paket.duration_days)} hari`
                        : "Tanpa batas waktu"}
                    </small>
                  </div>

                  <Button
                    asChild
                    variant={paket.id === unggulanId ? "primary" : "outline"}
                    className="w-full"
                  >
                    <Link href={`/checkout/${paket.slug}`}>Pilih {paket.name} →</Link>
                  </Button>
                </article>
              ))}
            </div>

            <p className="mt-4.5 text-center text-[11px] text-white/70">
              Harga, durasi, kuota listing, metode kontak, dan fitur mengikuti konfigurasi paket aktif
              ENM Property.
            </p>

            <div className="mt-14">
              <h3 className="mb-4.5 text-center text-xl font-semibold text-white">
                Perbandingan paket secara lengkap
              </h3>
              <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm">
                <table className="w-full min-w-[760px] border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="bg-[#263E34] p-4 text-left text-[13px] font-semibold text-white">
                        Informasi paket
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
                    {BARIS_PERBANDINGAN.map((baris) => (
                      <tr key={baris.label}>
                        <th className="border-t border-line bg-canvas p-4 text-left font-semibold text-ink">
                          {baris.label}
                        </th>
                        {daftar.map((paket) => (
                          <td
                            key={paket.id}
                            className="border-t border-line bg-surface p-4 text-center text-ink-muted"
                          >
                            {baris.nilai(paket)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-white/70">
                Nilai pada tabel diambil langsung dari konfigurasi paket aktif yang disediakan API ENM
                Property.
              </p>
            </div>
          </>
        ) : (
          <p className="rounded-card border border-white/25 bg-white/10 p-6 text-center text-sm text-white/85">
            Daftar paket sedang tidak dapat dimuat.{" "}
            <Link href="/paket" className="font-semibold text-accent">
              Buka halaman paket
            </Link>{" "}
            untuk melihat informasi terbaru.
          </p>
        )}
      </div>
    </section>
  );
}

/** Panduan kemitraan: empat langkah, daftar persiapan, dan alur setelah mendaftar. */
function PanduanMitra({ konten }: { konten: LandingContentView }) {
  const judul = konten.panduan_title || BAWAAN.judulPanduan;
  const deskripsi = konten.panduan_subtitle || BAWAAN.deskripsiPanduan;

  return (
    <section id="panduan" className={cn(JANGKAR, "bg-canvas py-16")}>
      <div className={KONTAINER}>
        <KepalaBagian>
          <Eyebrow center>Panduan kemitraan</Eyebrow>
          <h2 className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-ink">
            {judul}
          </h2>
          <p className="text-sm text-ink-muted">{deskripsi}</p>
        </KepalaBagian>

        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {LANGKAH_MITRA.map((langkah) => (
            <article
              key={langkah.nomor}
              className="rounded-panel border border-line bg-surface p-6 shadow-sm"
            >
              <div className="grid size-[38px] place-items-center rounded-[11px] bg-primary-tint text-xs font-extrabold text-primary">
                {langkah.nomor}
              </div>
              <h3 className="mt-3.5 mb-2 text-base font-bold text-ink">{langkah.judul}</h3>
              <p className="mb-3.5 text-[13px] leading-[1.65] text-ink-muted">{langkah.deskripsi}</p>
              {langkah.tautan ? (
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

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Eyebrow>Sebelum memulai</Eyebrow>
            <h2 className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-ink">
              Siapkan informasi untuk pendaftaran dan listing.
            </h2>
            <p className="mb-4.5 text-sm leading-[1.6] text-ink-muted">
              Data yang lengkap membantu kamu menyiapkan profil mitra dan informasi properti sebelum
              listing ditayangkan.
            </p>

            <div className="flex flex-col gap-3">
              {PERSIAPAN_MITRA.map((item) => (
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
            <Eyebrow>Setelah mendaftar</Eyebrow>
            <div className="mt-2">
              {ALUR_MITRA.map((alur, indeks) => (
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
 * Pertanyaan umum.
 *
 * Memakai elemen bawaan `<details>`/`<summary>` sehingga jawaban tetap ada di
 * HTML awal (terbaca mesin pencari) meski tanpa JavaScript.
 */
function Faq({ konten }: { konten: LandingContentView }) {
  const judul = konten.faq_title || BAWAAN.judulFaq;
  const deskripsi = konten.faq_subtitle || BAWAAN.deskripsiFaq;

  return (
    <section id="faq" className={cn(JANGKAR, "border-t border-line bg-surface py-16")}>
      <div className={KONTAINER}>
        <KepalaBagian>
          <Eyebrow center>Pertanyaan umum</Eyebrow>
          <h2 className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-ink">
            {judul}
          </h2>
          <p className="text-sm text-ink-muted">{deskripsi}</p>
        </KepalaBagian>

        <div className="mx-auto flex max-w-[850px] flex-col gap-3">
          {DAFTAR_FAQ.map((item, indeks) => (
            <details
              key={item.tanya}
              open={indeks === 0}
              className="group rounded-[10px] border border-line bg-surface"
            >
              <summary className="flex list-none cursor-pointer items-center justify-between gap-4 p-5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.tanya}
                <Sparkles
                  className="size-4 shrink-0 text-primary transition-transform duration-250 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 pb-[18px] text-[13px] leading-[1.7] text-ink-muted">{item.jawab}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Ajakan mendaftar sebagai mitra; teksnya berasal dari modul CTA Mitra di CMS. */
function CtaMitra({ konten }: { konten: LandingContentView }) {
  const judul = konten.cta_title || BAWAAN.judulCta;
  const deskripsi = konten.cta_description || BAWAAN.deskripsiCta;

  return (
    <section id="kemitraan" className={cn(JANGKAR, "bg-canvas py-16")}>
      <div className={KONTAINER}>
        <div className="rounded-[20px] bg-[linear-gradient(101deg,#203E34,#2E4A3E)] px-8 py-14 text-center shadow-md">
          <Eyebrow center gold>
            Untuk pemilik dan agen properti
          </Eyebrow>
          <h2 className="my-3 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-white">
            {judul}
          </h2>
          <p className="mx-auto mb-6 max-w-[620px] text-sm leading-[1.6] text-white/80">{deskripsi}</p>
          <TombolLacak
            href="/register?role=mitra"
            section="cta_mitra"
            label={judul}
            size="lg"
            className="mx-auto"
          >
            Daftar sebagai mitra →
          </TombolLacak>
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

/** Kaki halaman landing: identitas ringkas, navigasi bagian, dan hak cipta. */
function FooterLanding() {
  const tautan = [
    { href: "#properti", label: "Properti" },
    { href: "#paket", label: "Paket Mitra" },
    { href: "#panduan", label: "Panduan Kemitraan" },
  ];

  return (
    <footer className="border-t border-line bg-surface pt-9">
      <div className={KONTAINER}>
        <div className="flex flex-wrap justify-between gap-7 pb-6">
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label="ENM Property beranda">
              <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground">
                EN
              </span>
              <span className="text-base font-bold tracking-tight text-ink">ENM PROPERTY</span>
            </Link>
            <p className="mt-2.5 max-w-[390px] text-xs leading-[1.7] text-ink-muted">
              Platform listing properti untuk mencari properti yang sesuai atau memasarkan listing
              melalui akun mitra.
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 text-xs text-ink-muted" aria-label="Navigasi footer">
            {tautan.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-primary">
                {item.label}
              </a>
            ))}
            <MenuAkun variasi="tautan" className="transition-colors hover:text-primary" />
            <Link href="/katalog" className="transition-colors hover:text-primary">
              Katalog
            </Link>
          </nav>
        </div>

        <div className="border-t border-divider py-4 text-center text-[11px] text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            © <TahunHakCipta /> ENM Property. Semua hak dilindungi undang-undang.
          </span>
        </div>
      </div>
    </footer>
  );
}
