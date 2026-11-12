/**
 * Akses data publik dari sisi server.
 *
 * Berkas ini HANYA boleh diimpor oleh Server Component dan Route Handler.
 * Berbeda dari `client.ts` yang memaksa `cache: "no-store"`, permintaan di sini
 * diserahkan ke cache Next.js sehingga aman dipakai di dalam direktif
 * `"use cache"` — padanan ISR pada Next.js 16 (opsi `revalidate` pada level
 * route sudah dihapus sejak `cacheComponents` diaktifkan).
 */

import { cacheLife, cacheTag } from "next/cache";

import { API_BASE_URL } from "@/lib/api/client";
import type { LandingContentView, Meta, PlanView, PropertySummary } from "@/types/api";

/** Tag cache konten landing; dipakai `/api/revalidate` saat tombol publish ditekan. */
export const TAG_LANDING = "landing";
/** Tag cache daftar properti unggulan di halaman utama. */
export const TAG_PROPERTI = "properti";
/** Tag cache daftar paket kemitraan di halaman utama. */
export const TAG_PAKET = "paket";

interface AmplopSukses<T> {
  success: true;
  data: T;
  meta?: Meta;
}

/**
 * Mengambil amplop respons backend secara utuh (termasuk `meta` paginasi) dan
 * melempar galat bila status bukan 2xx atau amplop tidak sesuai.
 */
async function ambilAmplopPublik<T>(path: string): Promise<AmplopSukses<T>> {
  const respon = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });

  const teks = await respon.text();
  let amplop: AmplopSukses<T> | null = null;
  if (teks) {
    try {
      amplop = JSON.parse(teks) as AmplopSukses<T>;
    } catch {
      amplop = null;
    }
  }

  if (!respon.ok || !amplop || amplop.success !== true) {
    throw new Error(`Permintaan ${path} gagal (${respon.status})`);
  }
  return amplop;
}

/**
 * Mengambil `data` dari amplop respons backend. Melempar galat bila status
 * bukan 2xx atau amplop tidak sesuai, sehingga pemanggil dapat memakai nilai
 * cadangan tanpa menebak bentuk respons.
 */
async function ambilDataPublik<T>(path: string): Promise<T> {
  return (await ambilAmplopPublik<T>(path)).data;
}

/**
 * Konten cadangan agar halaman utama tetap tayang dan tetap dapat dirayapi
 * Googlebot ketika backend/CMS belum dapat dihubungi.
 */
export const KONTEN_LANDING_CADANGAN: LandingContentView = {
  hero_title: "Temukan Properti Terbaik di Bali",
  hero_subtitle:
    "Jelajahi villa, rumah, dan apartemen pilihan dari mitra terverifikasi di seluruh Bali.",
  hero_cta_text: "Jelajahi Katalog",
  hero_image_url: "",
  meta_title: "ENM Property - Sewa & Jual Properti Terbaik di Bali",
  meta_description:
    "Cari villa, rumah, ruko, dan apartemen di Bali dengan mudah. Bandingkan lokasi, harga, dan fasilitas, lalu hubungi mitra terverifikasi di ENM Property.",
  meta_og_image: "",
  highlight_areas: ["Ubud", "Canggu", "Seminyak", "Uluwatu"],
  cta_title: "Punya Properti untuk Dititipkan?",
  cta_description:
    "Daftarkan properti Anda dan jangkau ribuan calon penyewa serta pembeli yang aktif mencari setiap hari.",
  keunggulan_title: "",
  keunggulan_subtitle: "",
  properti_title: "Temukan properti untuk disewa dan dibeli.",
  properti_subtitle:
    "Jelajahi listing yang tersedia dan buka detailnya untuk informasi lebih lanjut.",
  paket_title: "Pilih Paket Kemitraan",
  paket_subtitle:
    "Temukan informasi paket dan ketentuan yang sesuai dengan kebutuhan listing propertimu.",
  panduan_title: "Empat langkah menjadi mitra ENM",
  panduan_subtitle: "Mulai dari menentukan paket hingga mengelola listing melalui akun mitra.",
  faq_title: "Informasi sebelum bergabung",
  faq_subtitle: "Ringkasan alur pendaftaran dan pengelolaan listing mitra.",
  updated_at: "",
};

