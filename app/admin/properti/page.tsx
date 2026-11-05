import type { Metadata } from "next";

import { KatalogPropertiAdmin } from "@/components/admin/katalog-properti";

export const metadata: Metadata = {
  title: "Katalog Properti",
  description: "Pantau dan moderasi seluruh properti yang terdaftar di platform.",
};

export default function AdminPropertiPage() {
  return <KatalogPropertiAdmin />;
}
