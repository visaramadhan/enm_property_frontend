"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { MenuAkun } from "@/components/layout/menu-akun";
import { LogoHeader } from "@/components/shared/logo-situs";
import { Button } from "@/components/ui/button";
import { useProfilSaya } from "@/lib/api/hooks";
import { useSudahTerpasang } from "@/lib/hooks/use-sudah-terpasang";
import { COOKIE_BAHASA, kamus, RUTE, type Bahasa } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";

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
 * Menyimpan pilihan bahasa pengunjung pada cookie.
 *
 * Rute tiap bahasa sudah eksplisit (`/` dan `/en`), cookie ini hanya mengingat
 * preferensi agar pengunjung yang kembali ke akar situs tetap mendapat versi
 * bahasa pilihannya pada kunjungan berikutnya.
 */
function simpanBahasa(bahasa: Bahasa) {
  document.cookie = `${COOKIE_BAHASA}=${bahasa}; path=/; max-age=31536000; samesite=lax`;
}

/** Sakelar bahasa ID/EN berbentuk tautan agar tetap dapat dirayapi mesin pencari. */
function ToggleBahasa({ bahasa, className }: { bahasa: Bahasa; className?: string }) {
  const k = kamus(bahasa);

  return (
    <div
      className={cn("inline-flex items-center rounded-full border border-line p-0.5", className)}
      role="group"
      aria-label={k.header.gantiBahasa}
    >
      {(["id", "en"] as const).map((target) => (
        <Link
          key={target}
          href={RUTE[target]}
          aria-current={bahasa === target ? "true" : undefined}
          onClick={() => simpanBahasa(target)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
            bahasa === target
              ? "bg-primary text-primary-foreground"
              : "text-secondary hover:text-primary",
          )}
        >
          {k.header.labelBahasa[target]}
        </Link>
      ))}
    </div>
  );
}

/**
 * Kepala halaman landing: identitas brand, menu jangkar antar-bagian, sakelar
 * bahasa, dan aksi utama (pasang properti / masuk) berikut menu ringkas untuk
 * layar kecil.
 */
export function HeaderLanding({ bahasa = "id" }: { bahasa?: Bahasa }) {
  const [terbuka, setTerbuka] = React.useState(false);
  const [bagianAktif, setBagianAktif] = React.useState("");
  const profil = useProfilSaya();
  const sudahTerpasang = useSudahTerpasang();
  const k = kamus(bahasa);

  /* Tautan pendaftaran mitra hanya relevan bagi pengunjung yang belum terdaftar
     sebagai mitra. Sesi baru dibaca setelah komponen terpasang sehingga render
     pertama klien tetap sama dengan HTML hasil prerender. */
  const terdaftarMitra = Boolean(
    sudahTerpasang && (profil.data?.partner || profil.data?.role === "mitra"),
  );

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
        <LogoHeader
          label={k.footer.ariaBrand}
          className="gap-2.5"
          kelasMark="size-[30px] rounded-lg bg-primary text-[12px] font-bold text-primary-foreground"
          kelasNama="text-base font-bold"
        />

        <nav className="ml-auto hidden gap-7 lg:flex" aria-label={k.header.navigasiUtama}>
          {k.header.menu.map((item) => (
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

        <div className="ml-auto hidden items-center gap-2.5 lg:flex">
          <ToggleBahasa bahasa={bahasa} />
          {!terdaftarMitra ? (
            <Button asChild size="sm">
              <Link href="/daftar-mitra">{k.header.daftarMitra}</Link>
            </Button>
          ) : null}
          <MenuAkun />
        </div>

        <button
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-lg border border-line text-secondary lg:hidden"
          aria-label={terbuka ? k.header.tutupMenu : k.header.bukaMenu}
          aria-expanded={terbuka}
          aria-controls="menu-landing"
          onClick={() => setTerbuka((sebelumnya) => !sebelumnya)}
        >
          {terbuka ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {terbuka ? (
        <div id="menu-landing" className="border-t border-line px-4 pt-3 pb-4 lg:hidden">
          <nav className="flex flex-col gap-3.5" aria-label={k.header.navigasiUtamaKecil}>
            {k.header.menu.map((item) => (
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
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <ToggleBahasa bahasa={bahasa} />
            {!terdaftarMitra ? (
              <Button asChild size="sm" className="flex-1">
                <Link href="/daftar-mitra" onClick={tutupMenu}>
                  {k.header.daftarMitra}
                </Link>
              </Button>
            ) : null}
            <MenuAkun className="flex-1" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
