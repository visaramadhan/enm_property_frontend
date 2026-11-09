"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Eye,
  FileText,
  MessageCircle,
  PencilLine,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SelHarga, SelProperti } from "@/components/properti/sel-properti";
import { AksiBaris } from "@/components/shared/aksi-baris";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { KolomTabel } from "@/components/shared/data-table";
import { DetailDialog } from "@/components/shared/detail-dialog";
import { DialogUbahStatus, type NilaiStatus } from "@/components/shared/dialog-status";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { TextField } from "@/components/shared/form-field";
import { KontenAsync } from "@/components/shared/konten-async";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDaftarPropertiMitra,
  useHapusProperti,
  useLanggananMitra,
  useLeadProperti,
  useProfilMitra,
  useUbahBoostProperti,
  useUbahKetersediaanProperti,
  useUbahStatusProperti,
} from "@/lib/api/hooks";
import { OPSI_STATUS_PROPERTI, OPSI_TIPE_PENAWARAN } from "@/lib/enum";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { LeadView, ListingType, PropertyStatus, PropertySummary } from "@/types/api";

interface FilterProperti {
  status?: PropertyStatus;
  listing_type?: ListingType;
}

/** Kanal lead pada tabel mitra. */
type KanalLead = "whatsapp" | "form";

/** Mitra hanya dapat memilih tiga status ini (sesuai `SetPropertyStatusRequest`). */
const OPSI_STATUS_MITRA = OPSI_STATUS_PROPERTI.filter(
  (opsi) => opsi.nilai === "draft" || opsi.nilai === "active" || opsi.nilai === "inactive",
);

const skemaKetersediaan = z.object({
  units_available: z
    .string()
    .trim()
    .min(1, "Jumlah unit wajib diisi")
    .refine((nilai) => /^\d+$/.test(nilai), "Harus berupa angka"),
});

type NilaiKetersediaan = z.infer<typeof skemaKetersediaan>;

function DialogKetersediaan({
  properti,
  onTutup,
}: {
  properti: PropertySummary;
  onTutup: () => void;
}) {
  const simpan = useUbahKetersediaanProperti();
  const form = useForm<NilaiKetersediaan>({
    resolver: zodResolver(skemaKetersediaan),
    defaultValues: { units_available: String(properti.units_available) },
  });

  async function kirim(nilai: NilaiKetersediaan) {
    try {
      await simpan.mutateAsync({
        id: properti.id,
        body: { units_available: Number(nilai.units_available) },
      });
      onTutup();
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <FormDialog
      terbuka
      onUbahTerbuka={(nilai) => {
        if (!nilai) onTutup();
      }}
      judul="Ubah ketersediaan unit"
      deskripsi={properti.title}
      memuat={simpan.isPending}
      labelKirim="Simpan"
      onSubmit={form.handleSubmit(kirim)}
    >
      <TextField
        control={form.control}
        name="units_available"
        label="Unit tersedia"
        wajib
        inputMode="numeric"
        deskripsi="Jumlah unit yang masih dapat dipasarkan."
      />
    </FormDialog>
  );
}

/**
 * Dialog daftar lead pada satu properti (klik WhatsApp atau isi form).
 *
 * Menampilkan pengguna yang tercatat menekan tombol WhatsApp beserta penanda
 * bahwa ia sudah masuk (login), atau data pengirim form kontak publik. Data
 * diambil saat dialog dibuka sehingga tabel tetap ringan.
 */
function DialogLead({
  properti,
  channel,
  onTutup,
}: {
  properti: PropertySummary;
  channel: KanalLead;
  onTutup: () => void;
}) {
  const leads = useLeadProperti(properti.id, channel);
  const judul = channel === "whatsapp" ? "Klik WhatsApp" : "Isi Form";

  return (
    <DetailDialog
      terbuka
      onUbahTerbuka={(nilai) => {
        if (!nilai) onTutup();
      }}
      judul={`Lead: ${judul}`}
      deskripsi={properti.title}
    >
      <KontenAsync
        hasil={leads}
        skeleton={
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, indeks) => (
              <Skeleton key={indeks} className="h-20 rounded-field" />
            ))}
          </div>
        }
        judulGagal="Gagal memuat lead"
      >
        {(data) =>
          data.length === 0 ? (
            <EmptyState
              judul="Belum ada lead"
              deskripsi={
                channel === "whatsapp"
                  ? "Belum ada pengunjung yang menekan tombol WhatsApp pada properti ini."
                  : "Belum ada pengunjung yang mengirim form kontak pada properti ini."
              }
            />
          ) : (
            <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
              {data.map((lead) => (
                <BarisLead key={lead.id} lead={lead} />
              ))}
            </div>
          )
        }
      </KontenAsync>
    </DetailDialog>
  );
}

