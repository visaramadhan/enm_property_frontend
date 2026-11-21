/**
 * Klien HTTP tunggal untuk seluruh pemanggilan backend ENMProperty.
 *
 * Tanggung jawab berkas ini hanya tiga: menyisipkan token Firebase, membuka
 * amplop respons `{success,data,meta}`, dan menormalkan kegagalan menjadi
 * `ApiError`. Seluruh halaman memakai klien ini agar tidak ada duplikasi
 * penanganan `fetch` di setiap modul.
 */

import { tokenAkunDummy } from "@/lib/auth/akun-dummy";
import type { ErrorBody, Meta, Paginated, SuccessBody } from "@/types/api";

/** Basis URL API. Dapat ditimpa melalui `NEXT_PUBLIC_API_URL`. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"
).replace(/\/$/, "");

/** Batas waktu bawaan satu permintaan data (ms). */
const TIMEOUT_DEFAULT_MS = 20_000;

/** Batas waktu khusus unggah berkas (ms); lebih panjang karena payload besar. */
export const UPLOAD_TIMEOUT_MS = 60_000;

/** Jeda dasar antar percobaan ulang GET (ms); digandakan tiap percobaan. */
const JEDA_DASAR_MS = 500;

/** Jumlah percobaan ulang maksimum untuk GET (di luar percobaan pertama). */
const MAKS_COBA_ULANG_GET = 2;

/** Status HTTP sementara yang layak dicoba ulang (server sibuk/down sementara). */
const STATUS_SEMENTARA = new Set([502, 503, 504]);

type QueryValue = string | number | boolean | undefined | null;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Sesi tidak valid/kedaluwarsa sehingga pengguna perlu masuk ulang. */
  get butuhMasukUlang() {
    return this.status === 401;
  }
}

/**
 * Menilai apakah sebuah galat layak dicoba ulang.
 *
 * Hanya galat jaringan/timeout dan status 5xx sementara (502/503/504) yang
 * layak diulang. Galat 4xx (400/401/403/404) sengaja tidak pernah diulang
 * karena pengulangan tidak akan mengubah hasil dan hanya membuang waktu.
 * Dipakai klien ini maupun lapisan TanStack Query agar kebijakan retry seragam.
 */
export function layakDicobaLagi(error: unknown): boolean {
  if (error instanceof ApiError) {
    return (
      error.code === "network_error" ||
      error.code === "timeout" ||
      STATUS_SEMENTARA.has(error.status)
    );
  }
  return false;
}

/**
 * Membangun query string dari objek filter, melewati nilai kosong.
 *
 * Parameter bertipe `object` (bukan `Record<string, QueryValue>`) agar seluruh
 * DTO filter (`PropertyFilterQuery`, `ReportFilterQuery`, `AuditFilterQuery`,
 * dst.) dapat diteruskan langsung tanpa cast; nilainya sudah dibatasi kontrak
 * masing-masing DTO.
 */
export function buatQuery(params?: object): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [kunci, nilai] of Object.entries(params) as [string, QueryValue][]) {
    if (nilai === undefined || nilai === null || nilai === "") continue;
    search.set(kunci, String(nilai));
  }
  const hasil = search.toString();
  return hasil ? `?${hasil}` : "";
}

/**
 * Mengambil token otorisasi permintaan: token akun demo bila sesi demo aktif,
 * selain itu ID token Firebase pengguna yang sedang masuk.
 *
 * Sesi demo diutamakan agar pemilihan peran pada halaman masuk tidak tertimpa
 * akun Firebase yang masih aktif. Sebelum membaca pengguna Firebase, sesi yang
 * tersimpan dipulihkan dahulu (`authStateReady`) sehingga pemuatan ulang halaman
 * tidak mengirim permintaan tanpa token. Bila keduanya tidak ada, permintaan
 * dikirim tanpa header `Authorization` sehingga backend menjawab 401 dan penjaga
 * rute mengalihkan pengguna ke halaman masuk.
 */
async function ambilToken(paksaSegarkan = false): Promise<string | null> {
  const tokenDemo = tokenAkunDummy();
  if (tokenDemo) return tokenDemo;

  try {
    const { tungguSesiFirebase } = await import("@/lib/firebase/client");
    const auth = await tungguSesiFirebase();
    const pengguna = auth?.currentUser;
    if (pengguna) return await pengguna.getIdToken(paksaSegarkan);
  } catch {
    // Firebase belum siap; permintaan tetap dikirim tanpa token.
  }
  return null;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Body JSON; otomatis diserialisasi bila bukan FormData. */
  body?: unknown;
  /** Kirim tanpa header Authorization (endpoint publik). */
  publik?: boolean;
  /** Batas waktu permintaan (ms). Bawaan 20 detik, unggah berkas 60 detik. */
  timeoutMs?: number;
}