/**
 * Konten landing page dari CMS.
 *
 * Hasilnya dicache sebagai HTML statis (ISR) selama 24 jam dan dibuang lebih
 * awal ketika tim marketing menekan "Publish Perubahan Landing Page" melalui
 * webhook `/api/revalidate`.
 */
export async function kontenLanding(): Promise<LandingContentView> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 604800 });
  cacheTag(TAG_LANDING);

  return ambilDataPublik<LandingContentView>("/landing");
}

/**
 * Properti unggulan sesuai urutan algoritma internal backend
 * (boost -> keyword -> klik WhatsApp -> rating -> favorit).
 */
export async function propertiUnggulan(jumlah: number): Promise<PropertySummary[]> {
  "use cache";
  // Cache singkat: perubahan listing mitra (tayang/nonaktif) harus cepat
  // tercermin di halaman utama tanpa menunggu tombol publish landing. Tag
  // `TAG_PROPERTI` tetap dipakai agar `/api/revalidate` bisa menyegarkan
  // seketika saat diperlukan.
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag(TAG_PROPERTI);

  return ambilDataPublik<PropertySummary[]>(`/properties?page=1&per_page=${jumlah}`);
}

/**
 * Pembungkus aman `kontenLanding`: memakai konten cadangan bila CMS/backend
 * sedang tidak tersedia. Sengaja tidak dicache agar kegagalan sesaat tidak
 * ikut tersimpan selama masa berlaku cache.
 */
export async function kontenLandingAman(): Promise<LandingContentView> {
  try {
    return await kontenLanding();
  } catch {
    return KONTEN_LANDING_CADANGAN;
  }
}

/** Pembungkus aman `propertiUnggulan`; mengembalikan larik kosong saat gagal. */
export async function propertiUnggulanAman(jumlah: number): Promise<PropertySummary[]> {
  try {
    return await propertiUnggulan(jumlah);
  } catch {
    return [];
  }
}

/**
 * Batas jumlah halaman yang disusuri `propertiSemua` (100 properti/halaman)
 * agar penyusunan sitemap tidak berputar tanpa henti bila `meta` backend cacat.
 */
const MAKS_HALAMAN_PROPERTI = 50;

/**
 * Seluruh properti tayang untuk `sitemap.xml`.
 *
 * Menyusuri seluruh halaman katalog publik (batas 100 item per halaman pada
 * backend) supaya semua URL detail terdaftar untuk mesin pencari
 * (`standa_seo_web.txt` bagian 3 — sitemap dinamis).
 */
export async function propertiSemua(): Promise<PropertySummary[]> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 604800 });
  cacheTag(TAG_PROPERTI);

  const hasil: PropertySummary[] = [];
  let halaman = 1;
  let totalHalaman = 1;

  do {
    const amplop = await ambilAmplopPublik<PropertySummary[]>(
      `/properties?page=${halaman}&per_page=100`,
    );
    hasil.push(...amplop.data);
    totalHalaman = amplop.meta?.total_pages ?? 1;
    halaman += 1;
  } while (halaman <= totalHalaman && halaman <= MAKS_HALAMAN_PROPERTI);

  return hasil;
}

/**
 * Daftar paket kemitraan aktif untuk bagian "Paket Mitra" di halaman utama.
 *
 * Memakai endpoint publik `/packages` sehingga harga, kuota, dan fitur yang
 * ditampilkan selalu berasal dari konfigurasi paket resmi (satu sumber data).
 */
export async function paketPublik(): Promise<PlanView[]> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 604800 });
  cacheTag(TAG_PAKET);

  return ambilDataPublik<PlanView[]>("/packages");
}

/** Pembungkus aman `paketPublik`; mengembalikan larik kosong saat gagal. */
export async function paketPublikAman(): Promise<PlanView[]> {
  try {
    return await paketPublik();
  } catch {
    return [];
  }
}
