import type { Bahasa } from "@/lib/bahasa";

const SNAP_SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/snap.js";
const SNAP_PRODUCTION_URL = "https://app.midtrans.com/snap/snap.js";

/**
 * Prefiks client key yang menandakan lingkungan non-produksi.
 *
 * `SB-` adalah prefiks sandbox Midtrans standar. Kredensial proyek ini
 * berawalan `VT-`, namun sudah diverifikasi diterima oleh API produksi
 * (`api.midtrans.com`) dan ditolak sandbox, sehingga TIDAK lagi diperlakukan
 * sebagai sandbox — snap.js yang dimuat mengikuti lingkungan produksi.
 */
const PREFIKS_NON_PRODUKSI = ["SB-"];

let snapPromise: Promise<Snap> | null = null;

/** Client key Midtrans dari variabel lingkungan publik (string kosong bila belum diisi). */
export function snapClientKey(): string {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

/** URL snap.js sesuai lingkungan (sandbox/produksi) berdasarkan prefiks client key. */
export function snapScriptUrl(): string {
  const clientKey = snapClientKey();
  const nonProduksi = PREFIKS_NON_PRODUKSI.some((prefiks) => clientKey.startsWith(prefiks));
  return nonProduksi ? SNAP_SANDBOX_URL : SNAP_PRODUCTION_URL;
}

/**
 * Muat snap.js dari CDN dan kembalikan objek `window.snap`.
 * Pemanggilan berulang memakai promise yang sama (script hanya dimuat sekali).
 */
export function loadSnap(): Promise<Snap> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Midtrans Snap hanya tersedia di browser."));
  }

  if (window.snap) return Promise.resolve(window.snap);
  if (snapPromise) return snapPromise;

  snapPromise = new Promise<Snap>((resolve, reject) => {
    const clientKey = snapClientKey();

    if (!clientKey) {
      snapPromise = null;
      reject(new Error("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum dikonfigurasi."));
      return;
    }

    const script = document.createElement("script");
    script.src = snapScriptUrl();
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => {
      if (window.snap) resolve(window.snap);
      else {
        snapPromise = null;
        reject(new Error("snap.js termuat tetapi objek Snap tidak tersedia."));
      }
    };
    script.onerror = () => {
      snapPromise = null;
      script.remove();
      reject(new Error("Gagal memuat snap.js dari Midtrans."));
    };

    document.body.appendChild(script);
  });

  return snapPromise;
}

/**
 * Buka popup pembayaran Midtrans Snap memakai Snap Token dari backend.
 *
 * `bahasa` mengikuti pilihan bahasa aplikasi sehingga teks di dalam popup Snap
 * (tombol dan instruksi pembayaran) ikut berbahasa Inggris saat pengguna
 * memilih English.
 */
export async function bukaSnap(token: string, callbacks: SnapCallbacks = {}, bahasa: Bahasa = "id") {
  const snap = await loadSnap();
  snap.pay(token, { language: bahasa, ...callbacks });
}

/**
 * Tutup popup Snap yang sedang terbuka.
 *
 * Dipanggil setelah pembayaran dilaporkan berhasil agar jendela pembayaran
 * tidak menghalangi halaman; aman dipanggil walau popup sudah tertutup atau
 * snap.js belum termuat.
 */
export function tutupSnap() {
  if (typeof window !== "undefined" && window.snap) window.snap.hide();
}
