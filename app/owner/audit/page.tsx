import type { Metadata } from "next";

import { AuditLog } from "@/components/shared/audit-log";

export const metadata: Metadata = {
  title: "Audit Log",
  description: "Jejak tindakan administratif pada platform.",
};

export default function OwnerAuditPage() {
  return <AuditLog />;
}
