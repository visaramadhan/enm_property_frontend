import { Suspense } from "react";
import { connection } from "next/server";

/**
 * Penanda bahwa sebuah halaman memakai data runtime sehingga dirender dinamis.
 *
 * Dipakai bersama `metadataHalaman()` (`lib/metadata-halaman.ts`) yang membaca
 * cookie bahasa. Dengan Cache Components, metadata yang bergantung pada data
 * runtime memblokir prerender; pola resmi Next.js adalah menambahkan penanda
 * `await connection()` di dalam `<Suspense>` sehingga sisa halaman tetap dapat
 * diprerender sementara metadata dirender dinamis.
 */
async function PenandaRuntime() {
  await connection();
  return null;
}

export function MetadataDinamis() {
  return (
    <Suspense fallback={null}>
      <PenandaRuntime />
    </Suspense>
  );
}
