import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function MitraLayout({ children }: LayoutProps<"/mitra">) {
  return <DashboardShell role="mitra">{children}</DashboardShell>;
}
