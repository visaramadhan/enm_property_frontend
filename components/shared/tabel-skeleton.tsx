import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

/** Baris kerangka tabel saat data sedang dimuat. */
export function TabelSkeleton({ baris = 5, kolom = 4 }: { baris?: number; kolom?: number }) {
  return (
    <>
      {Array.from({ length: baris }).map((_, indeksBaris) => (
        <TableRow key={indeksBaris} className="hover:bg-transparent">
          {Array.from({ length: kolom }).map((__, indeksKolom) => (
            <TableCell key={indeksKolom}>
              <Skeleton className="h-4 w-full max-w-[160px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
