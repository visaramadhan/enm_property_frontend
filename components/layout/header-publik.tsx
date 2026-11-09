import Link from "next/link";

/**
 * Kepala halaman ringan untuk area publik (katalog paket & checkout).
 *
 * Dipakai bersama oleh tata letak `/paket` dan `/checkout` agar identitas brand
 * dan tinggi bilah atas seragam tanpa menggandakan penanda (DRY).
 */
export function HeaderPublik({ tagline }: { tagline: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-[66px] items-center border-b border-line bg-surface/96 px-4 backdrop-blur lg:px-8">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-[12px] font-extrabold text-secondary-foreground">
          ENM
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-extrabold tracking-tight text-ink">ENM Property</span>
          <span className="text-[10px] font-semibold tracking-[0.145em] text-ink-subtle uppercase">
            {tagline}
          </span>
        </span>
      </Link>
    </header>
  );
}