/** Menunda eksekusi selama `ms` milidetik (jeda antar percobaan ulang). */
function tunggu(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Membuat sinyal yang otomatis dibatalkan setelah `durasiMs` dan tetap
 * mengikuti pembatalan dari pemanggil (bila ada).
 *
 * `waktuHabis()` membedakan pembatalan karena batas waktu dari pembatalan oleh
 * pemanggil, sehingga galat yang ditampilkan ke pengguna tetap tepat.
 */
function sinyalDenganBatas(durasiMs: number, luar?: AbortSignal | null) {
  const kontrol = new AbortController();
  let habis = false;
  const timer = setTimeout(() => {
    habis = true;
    kontrol.abort();
  }, durasiMs);

  const alihkan = () => kontrol.abort();
  if (luar) {
    if (luar.aborted) kontrol.abort();
    else luar.addEventListener("abort", alihkan, { once: true });
  }

  return {
    signal: kontrol.signal,
    waktuHabis: () => habis,
    bersihkan: () => {
      clearTimeout(timer);
      luar?.removeEventListener("abort", alihkan);
    },
  };
}

/**
 * Menormalkan galat `fetch` (jaringan/timeout) menjadi `ApiError` dengan pesan
 * yang mudah dipahami. Status 0 dipakai karena permintaan tidak pernah sampai
 * ke server, sehingga penjaga rute tidak salah mengira ini galat autentikasi.
 */
function normalkanGalatJaringan(batasMs: number, waktuHabis: boolean): ApiError {
  if (waktuHabis) {
    return new ApiError(
      0,
      "timeout",
      `Server tidak merespons dalam ${Math.round(batasMs / 1000)} detik. Periksa koneksi lalu coba lagi.`,
    );
  }
  return new ApiError(
    0,
    "network_error",
    "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.",
  );
}

async function minta(path: string, options: RequestOptions = {}): Promise<Response> {
  const {
    body,
    publik,
    headers,
    method,
    timeoutMs,
    signal: sinyalLuar,
    ...rest
  } = options;
  const akhirHeaders = new Headers(headers);
  const metode = (method ?? "GET").toUpperCase();
  /* Percobaan ulang hanya untuk method baca (idempoten). POST/PUT/PATCH/DELETE
     tidak pernah diulang otomatis agar tidak menduplikasi efek samping
     (mis. membuat dua transaksi atau mengunggah berkas dua kali). */
  const bolehCobaLagi = metode === "GET" || metode === "HEAD";
  const batasMs = timeoutMs ?? TIMEOUT_DEFAULT_MS;

  let memakaiToken = false;
  if (!publik) {
    const token = await ambilToken();
    if (token) {
      akhirHeaders.set("Authorization", `Bearer ${token}`);
      memakaiToken = true;
    }
  }

  let akhirBody: BodyInit | undefined;
  if (body instanceof FormData) {
    /* Jangan set `Content-Type` manual: peramban wajib menuliskan
       `multipart/form-data` beserta `boundary`-nya sendiri. Header manual tanpa
       boundary membuat Chrome menolak/merusak permintaan unggah. */
    akhirBody = body;
  } else if (body !== undefined) {
    akhirHeaders.set("Content-Type", "application/json");
    akhirBody = JSON.stringify(body);
  }

  const percobaanMaks = bolehCobaLagi ? MAKS_COBA_ULANG_GET + 1 : 1;
  let galatTerakhir: unknown = null;

  for (let percobaan = 1; percobaan <= percobaanMaks; percobaan++) {
    const { signal, waktuHabis, bersihkan } = sinyalDenganBatas(batasMs, sinyalLuar);
    try {
      let respon = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        method: metode,
        headers: akhirHeaders,
        body: akhirBody,
        cache: "no-store",
        signal,
      });

      /* Token Firebase dapat kedaluwarsa saat tab dibiarkan terbuka lama;
         segarkan paksa sekali lalu ulangi permintaan alih-alih langsung
         memaksa pengguna masuk ulang. Sesi demo tidak dapat disegarkan. */
      if (respon.status === 401 && memakaiToken && !tokenAkunDummy()) {
        const tokenBaru = await ambilToken(true);
        if (tokenBaru) {
          akhirHeaders.set("Authorization", `Bearer ${tokenBaru}`);
          respon = await fetch(`${API_BASE_URL}${path}`, {
            ...rest,
            method: metode,
            headers: akhirHeaders,
            body: akhirBody,
            cache: "no-store",
            signal,
          });
        }
      }

      bersihkan();

      /* Status 5xx sementara (502/503/504) ditandakan server sibuk; beri jeda
         bertahap lalu ulangi selama masih ada jatah percobaan. */
      if (bolehCobaLagi && STATUS_SEMENTARA.has(respon.status) && percobaan < percobaanMaks) {
        await tunggu(JEDA_DASAR_MS * 2 ** (percobaan - 1));
        continue;
      }
      return respon;
    } catch (error) {
      bersihkan();
      galatTerakhir = error;

      // Pembatalan oleh pemanggil (mis. TanStack Query) diteruskan apa adanya.
      if (sinyalLuar?.aborted) throw error;

      // Galat jaringan/timeout diulang untuk GET selama masih ada jatah.
      if (bolehCobaLagi && percobaan < percobaanMaks) {
        await tunggu(JEDA_DASAR_MS * 2 ** (percobaan - 1));
        continue;
      }
      throw normalkanGalatJaringan(batasMs, waktuHabis());
    }
  }

  throw galatTerakhir ?? normalkanGalatJaringan(batasMs, false);
}

