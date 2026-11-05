import { Badge } from "@/components/ui/badge";
import { labelStatus, varianStatus, type JenisStatus } from "@/lib/enum";

/**
 * Badge status tunggal untuk seluruh tabel.
 *
 * Label diambil dari backend bila tersedia (`status_label`), sehingga tidak
 * perlu duplikasi peta label di setiap halaman.
 */
export function StatusBadge({
  jenis,
  status,
  label,
}: {
  jenis: JenisStatus;
  status: string;
  label?: string;
}) {
  return <Badge variant={varianStatus(jenis, status)}>{label ?? labelStatus(status)}</Badge>;
}