/** Satu baris catatan lead di dalam dialog. */
function BarisLead({ lead }: { lead: LeadView }) {
  const nama = lead.user_name || lead.name || "Pengunjung";

  return (
    <div className="flex flex-col gap-1 rounded-field border border-line p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          {nama}
          {lead.user_id ? <Badge variant="neutral">Login</Badge> : null}
        </span>
        <span className="text-[12px] text-ink-subtle">{formatTanggalWib(lead.created_at)}</span>
      </div>
      {lead.user_email ? <span className="text-[13px] text-ink-muted">{lead.user_email}</span> : null}
      {lead.phone ? <span className="text-[13px] text-ink-muted">Telp: {lead.phone}</span> : null}
      {lead.message ? (
        <p className="text-[13px] whitespace-pre-line text-ink-muted">{lead.message}</p>
      ) : null}
    </div>
  );
}

/** Ringkasan pemakaian kuota boost paket aktif. */
function RingkasanBoost({
  kuota,
  terpakai,
}: {
  kuota: number;
  terpakai: number;
}) {
  if (kuota <= 0) return null;

  return (
    <Badge variant="accent">
      <Sparkles />
      Boost {terpakai}/{kuota}
    </Badge>
  );
}

export function PropertiMitra() {
  const router = useRouter();
  const tabel = useTabelQuery<FilterProperti>({ perPage: 10 });
  const daftar = useDaftarPropertiMitra(tabel.query);
  const langganan = useLanggananMitra();
  const profil = useProfilMitra();
  const ubahStatus = useUbahStatusProperti();
  const ubahBoost = useUbahBoostProperti();
  const hapus = useHapusProperti();

  const [targetStatus, setTargetStatus] = React.useState<PropertySummary | null>(null);
  const [targetKetersediaan, setTargetKetersediaan] = React.useState<PropertySummary | null>(null);
  const [targetHapus, setTargetHapus] = React.useState<PropertySummary | null>(null);
  const [targetLead, setTargetLead] = React.useState<{
    properti: PropertySummary;
    channel: KanalLead;
  } | null>(null);

  const boostQuota = langganan.data?.boost_quota ?? 0;
  /* Bila data langganan belum termuat, tombol boost tetap aktif agar backend
     yang memberi tahu bila paket mitra memang belum mendukung boost. */
  const boostTersedia = langganan.data ? boostQuota > 0 : true;

  async function kirimStatus(nilai: NilaiStatus) {
    if (!targetStatus) return;
    try {
      await ubahStatus.mutateAsync({
        id: targetStatus.id,
        body: { status: nilai.status as "draft" | "active" | "inactive" },
      });
      setTargetStatus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function konfirmasiHapus() {
    if (!targetHapus) return;
    try {
      await hapus.mutateAsync(targetHapus.id);
      setTargetHapus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  /** Mengaktifkan/menonaktifkan boost listing; kuota ditegakkan backend. */
  async function ubahBoostProperti(properti: PropertySummary) {
    try {
      await ubahBoost.mutateAsync({ id: properti.id, body: { active: !properti.boost_active } });
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const kolom: KolomTabel<PropertySummary>[] = [
    { kunci: "properti", judul: "Properti", render: (baris) => <SelProperti properti={baris} /> },
    { kunci: "harga", judul: "Harga", render: (baris) => <SelHarga properti={baris} /> },
    {
      kunci: "status",
      judul: "Status",
      render: (baris) => (
        <StatusBadge jenis="properti" status={baris.status} label={baris.status_label} />
      ),
    },
    {
      kunci: "boost",
      judul: "Boost",
      render: (baris) =>
        baris.boost_active ? (
          <div className="flex flex-col gap-1">
            <Badge variant="accent">
              <Sparkles />
              Unggulan
            </Badge>
            {baris.boost_until ? (
              <span className="text-[12px] text-ink-subtle">
                s.d. {formatTanggalWib(baris.boost_until)}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-ink-subtle">—</span>
        ),
    },
    {
      kunci: "unit",
      judul: "Unit",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.units_available)}</span>,
    },
    {
      kunci: "tayangan",
      judul: "Tayangan",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => <span data-numeric>{formatAngka(baris.views)}</span>,
    },
    {
      kunci: "wa",
      judul: "Klik WA",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => (
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => setTargetLead({ properti: baris, channel: "whatsapp" })}
        >
          <MessageCircle />
          <span data-numeric>{formatAngka(baris.wa_contact_count)}</span>
        </Button>
      ),
    },
    {
      kunci: "form",
      judul: "Isi Form",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => (
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => setTargetLead({ properti: baris, channel: "form" })}
        >
          <FileText />
          <span data-numeric>{formatAngka(baris.form_contact_count)}</span>
        </Button>
      ),
    },
    {
      kunci: "dibuat",
      judul: "Diajukan",
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatTanggalWib(baris.created_at),
    },
    {
      kunci: "aksi",
      judul: "",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => (
        <AksiBaris
          aksi={[
            {
              label: "Ubah properti",
              ikon: PencilLine,
              onPilih: () => router.push(`/mitra/properti/${baris.id}`),
            },
            {
              label: baris.boost_active ? "Nonaktifkan boost" : "Aktifkan boost",
              ikon: Rocket,
              disabled: !baris.boost_active && !boostTersedia,
              onPilih: () => void ubahBoostProperti(baris),
            },
            { label: "Ubah status", ikon: PencilLine, onPilih: () => setTargetStatus(baris) },
            {
              label: "Ubah ketersediaan",
              ikon: Boxes,
              onPilih: () => setTargetKetersediaan(baris),
            },
            { label: "Hapus", ikon: Trash2, variant: "danger", onPilih: () => setTargetHapus(baris) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        judul="Properti Saya"
        deskripsi="Kelola listing properti, boost unggulan, status tayang, dan ketersediaan unit."
        aksi={
          <div className="flex flex-wrap items-center gap-2">
            <RingkasanBoost kuota={boostQuota} terpakai={langganan.data?.boost_used ?? 0} />
            {profil.data ? (
              <Button variant="outline" asChild>
                <Link href={`/pengelola/${profil.data.id}?dari=dashboard`}>
                  <Eye />
                  Review katalog
                </Link>
              </Button>
            ) : null}
            <Button asChild>
              <Link href="/mitra/properti/baru">
                <Plus />
                Tambah Properti
              </Link>
            </Button>
          </div>
        }
      />

      <TabelData
        kolom={kolom}
        data={daftar.data?.items}
        meta={daftar.data?.meta}
        kunciBaris={(baris) => baris.id}
        memuat={daftar.isPending}
        error={daftar.isError ? daftar.error : undefined}
        onCobaLagi={() => void daftar.refetch()}
        onUbahHalaman={tabel.aturHalaman}
        nilaiCari={tabel.cari}
        onCari={tabel.ubahCari}
        placeholderCari="Cari judul atau kota..."
        satuan="properti"
        filter={[
          {
            kunci: "status",
            label: "Status",
            nilai: tabel.filter.status,
            opsi: OPSI_STATUS_PROPERTI,
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as PropertyStatus | undefined),
          },
          {
            kunci: "listing_type",
            label: "Penawaran",
            nilai: tabel.filter.listing_type,
            opsi: OPSI_TIPE_PENAWARAN,
            onUbah: (nilai) => tabel.ubahFilter("listing_type", nilai as ListingType | undefined),
          },
        ]}
        kosong={
          <EmptyState
            judul="Belum ada properti"
            deskripsi="Tambahkan properti pertama Anda untuk mulai menayangkan listing."
            aksi={
              <Button asChild size="sm">
                <Link href="/mitra/properti/baru">
                  <Plus />
                  Tambah Properti
                </Link>
              </Button>
            }
          />
        }
      />

      {targetStatus ? (
        <DialogUbahStatus
          key={targetStatus.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetStatus(null);
          }}
          judul="Ubah status properti"
          deskripsi={targetStatus.title}
          opsi={OPSI_STATUS_MITRA}
          nilaiAwal={OPSI_STATUS_MITRA.some((opsi) => opsi.nilai === targetStatus.status) ? targetStatus.status : "draft"}
          memuat={ubahStatus.isPending}
          onKirim={kirimStatus}
        />
      ) : null}

      {targetKetersediaan ? (
        <DialogKetersediaan
          key={targetKetersediaan.id}
          properti={targetKetersediaan}
          onTutup={() => setTargetKetersediaan(null)}
        />
      ) : null}

      {targetLead ? (
        <DialogLead
          key={`${targetLead.properti.id}-${targetLead.channel}`}
          properti={targetLead.properti}
          channel={targetLead.channel}
          onTutup={() => setTargetLead(null)}
        />
      ) : null}

      {targetHapus ? (
        <ConfirmDialog
          key={targetHapus.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetHapus(null);
          }}
          judul="Hapus properti"
          deskripsi={`Properti "${targetHapus.title}" akan dihapus dari katalog. Tindakan ini tidak dapat dibatalkan.`}
          labelKonfirmasi="Hapus"
          variant="danger"
          memuat={hapus.isPending}
          onKonfirmasi={() => void konfirmasiHapus()}
        />
      ) : null}
    </>
  );
}