/** Membaca amplop respons dan mengembalikan `data` (beserta `meta` bila ada). */
async function bacaAmplop<T>(respon: Response): Promise<{ data: T; meta?: Meta }> {
  if (respon.status === 204) return { data: undefined as T };

  const teks = await respon.text();
  let parsed: unknown = undefined;
  if (teks) {
    try {
      parsed = JSON.parse(teks);
    } catch {
      if (respon.ok) {
        throw new ApiError(respon.status, "invalid_response", "Respons server tidak dapat dibaca");
      }
    }
  }

  if (respon.ok) {
    // Server membalas 200 tanpa body JSON (bukan 204). Ini menandakan respons
    // rusak/tidak lengkap; lempar galat jelas alih-alih mengembalikan undefined
    // yang akan memicu pesan samar "data is undefined" dari TanStack Query.
    if (parsed === undefined) {
      throw new ApiError(
        respon.status,
        "empty_response",
        "Respons server tidak memuat data",
      );
    }
    const body = parsed as SuccessBody<T>;
    return { data: body.data, meta: body.meta };
  }

  const gagal = parsed as ErrorBody | undefined;
  const kode = gagal?.error?.code ?? `http_${respon.status}`;
  const pesan = gagal?.error?.message ?? respon.statusText ?? "Permintaan gagal";
  throw new ApiError(respon.status, kode, pesan, gagal?.error?.details);
}

/** Meminta data tunggal (tanpa metadata paginasi). */
export async function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  const respon = await minta(path, { ...options, method: "GET" });
  return (await bacaAmplop<T>(respon)).data;
}

/** Meminta daftar berpaginasi sehingga `items` + `meta` ikut dikembalikan. */
export async function apiGetPaginated<T>(
  path: string,
  options?: RequestOptions,
): Promise<Paginated<T>> {
  const respon = await minta(path, { ...options, method: "GET" });
  const { data, meta } = await bacaAmplop<T[]>(respon);
  return {
    items: data ?? [],
    meta: meta ?? { page: 1, per_page: 20, total: 0, total_pages: 1 },
  };
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const respon = await minta(path, { ...options, method: "POST", body });
  return (await bacaAmplop<T>(respon)).data;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const respon = await minta(path, { method: "PUT", body });
  return (await bacaAmplop<T>(respon)).data;
}

/** PATCH dengan semantik sebagian (partial update). */
export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const respon = await minta(path, { method: "PATCH", body });
  return (await bacaAmplop<T>(respon)).data;
}

export async function apiDelete<T = void>(path: string, body?: unknown): Promise<T> {
  const respon = await minta(path, { method: "DELETE", body });
  return (await bacaAmplop<T>(respon)).data;
}

/** Mengunduh berkas (ekspor XLSX/PDF) sebagai Blob. */
export async function apiUnduh(path: string, options?: RequestOptions): Promise<Blob> {
  const respon = await minta(path, { ...options, method: "GET" });
  if (!respon.ok) {
    await bacaAmplop(respon);
    return new Blob();
  }
  return respon.blob();
}

/**
 * Mengubah `ApiError` menjadi pesan siap tampil di toast/alert.
 * Detail validasi per field dirapikan menjadi daftar pesan.
 */
export function pesanErrorApi(error: unknown): string {
  if (error instanceof ApiError) {
    const detail = rapikanDetail(error.details);
    return detail ? `${error.message}: ${detail}` : error.message;
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan yang tidak diketahui";
}

function rapikanDetail(details: unknown): string {
  if (!details) return "";
  if (typeof details === "string") return details;
  if (Array.isArray(details)) {
    return details
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join(", ");
  }
  if (typeof details === "object") {
    return Object.entries(details as Record<string, unknown>)
      .map(([field, pesan]) => `${field}: ${String(pesan)}`)
      .join(", ");
  }
  return String(details);
}
