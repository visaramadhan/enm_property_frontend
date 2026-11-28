"use client";

import * as React from "react";
import {
  Languages,
  Loader2,
  Monitor,
  Pencil,
  RotateCcw,
  Save,
  Smartphone,
  X,
} from "lucide-react";

import { useVisualEditor, type BahasaEditor } from "@/components/editor/visual-editor-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Bilah mengambang editor visual (Live Edit Mode).
 *
 * Menyediakan kendali utama penyuntingan di atas halaman publik:
 * - pemilih bahasa halaman (ID/EN) yang menentukan kolom CMS yang disunting;
 * - pratinjau viewport Desktop vs Seluler (390px);
 * - indikator "Belum disimpan";
 * - tombol Reset dan "Simpan & Publikasikan".
 *
 * Saat mode edit tidak aktif, komponen ini menampilkan tombol kecil "Edit
 * Landing" (hanya untuk admin/superadmin) untuk membuka editor.
 */

/** Tombol pilihan berulang (bahasa & viewport) dengan gaya seragam. */
function TombolPilihan({
  aktif,
  onClick,
  children,
  judul,
}: {
  aktif: boolean;
  onClick: () => void;
  children: React.ReactNode;
  judul: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      title={judul}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors",
        aktif
          ? "bg-white text-ink shadow-sm"
          : "text-white/75 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function EditorFloatingBar() {
  const editor = useVisualEditor();

  /* Gesekan editor hanya tampil bagi admin/superadmin. */
  if (!editor.dapatMengedit) return null;

  if (!editor.modeEdit) {
    return (
      <button
        type="button"
        onClick={editor.bukaEditor}
        disabled={!editor.siap}
        className={cn(
          "fixed right-4 bottom-4 z-70 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg transition",
          "hover:brightness-[.94] focus-visible:ring-2 focus-visible:ring-primary-foreground/60 focus-visible:outline-none",
          !editor.siap && "cursor-wait opacity-70",
        )}
      >
        {editor.siap ? (
          <Pencil className="size-4" aria-hidden="true" />
        ) : (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {editor.siap ? "Edit Landing" : "Memuat editor…"}
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-70 flex justify-center px-3 pb-3">
      <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 rounded-xl bg-ink/95 px-3 py-2.5 text-white shadow-2xl backdrop-blur">
        {/* Pemilih bahasa halaman */}
        <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-0.5">
          <span className="pl-2 text-white/60" title="Bahasa halaman">
            <Languages className="size-4" aria-hidden="true" />
          </span>
          {(["id", "en"] as BahasaEditor[]).map((kode) => (
            <TombolPilihan
              key={kode}
              aktif={editor.bahasa === kode}
              onClick={() => editor.ubahBahasa(kode)}
              judul={kode === "id" ? "Sunting Bahasa Indonesia" : "Edit English"}
            >
              {kode.toUpperCase()}
            </TombolPilihan>
          ))}
        </div>

        {/* Pratinjau viewport */}
        <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-0.5">
          <TombolPilihan
            aktif={!editor.seluler}
            onClick={() => editor.ubahSeluler(false)}
            judul="Pratinjau desktop"
          >
            <Monitor className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Desktop</span>
          </TombolPilihan>
          <TombolPilihan
            aktif={editor.seluler}
            onClick={() => editor.ubahSeluler(true)}
            judul="Pratinjau seluler (390px)"
          >
            <Smartphone className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">390px</span>
          </TombolPilihan>
        </div>

        {editor.belumDisimpan ? (
          <span className="inline-flex h-8 items-center rounded-md bg-warning/20 px-2.5 text-xs font-semibold text-warning">
            Belum disimpan
          </span>
        ) : (
          <span className="hidden text-xs text-white/60 sm:inline">Semua perubahan tersimpan</span>
        )}

        <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={editor.reset}
          disabled={editor.menyimpan || !editor.belumDisimpan}
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </Button>

        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={() => void editor.simpan()}
          disabled={editor.menyimpan}
        >
          {editor.menyimpan ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {editor.menyimpan ? "Menyimpan…" : "Simpan & Publikasikan"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={editor.tutupEditor}
          aria-label="Tutup editor"
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
