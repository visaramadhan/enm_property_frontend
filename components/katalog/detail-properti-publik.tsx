"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  Bed,
  Clock,
  Eye,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Ruler,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { DaftarDeskripsi } from "@/components/shared/daftar-deskripsi";
import { TextField, TextareaField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDetailPropertiPublik,
  useKirimKontakProperti,
  useKontakProperti,
} from "@/lib/api/hooks";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import { toastInfo, toastSukses } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ContactFormRequest, PropertyDetail } from "@/types/api";

/**
 * Halaman detail properti publik.
 *
 * Menampilkan galeri foto, spesifikasi, deskripsi, dan fasilitas properti
 * beserta panel kontak. Nomor WhatsApp diambil saat tombol hubungi ditekan
 * sehingga lead tercatat di backend (satu lead per klik). Tombol hubungi
 * mensyaratkan login: pengunjung yang belum masuk diarahkan dahulu, lalu
 * otomatis melanjutkan ke WhatsApp sesaat setelah kembali.
 */

/** Galeri foto utama dengan pemilih gambar kecil di bawahnya. */
function Galeri({ properti }: { properti: PropertyDetail }) {
  const [aktif, setAktif] = React.useState(0);
  const foto = properti.photos;
  const utama = foto[aktif]?.url ?? properti.cover_url;

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-video w-full overflow-hidden rounded-card border border-line bg-divider">
        {utama ? (
          <img src={utama} alt={properti.title} className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-[13px] text-ink-subtle">
            Tanpa foto
          </span>
        )}
      </div>

      {foto.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {foto.map((item, indeks) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAktif(indeks)}
              aria-label={`Foto ${indeks + 1}`}
              aria-current={indeks === aktif}
              className={cn(
                "size-20 shrink-0 overflow-hidden rounded-field border-2 transition-colors",
                indeks === aktif ? "border-primary" : "border-line hover:border-ink-subtle",
              )}
            >
              <img src={item.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Panel harga dan kontak WhatsApp mitra. */
function PanelKontak({ properti, slug }: { properti: PropertyDetail; slug: string }) {
  const { pengguna, memuat } = useAuth();
  const kontak = useKontakProperti();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sudahMelanjutkan = React.useRef(false);

  /** Mengambil nomor WhatsApp (sekaligus mencatat lead) lalu membukanya. */
  const jalankanKontak = React.useCallback(async () => {
    try {
      const hasil = await kontak.mutateAsync(slug);
      window.open(hasil.whatsapp_url, "_blank", "noopener,noreferrer");
      if (hasil.is_fallback) {
        toastInfo(
          "Diteruskan ke admin",
          "Mitra belum mengisi nomor WhatsApp, permintaan Anda diteruskan ke admin.",
        );
      }
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }, [kontak, slug]);

  /* Setelah pengunjung masuk lewat gerbang tombol hubungi, mereka kembali ke
     halaman ini dengan penanda `?wa=1`. Panggilan WhatsApp dijalankan otomatis
     sekali lalu penanda dibersihkan agar tidak terpicu lagi saat dimuat ulang. */
  React.useEffect(() => {
    if (sudahMelanjutkan.current) return;
    if (searchParams.get("wa") !== "1") return;
    if (memuat || !pengguna) return;
    sudahMelanjutkan.current = true;
    void jalankanKontak();
    router.replace(pathname, { scroll: false });
  }, [searchParams, memuat, pengguna, jalankanKontak, router, pathname]);

  /* Bila belum masuk, arahkan ke halaman masuk dengan tujuan kembali ke sini
     disertai penanda agar WhatsApp otomatis terbuka setelah autentikasi. */
  function hubungi() {
    if (!pengguna) {
      const tujuan = `${pathname}?wa=1`;
      router.push(`/login?callbackUrl=${encodeURIComponent(tujuan)}`);
      return;
    }
    void jalankanKontak();
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Harga</span>
        <CardTitle data-numeric className="text-2xl">
          {properti.price_label}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          size="lg"
          className="w-full"
          onClick={() => hubungi()}
          disabled={kontak.isPending || memuat}
        >
          {kontak.isPending ? <LoaderCircle className="animate-spin" /> : <MessageCircle />}
          Hubungi via WhatsApp
        </Button>

        {properti.partner ? (
          <div className="flex flex-col gap-1 rounded-field border border-line bg-hover/40 p-4">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
              Dikelola oleh
            </span>
            <Link
              href={`/pengelola/${properti.partner.id}`}
              className="w-fit text-sm font-semibold text-primary hover:underline"
            >
              {properti.partner.business_name}
            </Link>
            {properti.partner.city ? (
              <span className="text-[13px] text-ink-muted">
                {properti.partner.city}
                {properti.partner.province ? `, ${properti.partner.province}` : ""}
              </span>
            ) : null}
            <span className="text-xs text-ink-subtle">Lihat seluruh katalog pengelola ini</span>
          </div>
        ) : null}

        <Separator />

        <dl className="grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-ink-subtle">Tayangan</dt>
            <dd data-numeric className="flex items-center justify-center gap-1 text-sm font-medium text-ink">
              <Eye className="size-4" aria-hidden="true" />
              {formatAngka(properti.views)}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-ink-subtle">Rating</dt>
            <dd data-numeric className="flex items-center justify-center gap-1 text-sm font-medium text-ink">
              <Star className="size-4" aria-hidden="true" />
              {properti.rating_count > 0 ? properti.rating_avg.toFixed(1) : "-"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-ink-subtle">Favorit</dt>
            <dd data-numeric className="flex items-center justify-center gap-1 text-sm font-medium text-ink">
              <Heart className="size-4" aria-hidden="true" />
              {formatAngka(properti.favorite_count)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

/** Skema form kontak publik; selaras dengan validasi backend. */
const skemaKontak = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama terlalu panjang"),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon minimal 8 digit")
    .max(20, "Nomor telepon terlalu panjang"),
  message: z.string().trim().min(5, "Tuliskan pesan singkat").max(1000, "Pesan terlalu panjang"),
});

/**
 * Form kontak publik pada detail properti.
 *
 * Terbuka untuk pengunjung anonim; bila pengunjung sedang masuk, identitasnya
 * ikut tercatat pada lead di backend (kanal "form").
 */
function FormKontak({ slug }: { slug: string }) {
  const { pengguna } = useAuth();
  const kirim = useKirimKontakProperti();
  const form = useForm<ContactFormRequest>({
    resolver: zodResolver(skemaKontak),
    defaultValues: {
      name: pengguna?.name ?? "",
      phone: pengguna?.phone ?? "",
      message: "",
    },
  });

  async function kirimPesan(nilai: ContactFormRequest) {
    try {
      await kirim.mutateAsync({ slug, body: nilai });
      toastSukses("Pesan terkirim", "Pengelola akan menghubungi Anda.");
      form.reset({ name: nilai.name, phone: nilai.phone, message: "" });
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle className="text-base">Tinggalkan pesan</CardTitle>
        <span className="text-[13px] text-ink-muted">
          Isi data Anda, pengelola akan menghubungi kembali.
        </span>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={form.handleSubmit(kirimPesan)} className="flex flex-col gap-4">
          <TextField
            control={form.control}
            name="name"
            label="Nama"
            placeholder="Nama lengkap"
            wajib
          />
          <TextField
            control={form.control}
            name="phone"
            label="Nomor telepon"
            placeholder="08xxxxxxxxxx"
            wajib
          />
          <TextareaField
            control={form.control}
            name="message"
            label="Pesan"
            placeholder="Saya tertarik dengan properti ini..."
            rows={3}
            wajib
          />
          <Button type="submit" variant="outline" disabled={kirim.isPending}>
            {kirim.isPending ? <LoaderCircle className="animate-spin" /> : <Send />}
            Kirim pesan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/** Kerangka halaman detail saat data dimuat. */
function KerangkaDetail() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6">
        <Skeleton className="aspect-video w-full rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
      <Skeleton className="h-72 rounded-card" />
    </div>
  );
}

export function DetailPropertiPublik({ slug }: { slug: string }) {
  const properti = useDetailPropertiPublik(slug);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/katalog"
        className="flex w-fit items-center gap-2 rounded-field text-[13px] font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke katalog
      </Link>

      <KontenAsync
        hasil={properti}
        skeleton={<KerangkaDetail />}
        judulGagal="Properti tidak dapat dimuat"
      >
        {(data) => (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col gap-6">
              <Galeri properti={data} />

              <Card>
                <CardHeader className="gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">{data.listing_type_label}</Badge>
                    <Badge variant="outline">{data.property_type_label}</Badge>
                    {data.category_name ? (
                      <Badge variant="neutral">{data.category_name}</Badge>
                    ) : null}
                    {data.boost_active ? (
                      <Badge variant="accent">
                        <Sparkles />
                        Unggulan
                      </Badge>
                    ) : null}
                  </div>

                  <CardTitle className="text-xl leading-snug">{data.title}</CardTitle>

                  <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                    {[data.address, data.district, data.city, data.province]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
                  <DaftarDeskripsi
                    kolom={3}
                    item={[
                      { label: "Tipe properti", nilai: data.property_type_label },
                      { label: "Luas tanah", nilai: `${formatAngka(data.land_area)} m²` },
                      { label: "Luas bangunan", nilai: `${formatAngka(data.building_area)} m²` },
                      { label: "Kamar tidur", nilai: formatAngka(data.bedrooms) },
                      { label: "Kamar mandi", nilai: formatAngka(data.bathrooms) },
                      {
                        label: "Ketersediaan",
                        nilai: data.units_available > 0 ? `${formatAngka(data.units_available)} unit` : "Tidak tersedia",
                      },
                    ]}
                  />

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-ink">Deskripsi</h3>
                    <p className="text-sm whitespace-pre-line text-ink-muted">{data.description}</p>
                  </div>

                  {data.facilities.length > 0 ? (
                    <>
                      <Separator />
                      <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold text-ink">Fasilitas</h3>
                        <div className="flex flex-wrap gap-2">
                          {data.facilities.map((fasilitas) => (
                            <Badge key={fasilitas} variant="outline">
                              {fasilitas}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}

                  <Separator />

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-muted">
                    {data.bedrooms > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Bed className="size-4" aria-hidden="true" />
                        {formatAngka(data.bedrooms)} kamar tidur
                      </span>
                    ) : null}
                    {data.bathrooms > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Bath className="size-4" aria-hidden="true" />
                        {formatAngka(data.bathrooms)} kamar mandi
                      </span>
                    ) : null}
                    {data.building_area > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Ruler className="size-4" aria-hidden="true" />
                        {formatAngka(data.building_area)} m²
                      </span>
                    ) : null}
                    {data.published_at ? (
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4" aria-hidden="true" />
                        Terbit {formatTanggalWib(data.published_at)}
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <PanelKontak properti={data} slug={slug} />
              <FormKontak slug={slug} />
            </div>
          </div>
        )}
      </KontenAsync>
    </div>
  );
}
