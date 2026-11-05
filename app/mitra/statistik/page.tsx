import type { Metadata } from "next";

import { StatistikMitra } from "@/components/mitra/statistik-mitra";

export const metadata: Metadata = {
  title: "Statistik Properti",
  description: "Statistik performa listing dan interaksi katalog properti Anda.",
};

export default function MitraStatistikPage() {
  return <StatistikMitra />;
}
