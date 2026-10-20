"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
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
