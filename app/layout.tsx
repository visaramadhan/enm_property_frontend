import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

/** ID pengukuran GA4; bila kosong, skrip Analytics tidak dipasang. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
