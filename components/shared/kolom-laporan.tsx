import type { KolomTabel } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatAngka, formatTanggalWib } from "@/lib/format";
import type { PartnerReportRow, SubscriptionReportRow } from "@/types/api";

/**
 * Definisi kolom laporan bersama.
 *
 * Laporan langganan dipakai dashboard admin dan owner, laporan mitra dipakai
 * owner; kolomnya didefinisikan sekali di sini agar tidak ada duplikasi
 * struktur tabel antar dashboard (DRY).
 */

export const kolomLaporanLangganan: KolomTabel<SubscriptionReportRow>[] = [
  {
    kunci: "kode",
    judul: "Kode Order",
    selClassName: "font-medium",
    render: (baris) => <span data-numeric>{baris.order_code}</span>,
  },
  { kunci: "mitra", judul: "Mitra", render: (baris) => baris.partner_name },
  { kunci: "paket", judul: "Paket", render: (baris) => baris.plan_name },
  {
    kunci: "jumlah",
    judul: "Jumlah",
    kepalaClassName: "text-right",
    selClassName: "text-right",
    render: (baris) => <span data-numeric>{baris.amount_label}</span>,
  },
  {
    kunci: "status",
    judul: "Status",
    render: (baris) => (
      <StatusBadge jenis="order" status={baris.status} label={baris.status_label} />
    ),
  },
  {
    kunci: "dibayar",
    judul: "Dibayar",
    selClassName: "whitespace-nowrap text-ink-muted",
    render: (baris) => (baris.paid_at ? formatTanggalWib(baris.paid_at) : "-"),
  },
  {
    kunci: "dibuat",
    judul: "Dibuat",
    selClassName: "whitespace-nowrap text-ink-muted",
    render: (baris) => formatTanggalWib(baris.created_at),
  },
];

export const kolomPartnerReport: KolomTabel<PartnerReportRow>[] = [
  {
    kunci: "mitra",
    judul: "Mitra",
    render: (baris) => (
      <span className="flex flex-col">
        <span className="font-medium text-ink">{baris.business_name}</span>
        <span className="text-xs text-ink-muted">{baris.pic_name}</span>
      </span>
    ),
  },
  {
    kunci: "wilayah",
    judul: "Wilayah",
    render: (baris) => (
      <span className="text-ink-muted">
        {baris.city}, {baris.province}
      </span>
    ),
  },
  {
    kunci: "status",
    judul: "Status",
    render: (baris) => (
      <StatusBadge jenis="mitra" status={baris.status} label={baris.status_label} />
    ),
  },
  {
    kunci: "properti",
    judul: "Properti",
    kepalaClassName: "text-right",
    selClassName: "text-right",
    render: (baris) => (
      <span data-numeric>
        {formatAngka(baris.properties_total)}
        <span className="text-ink-subtle"> / {formatAngka(baris.properties_active)}</span>
      </span>
    ),
  },
  {
    kunci: "tayangan",
    judul: "Tayangan",
    kepalaClassName: "text-right",
    selClassName: "text-right",
    render: (baris) => <span data-numeric>{formatAngka(baris.property_views)}</span>,
  },
  {
    kunci: "kontak",
    judul: "Kontak",
    kepalaClassName: "text-right",
    selClassName: "text-right",
    render: (baris) => <span data-numeric>{formatAngka(baris.property_contacts)}</span>,
  },
];
