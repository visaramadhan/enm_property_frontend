"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Tautan menu utama; `id` dipakai penanda bagian yang sedang dilihat. */
const MENU = [
  { id: "properti", href: "#properti", label: "Properti" },
  { id: "paket", href: "#paket", label: "Paket Mitra" },
  { id: "panduan", href: "#panduan", label: "Panduan Kemitraan" },
] as const;

/** Urutan bagian halaman untuk penanda menu aktif. */
const URUTAN_BAGIAN = ["beranda", "properti", "paket", "panduan", "faq", "kemitraan"] as const;

/**
 * Pemetaan bagian → item menu. Bagian yang tidak punya menu sendiri (beranda,
 * faq, kemitraan) diarahkan ke menu terdekat agar tidak ada item yang
 * kehilangan penanda.
 */
const PETA_BAGIAN: Record<string, string> = {
  beranda: "",
  faq: "panduan",
  kemitraan: "panduan",
};

/**
 * Kepala halaman landing: identitas brand, menu jangkar antar-bagian, dan aksi
 * utama (pasang properti / masuk) berikut menu ringkas untuk layar kecil.
 */
export function HeaderLanding() {
  const [terbuka, setTerbuka] = React.useState(false);
  const [bagianAktif, setBagianAktif] = React.useState("");

  React.useEffect(() => {
    function periksa() {
      const batas = window.scrollY + 120;
      let aktif = "";
      for (const bagian of URUTAN_BAGIAN) {
        const elemen = document.getElementById(bagian);
        if (elemen && elemen.getBoundingClientRect().top + window.scrollY <= batas) aktif = bagian;
      }
      setBagianAktif(PETA_BAGIAN[aktif] ?? aktif);
    }

    periksa();
    window.addEventListener("scroll", periksa, { passive: true });
    return () => window.removeEventListener("scroll", periksa);
  }, []);

  function tutupMenu() {
    setTerbuka(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/97 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center gap-7 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ENM Property beranda">
          <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground">
            EN
          </span>
          <span className="text-base font-bold tracking-tight text-ink">ENM PROPERTY</span>
        </Link>

        <nav className="ml-auto hidden gap-7 lg:flex" aria-label="Navigasi utama">
          {MENU.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "text-[13px] font-medium text-secondary transition-colors hover:text-primary",
                bagianAktif === item.id && "text-primary",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden gap-2.5 lg:flex">
          <Button asChild size="sm">
            <Link href="/register?role=mitra">Pasang Properti</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Masuk</Link>
          </Button>
        </div>

        <button
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-lg border border-line text-secondary lg:hidden"
          aria-label={terbuka ? "Tutup menu" : "Buka menu"}
          aria-expanded={terbuka}
          aria-controls="menu-landing"
          onClick={() => setTerbuka((sebelumnya) => !sebelumnya)}
        >
          {terbuka ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {terbuka ? (
        <div id="menu-landing" className="border-t border-line px-4 pt-3 pb-4 lg:hidden">
          <nav className="flex flex-col gap-3.5" aria-label="Navigasi utama layar kecil">
            {MENU.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={tutupMenu}
                className="text-sm font-medium text-secondary"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex gap-2.5">
            <Button asChild size="sm" className="flex-1">
              <Link href="/register?role=mitra" onClick={tutupMenu}>
                Pasang Properti
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="flex-1">
              <Link href="/login" onClick={tutupMenu}>
                Masuk
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
