import {
  Building,
  ChartColumn,
  HandCoins,
  Heart,
  LayoutDashboard,
  Package,
  Plus,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/types/api";

export type DashboardRole = "admin" | "mitra" | "owner";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Cocokkan path secara persis (dipakai untuk halaman indeks tiap modul). */
  exact?: boolean;
  /**
   * Peran yang boleh melihat item ini. Bila kosong, item tampil untuk semua
   * peran pada dashboard tersebut. Dipakai agar menu khusus superadmin tidak
   * tampil bagi admin biasa (yang akan ditolak backend dengan 403).
   */
  peran?: readonly Role[];
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

type DashboardMeta = {
  brand: string;
  brandTagline: string;
  roleLabel: string;
  nav: NavSection[];
};

export const dashboardMeta: Record<DashboardRole, DashboardMeta> = {
  /* FE-06 Dashboard Admin + FE-07 Dashboard Superadmin */
  admin: {
    brand: "ENM Property",
    brandTagline: "Panel Admin",
    roleLabel: "Admin",
    nav: [
      {
        label: "Monitoring",
        items: [
          { label: "Ringkasan", href: "/admin", icon: LayoutDashboard, exact: true },
          { label: "Katalog Properti", href: "/admin/properti", icon: Building },
          { label: "Manajemen Mitra", href: "/admin/mitra", icon: Users },
        ],
      },
      {
        label: "Langganan",
        items: [
          { label: "Katalog Paket", href: "/admin/paket", icon: Package },
          { label: "Laporan Langganan", href: "/admin/laporan", icon: Receipt },
        ],
      },
      {
        label: "Superadmin",
        items: [
          { label: "Manajemen Akun", href: "/admin/akun", icon: UserCog, peran: ["superadmin"] },
          {
            label: "Master Kategori",
            href: "/admin/kategori",
            icon: Tags,
            peran: ["superadmin"],
          },
          {
            label: "Versi Perjanjian",
            href: "/admin/perjanjian",
            icon: ScrollText,
            peran: ["superadmin"],
          },
          {
            label: "Audit Log",
            href: "/admin/audit",
            icon: ShieldCheck,
            peran: ["superadmin", "owner"],
          },
          {
            label: "Pengaturan Sistem",
            href: "/admin/pengaturan",
            icon: Settings,
            peran: ["superadmin"],
          },
        ],
      },
    ],
  },

  /* FE-08 Dashboard Owner (akses baca-saja lintas modul) */
  owner: {
    brand: "ENM Property",
    brandTagline: "Panel Owner",
    roleLabel: "Owner",
    nav: [
      {
        label: "Pemantauan",
        items: [
          { label: "Ringkasan", href: "/owner", icon: LayoutDashboard, exact: true },
          { label: "Laporan Langganan", href: "/owner/laporan", icon: Receipt },
          { label: "Laporan Mitra", href: "/owner/mitra", icon: Users },
        ],
      },
      {
        label: "Kepatuhan",
        items: [{ label: "Audit Log", href: "/owner/audit", icon: ShieldCheck }],
      },
    ],
  },

  /* FE-05 Dashboard Mitra */
  mitra: {
    brand: "ENM Property",
    brandTagline: "Panel Mitra",
    roleLabel: "Mitra",
    nav: [
      {
        items: [
          { label: "Ringkasan", href: "/mitra", icon: LayoutDashboard, exact: true },
          { label: "Properti Saya", href: "/mitra/properti", icon: Building },
          { label: "Tambah Properti", href: "/mitra/properti/baru", icon: Plus },
        ],
      },
      {
        label: "Langganan & Akun",
        items: [
          { label: "Paket & Langganan", href: "/mitra/langganan", icon: Package },
          { label: "Favorit", href: "/mitra/favorit", icon: Heart },
          { label: "Profil Mitra", href: "/mitra/profil", icon: UserCog },
        ],
      },
      {
        label: "Performa",
        items: [
          { label: "Statistik Properti", href: "/mitra/statistik", icon: ChartColumn },
          { label: "Riwayat Pembayaran", href: "/mitra/pembayaran", icon: HandCoins },
        ],
      },
    ],
  },
};

/**
 * Peran yang boleh mengakses tiap dashboard.
 *
 * Didaftarkan di satu tempat agar penjaga rute (`RoleGuard`) tidak menulis
 * ulang daftar peran di setiap layout (DRY).
 */
export const peranDashboard: Record<DashboardRole, readonly Role[]> = {
  admin: ["admin", "superadmin"],
  mitra: ["mitra"],
  owner: ["owner"],
};

/**
 * Menyaring item navigasi sesuai peran aktif.
 *
 * Backend membatasi sebagian endpoint admin hanya untuk superadmin, sehingga
 * menu terkait harus disembunyikan agar pengguna tidak menabrak 403 (OCP: cukup
 * menambah anotasi `peran` pada item, tanpa mengubah logika penyaringan).
 */
export function navTerlihat(role: DashboardRole, peranAktif: Role | undefined) {
  const sections = dashboardMeta[role].nav
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.peran || (peranAktif ? item.peran.includes(peranAktif) : false),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return sections;
}

/** Ambil judul halaman dari item navigasi yang sedang aktif. */
export function cariJudulHalaman(role: DashboardRole, pathname: string) {
  const items = dashboardMeta[role].nav.flatMap((section) => section.items);
  const aktif = items
    .filter((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return aktif?.label ?? "Ringkasan";
}

/** Rute dashboard utama untuk sebuah peran pengguna. */
export function dashboardPeran(peran: string | undefined): string {
  const nilai = (peran ?? "").toLowerCase();
  if (nilai === "owner") return "/owner";
  if (nilai === "admin" || nilai === "superadmin") return "/admin";
  if (nilai === "mitra") return "/mitra";
  return "/";
}
