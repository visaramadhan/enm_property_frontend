"use client";

import * as React from "react";
import { ExternalLink, Link2, PencilLine, Plus, Power } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  BidangPaket,
  buatSkemaPaket,
  keCreatePlan,
  keUpdatePlan,
  nilaiAwalPaket,
  nilaiDariPaket,
  type NilaiPaket,
} from "@/components/admin/form-paket";
import { AksiBaris, type AksiBarisItem } from "@/components/shared/aksi-baris";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { KolomTabel } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { TabelData } from "@/components/shared/tabel-data";
import { useAuth } from "@/components/providers/auth-provider";
import { useBahasa } from "@/components/providers/bahasa-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBuatPaket, useDaftarPaketAdmin, usePerbaruiPaket, useUbahStatusPaket } from "@/lib/api/hooks";
import { formatAngka } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import { salinDenganToast } from "@/lib/papan-klip";
import type { PlanView } from "@/types/api";

/**
 * URL checkout satu paket.
 *
 * Memakai `NEXT_PUBLIC_LANDING_URL` bila tersedia agar tautan mengarah ke domain
 * landing saat panel admin dan landing berada di host berbeda; bila tidak diisi,
 * pengguna nilai origin peramban (berguna untuk pratinjau di lokal).
 */
function tautanCheckout(slug: string): string {
  const dasar = process.env.NEXT_PUBLIC_LANDING_URL || window.location.origin;
  return `${dasar.replace(/\/$/, "")}/checkout/${slug}`;
}

