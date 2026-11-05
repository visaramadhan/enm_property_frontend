"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserCog } from "lucide-react";

import { PageTransition } from "@/components/layout/page-transition";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { LABEL_PERAN } from "@/lib/enum";
import { formatTanggalWib } from "@/lib/format";
import {
  cariJudulHalaman,
  dashboardMeta,
  navTerlihat,
  type DashboardRole,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

const subscribeTanggal = () => () => {};

/**
 * Tanggal WIB hanya dibaca di klien agar tidak dievaluasi saat prerender
 * (Cache Components melarang `new Date()` di render server).
 */
function useTanggalWib() {
  return React.useSyncExternalStore(
    subscribeTanggal,
    () => `${formatTanggalWib(new Date())} WIB`,
    () => "",
  );
}

/** Membentuk inisial dari nama pengguna, contoh: "Budi Santoso" -> "BS". */
function inisialDari(nama: string) {
  const bagian = nama.trim().split(/\s+/).filter(Boolean);
  if (bagian.length === 0) return "EN";
  if (bagian.length === 1) return bagian[0].slice(0, 2).toUpperCase();
  return `${bagian[0][0]}${bagian[bagian.length - 1][0]}`.toUpperCase();
}

type Identitas = {
  nama: string;
  email: string;
  inisial: string;
  avatarUrl?: string;
  label: string;
};

/* Bagian 8.3 - Sidebar dashboard 248 putih (nav item sesuai 7.12) */
function SidebarContent({
  role,
  pathname,
  identitas,
  peranAktif,
  onNavigate,
}: {
  role: DashboardRole;
  pathname: string;
  identitas: Identitas;
  peranAktif?: Role;
  onNavigate?: () => void;
}) {
  const meta = dashboardMeta[role];
  const sections = navTerlihat(role, peranAktif);

  return (
    <>
      {/* Brand area: penanda kotak + wordmark + sub portal */}
      <Link
        href={`/${role}`}
        onClick={onNavigate}
        className="flex items-center gap-3 border-b border-line px-5 py-[18px]"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-[12px] font-extrabold text-secondary-foreground">
          ENM
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-extrabold tracking-tight text-ink">
            {meta.brand}
          </span>
          <span className="truncate text-[10px] font-semibold tracking-[0.145em] text-ink-subtle uppercase">
            {meta.brandTagline}
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.label ?? "utama"} className="flex flex-col gap-0.5">
            {section.label ? (
              <p className="px-[11px] pt-[14px] pb-2 text-[10px] font-bold tracking-[0.145em] text-ink-subtle uppercase">
                {section.label}
              </p>
            ) : null}

            {section.items.map((item) => {
              const aktif = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={aktif ? "page" : undefined}
                  className={cn(
                    "relative flex h-11 items-center gap-[11px] rounded-sm px-3 text-xs font-medium transition-colors duration-150 ease-out",
                    aktif
                      ? "bg-secondary-tint font-bold text-secondary"
                      : "text-nav-ink hover:bg-hover hover:text-ink",
                  )}
                >
                  {aktif ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-[9px] left-0 w-[3px] rounded-r-[3px] bg-primary"
                    />
                  ) : null}
                  <item.icon
                    className={cn("size-[17px] shrink-0", aktif ? "text-secondary" : "text-icon-muted")}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-sm bg-canvas p-3">
          <Avatar size="sm">
            {identitas.avatarUrl ? <AvatarImage src={identitas.avatarUrl} alt="" /> : null}
            <AvatarFallback>{identitas.inisial}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[12px] font-semibold text-ink">{identitas.nama}</span>
            <span className="truncate text-[11px] text-ink-muted">{identitas.email}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const tanggalWib = useTanggalWib();
  const { pengguna, keluar } = useAuth();
  const meta = dashboardMeta[role];
  const judul = cariJudulHalaman(role, pathname);

  const identitas = React.useMemo<Identitas>(() => {
    const nama = pengguna?.name ?? meta.roleLabel;
    return {
      nama,
      email: pengguna?.email ?? "",
      inisial: inisialDari(nama),
      avatarUrl: pengguna?.avatar_url || undefined,
      label: pengguna?.role_label || (pengguna ? LABEL_PERAN[pengguna.role] : meta.roleLabel),
    };
  }, [pengguna, meta.roleLabel]);

  return (
    <div data-density="compact" className="flex min-h-screen bg-canvas">
      {/* Sidebar desktop: 248px (bagian 4/8.3) */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <SidebarContent
          role={role}
          pathname={pathname}
          identitas={identitas}
          peranAktif={pengguna?.role}
        />
      </aside>

      {/* Drawer mobile dengan backdrop blur (bagian 8) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Menu navigasi {meta.brandTagline}</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarContent
              role={role}
              pathname={pathname}
              identitas={identitas}
              peranAktif={pengguna?.role}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar 66px (bagian 8.3) */}
        <header className="sticky top-0 z-30 flex h-[66px] items-center gap-3 border-b border-line bg-surface/96 px-4 backdrop-blur lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu navigasi"
          >
            <Menu />
          </Button>

          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-base font-semibold text-ink">{judul}</h1>
            <p className="hidden truncate text-xs text-ink-muted sm:block">{tanggalWib}</p>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="relative hidden md:block">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Cari properti, mitra, invoice..."
                aria-label="Cari"
                className="h-10 w-56 pl-9 lg:w-72"
              />
            </div>

            <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
              <Bell />
              <span className="absolute top-3 right-3 size-2 rounded-full bg-accent" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu akun"
                  className="flex items-center gap-2 rounded-sm p-1 pr-2 transition-colors duration-150 ease-out hover:bg-hover"
                >
                  <Avatar size="sm">
                    {identitas.avatarUrl ? <AvatarImage src={identitas.avatarUrl} alt="" /> : null}
                    <AvatarFallback>{identitas.inisial}</AvatarFallback>
                  </Avatar>
                  <span className="hidden flex-col items-start md:flex">
                    <span className="text-[13px] font-medium leading-tight text-ink">
                      {identitas.nama}
                    </span>
                    <span className="text-[11px] text-ink-muted">{identitas.label}</span>
                  </span>
                  <ChevronDown className="size-4 text-ink-subtle" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Masuk sebagai</DropdownMenuLabel>
                <div className="px-3 pb-1">
                  <p className="truncate text-sm font-medium text-ink">{identitas.nama}</p>
                  <p className="truncate text-xs text-ink-muted">{identitas.email}</p>
                </div>
                <div className="px-3 pb-2">
                  <Badge variant="accent">{identitas.label}</Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${role}/profil`}>
                    <UserCog />
                    Profil Saya
                  </Link>
                </DropdownMenuItem>
                {pengguna?.role === "superadmin" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/pengaturan">
                      <Settings />
                      Pengaturan
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="danger" onSelect={() => void keluar()}>
                  <LogOut />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Konten dashboard: maks 1500px (bagian 4/8.3) */}
        <main className="flex-1 px-4 py-[30px] lg:px-8 xl:px-11">
          <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
