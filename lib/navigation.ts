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
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DashboardRole = "admin" | "mitra";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Cocokkan path secara persis (dipakai untuk halaman indeks tiap modul). */
  exact?: boolean;
  badge?: string;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

type DashboardMeta = {
  brand: string;
  brandTagline: string;
  roleLabel: string;
  /** TODO: ganti dengan data profil dari Firebase Auth / API setelah backend siap. */
  user: {
    nama: string;
    email: string;
    inisial: string;
  };
  nav: NavSection[];
};

export const dashboardMeta: Record<DashboardRole, DashboardMeta> = {
  /* FE-06 Dashboard Admin + FE-07 Dashboard Superadmin */
  admin: {
    brand: "ENM Property",
    brandTagline: "Panel Admin",
    roleLabel: "Admin",
    user: {
      nama: "Rani Admin",
      email: "admin@enmproperty.id",
      inisial: "RA",
    },
    nav: [
      {
        label: "Monitoring",
        items: [
          { label: "Ringkasan", href: "/admin", icon: LayoutDashboard, exact: true },
          { label: "Katalog Properti", href: "/admin/properti", icon: Building, badge: "128" },
          { label: "Manajemen Mitra", href: "/admin/mitra", icon: Users, badge: "12" },
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
          { label: "Manajemen Akun", href: "/admin/akun", icon: UserCog },
          { label: "Versi Perjanjian", href: "/admin/perjanjian", icon: ScrollText },
          { label: "Audit Log", href: "/admin/audit", icon: ShieldCheck },
          { label: "Pengaturan Sistem", href: "/admin/pengaturan", icon: Settings },
        ],
      },
    ],
  },

  /* FE-05 Dashboard Mitra */
  mitra: {
    brand: "ENM Property",
    brandTagline: "Panel Mitra",
    roleLabel: "Mitra",
    user: {
      nama: "Budi Santoso",
      email: "budi@villabali.id",
      inisial: "BS",
    },
    nav: [
      {
        items: [
          { label: "Ringkasan", href: "/mitra", icon: LayoutDashboard, exact: true },
          { label: "Properti Saya", href: "/mitra/properti", icon: Building, badge: "6" },
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

/** Ambil judul halaman dari item navigasi yang sedang aktif. */
export function cariJudulHalaman(role: DashboardRole, pathname: string) {
  const items = dashboardMeta[role].nav.flatMap((section) => section.items);
  const aktif = items
    .filter((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return aktif?.label ?? "Ringkasan";
}
