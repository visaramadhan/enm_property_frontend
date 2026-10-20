const SNAP_SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/snap.js";
const SNAP_PRODUCTION_URL = "https://app.midtrans.com/snap/snap.js";

let snapPromise: Promise<Snap> | null = null;

function snapScriptUrl() {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
  const isProduction = !clientKey.startsWith("SB-");
  return isProduction ? SNAP_PRODUCTION_URL : SNAP_SANDBOX_URL;
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
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

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
 */
export async function bukaSnap(token: string, callbacks: SnapCallbacks = {}) {
  const snap = await loadSnap();
  snap.pay(token, { language: "id", ...callbacks });
}
