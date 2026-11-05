"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";

import { toastGagal, toastSukses } from "@/lib/toast";

type KunciInvalidasi = readonly (readonly unknown[])[];

interface OpsiMutasi<TData, TVariables> {
  /** Fungsi pemanggil API. */
  mutasi: (variabel: TVariables) => Promise<TData>;
  /** Prefiks kunci cache yang dibatalkan setelah berhasil. */
  kunciInvalidasi?: KunciInvalidasi;
  /** Judul toast sukses; lewati dengan `null` untuk tanpa notifikasi. */
  pesanSukses?: string | ((data: TData, variabel: TVariables) => string) | null;
  /** Judul toast gagal, contoh: "Gagal menyimpan properti". */
  pesanGagal?: string;
  onSukses?: (data: TData, variabel: TVariables) => void;
  onGagal?: (error: unknown) => void;
}

/**
 * Pembungkus `useMutation` yang menyatukan tiga hal berulang di seluruh
 * halaman: notifikasi toast, pembatalan cache, dan callback hasil.
 */
export function useMutasi<TData, TVariables>(
  opsi: OpsiMutasi<TData, TVariables>,
): UseMutationResult<TData, unknown, TVariables> {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVariables>({
    mutationFn: opsi.mutasi,
    onSuccess: (data, variabel) => {
      if (opsi.kunciInvalidasi) {
        for (const kunciCache of opsi.kunciInvalidasi) {
          void queryClient.invalidateQueries({ queryKey: kunciCache });
        }
      }
      const judul =
        typeof opsi.pesanSukses === "function"
          ? opsi.pesanSukses(data, variabel)
          : opsi.pesanSukses;
      if (judul) toastSukses(judul);
      opsi.onSukses?.(data, variabel);
    },
    onError: (error) => {
      toastGagal(opsi.pesanGagal ?? "Gagal memproses permintaan", error);
      opsi.onGagal?.(error);
    },
  });
}
