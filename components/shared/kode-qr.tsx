"use client";

import * as React from "react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { useSudahTerpasang } from "@/lib/hooks/use-sudah-terpasang";

/**
 * Menampilkan kode QR dari sebuah string, dibuat di sisi klien.
 *
 * Dipakai sebagai cadangan ketika gateway tidak menyediakan URL gambar QR
 * (mis. mode simulasi Midtrans yang hanya mengembalikan `qr_string`). Kode
 * dibangkitkan lokal memakai pustaka `qrcode` sehingga payload pembayaran tidak
 * pernah dikirim ke layanan pihak ketiga (menjaga privasi data transaksi).
 *
 * Render baru dijalankan setelah komponen terpasang (`useSudahTerpasang`) agar
 * HTML hasil prerender tidak berbeda dari render pertama klien (anti hydration
 * mismatch).
 */
export function KodeQr({
  nilai,
  kelas,
  ukuran = 512,
  onGambar,
}: {
  nilai: string;
  kelas?: string;
  ukuran?: number;
  /** Menerima data URL hasil pembangkitan, mis. untuk tombol unduh QR. */
  onGambar?: (gambar: string) => void;
}) {
  const { t } = useBahasa();
  const sudahTerpasang = useSudahTerpasang();
  const [gambar, setGambar] = React.useState("");

  /* Callback disimpan di ref agar identitas fungsi dari pemanggil (yang dapat
     berubah tiap render) tidak memicu pembangkitan ulang kode QR. */
  const simpanGambar = React.useRef(onGambar);
  React.useEffect(() => {
    simpanGambar.current = onGambar;
  }, [onGambar]);

  React.useEffect(() => {
    if (!sudahTerpasang || !nilai) return;

    let batal = false;
    void import("qrcode")
      .then((modul) =>
        modul.toDataURL(nilai, { width: ukuran, margin: 1, errorCorrectionLevel: "M" }),
      )
      .then((url) => {
        if (batal) return;
        setGambar(url);
        simpanGambar.current?.(url);
      })
      .catch(() => {
        // Bila pembangkitan QR gagal, biarkan pemanggil menampilkan placeholder.
      });

    return () => {
      batal = true;
    };
  }, [sudahTerpasang, nilai, ukuran]);

  if (!gambar) return null;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={gambar} alt={t("Kode QR pembayaran")} className={kelas} />
  );
}
