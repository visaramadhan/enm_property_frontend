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
 * akun Firebase yang masih aktif. Bila keduanya tidak ada, permintaan dikirim
 * tanpa header `Authorization` sehingga backend menjawab 401 dan penjaga rute
 * mengalihkan pengguna ke halaman masuk.
 */
async function ambilToken(): Promise<string | null> {
  const tokenDemo = tokenAkunDummy();
  if (tokenDemo) return tokenDemo;

  try {
    const [{ getFirebaseAuth }, { isFirebaseConfigured }] = await Promise.all([
      import("@/lib/firebase/client"),
      import("@/lib/firebase/client"),
    ]);
    if (isFirebaseConfigured) {
      const pengguna = getFirebaseAuth().currentUser;
      if (pengguna) return await pengguna.getIdToken();
    }
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
}

async function minta(path: string, options: RequestOptions = {}): Promise<Response> {
  const { body, publik, headers, ...rest } = options;
  const akhirHeaders = new Headers(headers);

  if (!publik) {
    const token = await ambilToken();
    if (token) akhirHeaders.set("Authorization", `Bearer ${token}`);
  }

  let akhirBody: BodyInit | undefined;
  if (body instanceof FormData) {
    akhirBody = body;
  } else if (body !== undefined) {
    akhirHeaders.set("Content-Type", "application/json");
    akhirBody = JSON.stringify(body);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: akhirHeaders,
    body: akhirBody,
    cache: "no-store",
  });
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

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const respon = await minta(path, { method: "POST", body });
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
