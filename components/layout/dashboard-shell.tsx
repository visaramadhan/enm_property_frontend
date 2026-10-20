"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserCog } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cariJudulHalaman, dashboardMeta, type DashboardRole } from "@/lib/navigation";
import { formatTanggalWib } from "@/lib/format";
import { cn } from "@/lib/utils";

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

/* Bagian 8 - Sidebar (Dashboard Mitra & Admin) */
function SidebarContent({
  role,
  pathname,
  onNavigate,
}: {
  role: DashboardRole;
  pathname: string;
  onNavigate?: () => void;
}) {
  const meta = dashboardMeta[role];

  return (
    <>
      {/* Logo/brand area: padding 24px, border-bottom rgba(255,255,255,.1) */}
      <Link
        href={`/${role}`}
        onClick={onNavigate}
        className="flex items-center gap-3 border-b border-white/10 p-6"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-field bg-primary text-sm font-bold text-primary-foreground">
          EN
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-secondary-foreground">
            {meta.brand}
          </span>
          <span className="truncate text-xs text-secondary-foreground/60">{meta.brandTagline}</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        {meta.nav.map((section) => (
          <div key={section.label ?? "utama"} className="flex flex-col gap-1">
            {section.label ? (
              <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-secondary-foreground/50">
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
                    "flex h-11 items-center gap-3 rounded-field px-3 text-sm font-medium transition-colors duration-150 ease-out",
                    aktif
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-secondary-foreground/80 hover:bg-white/10 hover:text-secondary-foreground",
                  )}
                >
                  <item.icon className="size-5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium",
                        aktif ? "bg-white/20 text-primary-foreground" : "bg-white/10 text-secondary-foreground/80",
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-field bg-white/5 p-3">
          <Avatar size="sm">
            <AvatarFallback>{meta.user.inisial}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-medium text-secondary-foreground">
              {meta.user.nama}
            </span>
            <span className="truncate text-[11px] text-secondary-foreground/60">
              {meta.user.email}
            </span>
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
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const tanggalWib = useTanggalWib();
  const meta = dashboardMeta[role];
  const judul = cariJudulHalaman(role, pathname);

  async function handleKeluar() {
    try {
      const [{ signOut }, { getFirebaseAuth }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/client"),
      ]);
      await signOut(getFirebaseAuth());
    } catch {
      // Firebase belum dikonfigurasi - pengguna tetap diarahkan ke halaman login.
    }
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar desktop: 260px (bagian 12) */}
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-secondary lg:flex">
        <SidebarContent role={role} pathname={pathname} />
      </aside>

      {/* Drawer mobile dengan backdrop blur (bagian 8) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Menu navigasi {meta.brandTagline}</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarContent
              role={role}
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:px-8">
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
                  className="flex items-center gap-2 rounded-field p-1 pr-2 transition-colors duration-150 ease-out hover:bg-hover"
                >
                  <Avatar size="sm">
                    <AvatarFallback>{meta.user.inisial}</AvatarFallback>
                  </Avatar>
                  <span className="hidden flex-col items-start md:flex">
                    <span className="text-[13px] font-medium leading-tight text-ink">
                      {meta.user.nama}
                    </span>
                    <span className="text-[11px] text-ink-muted">{meta.roleLabel}</span>
                  </span>
                  <ChevronDown className="size-4 text-ink-subtle" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Masuk sebagai</DropdownMenuLabel>
                <div className="px-3 pb-1">
                  <p className="truncate text-sm font-medium text-ink">{meta.user.nama}</p>
                  <p className="truncate text-xs text-ink-muted">{meta.user.email}</p>
                </div>
                <div className="px-3 pb-2">
                  <Badge variant="accent">{meta.roleLabel}</Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCog />
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="danger" onSelect={handleKeluar}>
                  <LogOut />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content: max 1280px centered (bagian 12) */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
