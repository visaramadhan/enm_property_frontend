import type { Metadata } from "next";

import { KatalogPropertiAdmin } from "@/components/admin/katalog-properti";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman(
    "Katalog Properti",
    "Pantau dan moderasi seluruh properti yang terdaftar di platform.",
  );
}

export default function AdminPropertiPage() {
  return (
    <>
      <KatalogPropertiAdmin />
    </>
  );
}
