"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { salinDenganToast } from "@/lib/papan-klip";

type PropsTombolSalin = Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> & {
  /** Teks yang akan disalin ke papan klip. */
  teks: string;
  /** Label tombol; kosongkan untuk tombol ikon saja. */
  label?: string;
  /** Judul toast setelah berhasil menyalin. */
  judulSukses?: string;
};

/**
 * Tombol "Salin" serbaguna.
 *
 * Dipakai bersama oleh halaman pembayaran (nomor VA/kode QRIS) dan katalog
 * paket admin (tautan checkout) sehingga perilaku salin, umpan balik ikon, dan
 * notifikasinya seragam tanpa ditulis ulang di tiap halaman (DRY).
 */
export function TombolSalin({
  teks,
  label = "Salin",
  judulSukses = "Tersalin ke papan klip",
  ...props
}: PropsTombolSalin) {
  const [tersalin, setTersalin] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function salin() {
    const berhasil = await salinDenganToast(teks, judulSukses);
    if (!berhasil) return;
    setTersalin(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTersalin(false), 2000);
  }

  return (
    <Button type="button" onClick={() => void salin()} {...props}>
      {tersalin ? <Check /> : <Copy />}
      {label ? <span>{tersalin ? "Tersalin" : label}</span> : null}
    </Button>
  );
}
