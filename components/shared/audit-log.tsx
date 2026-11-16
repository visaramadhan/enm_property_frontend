"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import type { KolomTabel } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Button } from "@/components/ui/button";
import { unduhAudit } from "@/lib/api/endpoints";
import { useDaftarAudit } from "@/lib/api/hooks";
import { OPSI_AKSI_AUDIT, OPSI_PERAN } from "@/lib/enum";
import { formatWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import { jalankanDenganToast } from "@/lib/toast";
import { unduhBerkas } from "@/lib/unduh";
import type { AuditAction, AuditView, Role } from "@/types/api";

/**
 * Halaman Audit Log bersama.
 *
 * Dipakai dashboard admin/superadmin dan owner karena backend mengizinkan
 * kedua peran membaca serta mengekspor `admin/audit-logs` (DRY).
 */

interface FilterAudit {
  action?: AuditAction;
  actor_role?: Role;
}

function kolomAudit(t: (teks: string) => string): KolomTabel<AuditView>[] {
  return [
    {
      kunci: "waktu",
      judul: t("Waktu"),
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => formatWib(baris.created_at),
    },
    {
      kunci: "aktor",
      judul: t("Aktor"),
      render: (baris) => (
        <span className="flex flex-col">
          <span className="font-medium text-ink">{baris.actor_name}</span>
          <span className="text-xs text-ink-muted">{baris.actor_email}</span>
        </span>
      ),
    },
    {
      kunci: "peran",
      judul: t("Peran"),
      render: (baris) => <StatusBadge jenis="peran" status={baris.actor_role} />,
    },
    {
      kunci: "aksi",
      judul: t("Aksi"),
      render: (baris) => <StatusBadge jenis="audit" status={baris.action} />,
    },
    {
      kunci: "entitas",
      judul: t("Entitas"),
      render: (baris) => (
        <span className="flex flex-col">
          <span className="text-ink">{baris.entity || "-"}</span>
          {baris.entity_id ? (
            <span className="text-xs text-ink-muted">{baris.entity_id}</span>
          ) : null}
        </span>
      ),
    },
    {
      kunci: "ip",
      judul: "IP",
      selClassName: "text-ink-muted",
      render: (baris) => <span data-numeric>{baris.ip_address || "-"}</span>,
    },
    {
      kunci: "catatan",
      judul: t("Catatan"),
      selClassName: "max-w-xs truncate text-ink-muted",
      render: (baris) => baris.note || "-",
    },
  ];
}

export function AuditLog() {
  const { t } = useBahasa();
  const tabel = useTabelQuery<FilterAudit>({ perPage: 10 });
  const daftar = useDaftarAudit(tabel.query);
  const kolom = React.useMemo(() => kolomAudit(t), [t]);

  async function ekspor(format: "xlsx" | "pdf") {
    await jalankanDenganToast(
      async () => {
        const blob = await unduhAudit({ ...tabel.query, format });
        unduhBerkas(blob, `audit-log.${format}`);
      },
      {
        memuat: t("Menyiapkan berkas..."),
        sukses: t("Berkas audit berhasil diunduh"),
        gagal: t("Gagal mengunduh berkas audit"),
      },
    );
  }

  return (
    <>
      <PageHeader
        judul={t("Audit Log")}
        deskripsi={t("Jejak seluruh tindakan administratif yang tercatat pada platform.")}
        aksi={
          <>
            <Button variant="outline" onClick={() => void ekspor("xlsx")}>
              <Download />
              Excel
            </Button>
            <Button variant="outline" onClick={() => void ekspor("pdf")}>
              <Download />
              PDF
            </Button>
          </>
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
        placeholderCari={t("Cari aktor, entitas, atau catatan...")}
        satuan={t("catatan")}
        filter={[
          {
            kunci: "action",
            label: t("Aksi"),
            nilai: tabel.filter.action,
            opsi: OPSI_AKSI_AUDIT,
            onUbah: (nilai) => tabel.ubahFilter("action", nilai as AuditAction | undefined),
          },
          {
            kunci: "actor_role",
            label: t("Peran"),
            nilai: tabel.filter.actor_role,
            opsi: OPSI_PERAN,
            onUbah: (nilai) => tabel.ubahFilter("actor_role", nilai as Role | undefined),
          },
        ]}
        kosong={
          <EmptyState
            judul={t("Belum ada catatan audit")}
            deskripsi={t("Aktivitas administratif akan tercatat di sini secara otomatis.")}
          />
        }
      />
    </>
  );
}
