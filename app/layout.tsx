import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ENM Property - Platform Listing Properti",
    template: "%s | ENM Property",
  },
  description:
    "Platform listing properti: katalog properti, kemitraan, dan langganan paket untuk agen dan pengelola properti.",
};

/**
 * `suppressHydrationWarning` dipasang pada `<html>` karena sebagian ekstensi
 * peramban menyisipkan atribut sendiri (mis. `data-qb-installed`) setelah HTML
 * server diterima, sehingga React melaporkan hydration mismatch untuk perubahan
 * yang bukan berasal dari aplikasi.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
