"use client";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { kolomPartnerReport } from "@/components/shared/kolom-laporan";
import { PageHeader } from "@/components/shared/page-header";
import { TabelData } from "@/components/shared/tabel-data";
import { useLaporanMitraOwner } from "@/lib/api/hooks";
import { OPSI_STATUS_MITRA } from "@/lib/enum";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { PartnerStatus } from "@/types/api";

interface FilterMitra {
  status?: PartnerStatus;
}

/**
 * Laporan kinerja mitra untuk owner (baca-saja).
 *
 * Memakai `GET /owner/reports/partners` yang sudah berpaginasi, sehingga
 * `meta` dapat diteruskan langsung ke `TabelData` tanpa penyusunan manual.
 */
export function LaporanMitraOwner() {
  const { t } = useBahasa();
  const tabel = useTabelQuery<FilterMitra>({ perPage: 10 });
  const daftar = useLaporanMitraOwner(tabel.query);

  return (
    <>
      <PageHeader
        judul={t("Laporan Mitra")}
        deskripsi={t("Kinerja katalog dan interaksi setiap mitra di platform.")}
      />

      <TabelData
        kolom={kolomPartnerReport}
        data={daftar.data?.items}
        meta={daftar.data?.meta}
        kunciBaris={(baris) => baris.partner_id}
        memuat={daftar.isPending}
        error={daftar.isError ? daftar.error : undefined}
        onCobaLagi={() => void daftar.refetch()}
        onUbahHalaman={tabel.aturHalaman}
        nilaiCari={tabel.cari}
        onCari={tabel.ubahCari}
        placeholderCari={t("Cari nama bisnis, PIC, atau kota...")}
        satuan={t("mitra")}
        filter={[
          {
            kunci: "status",
            label: t("Status"),
            nilai: tabel.filter.status,
            opsi: OPSI_STATUS_MITRA.map((o) => ({ ...o, label: t(o.label) })),
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as PartnerStatus | undefined),
          },
        ]}
        kosong={
          <EmptyState
            judul={t("Belum ada data mitra")}
            deskripsi={t("Kinerja mitra akan tampil di sini setelah ada aktivitas.")}
          />
        }
      />
    </>
  );
}