/** Dialog buat/ubah paket; menerima `paket` kosong untuk mode pembuatan. */
function FormPaket({ paket, onTutup }: { paket?: PlanView; onTutup: () => void }) {
  const { t } = useBahasa();
  const buat = useBuatPaket();
  const ubah = usePerbaruiPaket();
  const skema = React.useMemo(() => buatSkemaPaket(t), [t]);
  const form = useForm<NilaiPaket>({
    resolver: zodResolver(skema),
    defaultValues: paket ? nilaiDariPaket(paket) : nilaiAwalPaket,
  });

  async function kirim(nilai: NilaiPaket) {
    try {
      if (paket) await ubah.mutateAsync({ id: paket.id, body: keUpdatePlan(nilai) });
      else await buat.mutateAsync(keCreatePlan(nilai));
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
      judul={paket ? t("Ubah paket") : t("Paket langganan baru")}
      deskripsi={
        paket ? t("Perubahan berlaku untuk pembelian berikutnya.") : t("Tentukan harga, kuota, dan fasilitas paket.")
      }
      ukuran="max-w-2xl"
      memuat={buat.isPending || ubah.isPending}
      labelKirim={paket ? t("Simpan perubahan") : t("Buat paket")}
      onSubmit={form.handleSubmit(kirim)}
    >
      <div className="max-h-[62vh] overflow-y-auto pr-1">
        <BidangPaket control={form.control} modeUbah={Boolean(paket)} />
      </div>
    </FormDialog>
  );
}

export function KatalogPaket() {
  const { t } = useBahasa();
  const { pengguna } = useAuth();
  const bolehKelola = pengguna?.role === "superadmin";

  const tabel = useTabelQuery({ perPage: 10 });
  const daftar = useDaftarPaketAdmin(tabel.query);
  const ubahStatus = useUbahStatusPaket();

  const [editor, setEditor] = React.useState<{ terbuka: boolean; paket?: PlanView } | null>(null);
  const [targetStatus, setTargetStatus] = React.useState<PlanView | null>(null);

  async function salinLinkCheckout(slug: string) {
    await salinDenganToast(tautanCheckout(slug), t("Link checkout disalin"));
  }

  function bukaCheckout(slug: string) {
    window.open(tautanCheckout(slug), "_blank", "noopener,noreferrer");
  }

  async function konfirmasiStatus() {
    if (!targetStatus) return;
    try {
      await ubahStatus.mutateAsync({ id: targetStatus.id, body: { active: !targetStatus.is_active } });
      setTargetStatus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const kolom: KolomTabel<PlanView>[] = [
    {
      kunci: "paket",
      judul: t("Paket"),
      render: (baris) => (
        <span className="flex flex-col">
          <span className="font-medium text-ink">{baris.name}</span>
          <span className="text-xs text-ink-muted">{baris.slug}</span>
        </span>
      ),
    },
    {
      kunci: "harga",
      judul: t("Harga"),
      selClassName: "whitespace-nowrap",
      render: (baris) => (
        <span data-numeric className="font-medium text-ink">
          {baris.is_free ? t("Gratis") : baris.price_label}
        </span>
      ),
    },
    {
      kunci: "durasi",
      judul: t("Durasi"),
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => t("{n} hari", { n: formatAngka(baris.duration_days) }),
    },
    {
      kunci: "kuota",
      judul: t("Kuota"),
      selClassName: "text-ink-muted",
      render: (baris) => (baris.is_unlimited ? t("Tanpa batas") : formatAngka(baris.listing_quota)),
    },
    {
      kunci: "urutan",
      judul: t("Urutan"),
      kepalaClassName: "text-right",
      selClassName: "text-right text-ink-muted",
      render: (baris) => <span data-numeric>{baris.sort_order}</span>,
    },
    {
      kunci: "status",
      judul: t("Status"),
      render: (baris) => (
        <Badge variant={baris.is_active ? "success" : "neutral"}>
          {baris.is_active ? t("Aktif") : t("Nonaktif")}
        </Badge>
      ),
    },
    {
      kunci: "aksi",
      judul: "",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => {
        const aksi: AksiBarisItem[] = [
          { label: t("Salin link checkout"), ikon: Link2, onPilih: () => void salinLinkCheckout(baris.slug) },
          { label: t("Buka checkout"), ikon: ExternalLink, onPilih: () => bukaCheckout(baris.slug) },
        ];

        if (bolehKelola) {
          aksi.push(
            {
              label: t("Ubah paket"),
              ikon: PencilLine,
              onPilih: () => setEditor({ terbuka: true, paket: baris }),
            },
            {
              label: baris.is_active ? t("Nonaktifkan") : t("Aktifkan"),
              ikon: Power,
              onPilih: () => setTargetStatus(baris),
            },
          );
        }

        return <AksiBaris aksi={aksi} />;
      },
    },
  ];

  return (
    <>
      <PageHeader
        judul={t("Katalog Paket")}
        deskripsi={t("Daftar paket langganan yang ditawarkan kepada mitra.")}
        aksi={
          bolehKelola ? (
            <Button onClick={() => setEditor({ terbuka: true })}>
              <Plus />
              {t("Tambah Paket")}
            </Button>
          ) : null
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
        placeholderCari={t("Cari nama atau slug paket...")}
        satuan={t("paket")}
        kosong={
          <EmptyState
            judul={t("Belum ada paket")}
            deskripsi={t("Tambahkan paket langganan agar mitra dapat berlangganan.")}
          />
        }
      />

      {editor?.terbuka ? (
        <FormPaket
          key={editor.paket?.id ?? "baru"}
          paket={editor.paket}
          onTutup={() => setEditor(null)}
        />
      ) : null}

      {targetStatus ? (
        <ConfirmDialog
          key={targetStatus.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetStatus(null);
          }}
          judul={targetStatus.is_active ? t("Nonaktifkan paket") : t("Aktifkan paket")}
          deskripsi={
            targetStatus.is_active
              ? t('Paket "{nama}" tidak akan tampil di katalog publik.', { nama: targetStatus.name })
              : t('Paket "{nama}" akan tampil di katalog publik.', { nama: targetStatus.name })
          }
          labelKonfirmasi={targetStatus.is_active ? t("Nonaktifkan") : t("Aktifkan")}
          variant={targetStatus.is_active ? "danger" : "primary"}
          memuat={ubahStatus.isPending}
          onKonfirmasi={() => void konfirmasiStatus()}
        />
      ) : null}
    </>
  );
}
