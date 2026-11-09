"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Bilah kemajuan tipis di atas halaman yang muncul segera setelah pengunjung
 * menekan tautan internal, lalu menghilang saat rute tujuan selesai dimuat.
 *
 * App Router tidak menyediakan keadaan "navigasi sedang berjalan" secara global
 * (hanya `useLinkStatus` per tautan), sehingga klik pada tautan dipantau di
 * tingkat dokumen. Ini memberi umpan balik instan pada setiap perpindahan
 * halaman tanpa harus memasang pemuat di masing-masing rute.
 *
 * Nilai `pathname` menjadi penanda selesai: begitu rute berubah, bilah
 * direset. Sebuah pengaman waktu (8 detik) memastikan bilah tidak "macet"
 * bila navigasi batal.
 */
export function IndikatorNavigasi() {
  const pathname = usePathname();
  const [aktif, setAktif] = React.useState(false);
  const [pathSebelumnya, setPathSebelumnya] = React.useState(pathname);
  const timerRef = React.useRef<number | null>(null);

  const bersihkan = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /* Rute berubah menandakan navigasi selesai; bilah direset saat render (pola
     resmi React "menyesuaikan state saat props berubah") agar tidak memanggil
     setState di dalam effect. */
  if (pathSebelumnya !== pathname) {
    setPathSebelumnya(pathname);
    setAktif(false);
  }

  React.useEffect(() => {
    bersihkan();
  }, [pathname, bersihkan]);

  React.useEffect(() => {
    function tanganiKlik(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const tautan = (event.target as Element | null)?.closest("a");
      if (!tautan) return;
      if (tautan.getAttribute("target") === "_blank" || tautan.hasAttribute("download")) return;
      if ((tautan.getAttribute("rel") ?? "").includes("external")) return;

      const href = tautan.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let tujuan: URL;
      try {
        tujuan = new URL(tautan.href, window.location.href);
      } catch {
        return;
      }
      if (tujuan.origin !== window.location.origin) return;
      if (
        tujuan.pathname === window.location.pathname &&
        tujuan.search === window.location.search
      ) {
        return;
      }

      setAktif(true);
      bersihkan();
      timerRef.current = window.setTimeout(() => {
        setAktif(false);
        timerRef.current = null;
      }, 8000);
    }

    document.addEventListener("click", tanganiKlik, true);
    return () => {
      document.removeEventListener("click", tanganiKlik, true);
      bersihkan();
    };
  }, [bersihkan]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
    >
      <div
        className={cn(
          "h-full bg-primary shadow-[0_0_6px_var(--color-primary)]",
          aktif ? "w-[90%] opacity-100 duration-[600ms]" : "w-0 opacity-0 duration-200",
          "transition-all ease-out motion-reduce:transition-none",
        )}
      />
    </div>
  );
}
