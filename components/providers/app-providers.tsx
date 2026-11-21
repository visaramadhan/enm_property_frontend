"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { BahasaProvider } from "@/components/providers/bahasa-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            /* Percobaan ulang GET ditangani terpusat di klien API
               (`lib/api/client.ts`): hanya galat jaringan/timeout dan status 5xx
               sementara (502/503/504) yang diulang, sedangkan 4xx tidak pernah
               diulang. Menyetel retry di sini akan menggandakan percobaan. */
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Bahasa dipasang di akar agar autentikasi, checkout, dan dashboard mitra
          memakai preferensi bahasa yang sama tanpa penyedia tambahan per rute. */}
      <BahasaProvider>{children}</BahasaProvider>
      {/* Bagian 10 - Toast: border kiri 4px sesuai semantik warna */}
      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          classNames: {
            toast: "rounded-card",
            success: "border-l-4! border-l-success!",
            error: "border-l-4! border-l-danger!",
            warning: "border-l-4! border-l-warning!",
            info: "border-l-4! border-l-info!",
          },
        }}
      />
    </QueryClientProvider>
  );
}
