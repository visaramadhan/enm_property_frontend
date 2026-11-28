"use client";

import * as React from "react";

import { EditorFloatingBar } from "@/components/editor/editor-floating-bar";
import { useVisualEditor, VisualEditorProvider } from "@/components/editor/visual-editor-context";
import type { Bahasa } from "@/lib/bahasa";
import { cn } from "@/lib/utils";

/**
 * Pembungkus editor visual untuk halaman landing publik.
 *
 * Halaman landing tetap dirender sebagai Server Component (teks utama ada di
 * HTML awal untuk SEO); komponen ini hanya menambahkan lapisan klien di atasnya:
 * - `VisualEditorProvider` menyediakan salinan kerja konten CMS, status mode
 *   edit, bahasa, dan aksi simpan/publikasi;
 * - `EditorShell` menyesuaikan lebar pratinjau (desktop / seluler 390px) dan
 *   ruang bawah agar konten tidak tertutup bilah mengambang;
 * - `EditorFloatingBar` menjadi kendali utama editor.
 *
 * Bagian yang teksnya berasal dari CMS disunting lewat `EditableText` /
 * `EditableImage`, sedangkan bagian yang datanya dari API (kartu properti,
 * kartu & tabel paket) hanya ditampilkan sebagai pratinjau dinamis.
 */
export function LandingPageEditor({
  bahasa,
  children,
}: {
  /** Bahasa rute halaman; menjadi bahasa awal yang disunting. */
  bahasa: Bahasa;
  children: React.ReactNode;
}) {
  return (
    <VisualEditorProvider bahasaHalaman={bahasa}>
      <EditorShell>{children}</EditorShell>
    </VisualEditorProvider>
  );
}

function EditorShell({ children }: { children: React.ReactNode }) {
  const editor = useVisualEditor();
  const menyempit = editor.modeEdit && editor.seluler;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        /* Ruang ekstra agar bilah editor tidak menutupi konten terbawah. */
        editor.modeEdit && "pb-28",
        /* Pratinjau seluler: halaman dipersempit ke 390px dan dipusatkan. */
        menyempit &&
          "mx-auto my-4 w-full max-w-[390px] overflow-hidden rounded-lg border border-line shadow-2xl",
      )}
    >
      {children}
      <EditorFloatingBar />
    </div>
  );
}
