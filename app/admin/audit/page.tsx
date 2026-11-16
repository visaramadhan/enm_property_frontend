import type { Metadata } from "next";

import { AuditLog } from "@/components/shared/audit-log";
import { metadataHalaman } from "@/lib/metadata-halaman";

export function generateMetadata(): Promise<Metadata> {
  return metadataHalaman("Audit Log", "Jejak tindakan administratif pada platform.");
}

export default function AdminAuditPage() {
  return (
    <>
      <AuditLog />
    </>
  );
}
