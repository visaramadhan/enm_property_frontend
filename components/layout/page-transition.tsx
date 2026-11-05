"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Transisi masuk antar halaman.
 *
 * `key` pada pembungkus dipakai agar animasi diputar ulang setiap kali rute
 * berubah, memberi kesan perpindahan halaman yang halus. Animasi otomatis
 * dimatikan bila pengguna mengaktifkan "kurangi gerakan".
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
