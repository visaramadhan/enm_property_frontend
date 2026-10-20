/**
 * Type declaration untuk Midtrans Snap (snap.js).
 * Snap dimuat dari CDN, bukan dari npm, lihat `lib/midtrans.ts`.
 */
export {};

declare global {
  interface SnapResult {
    order_id: string;
    transaction_id?: string;
    transaction_status: string;
    payment_type?: string;
    gross_amount?: string;
    status_code?: string;
    status_message?: string;
    fraud_status?: string;
    [key: string]: unknown;
  }

  interface SnapCallbacks {
    onSuccess?: (result: SnapResult) => void;
    onPending?: (result: SnapResult) => void;
    onError?: (result: SnapResult) => void;
    onClose?: () => void;
  }

  interface SnapOptions extends SnapCallbacks {
    embedId?: string;
    language?: "id" | "en";
  }

  interface Snap {
    pay: (token: string, options?: SnapOptions) => void;
    embed: (token: string, options: SnapOptions & { embedId: string }) => void;
    hide: () => void;
  }

  interface Window {
    snap?: Snap;
  }
}
