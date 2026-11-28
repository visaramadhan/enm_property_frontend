"use client";

import * as React from "react";
import Image from "next/image";
import { ImageUp } from "lucide-react";

import { useVisualEditor } from "@/components/editor/visual-editor-context";
import { cn } from "@/lib/utils";

/**
 * Satu slot gambar kolase hero yang dapat diganti langsung.
 *
 * Di luar mode edit hanya menampilkan gambar (atau blok netral bila belum ada).
 * Saat mode edit, slot menampilkan tombol "Ganti / Upload Foto" ketika disorot;
 * berkas yang dipilih langsung dipratinjau lewat object URL lalu diunggah ke
 * backend CMS (`unggahGambarHero`).
 */
interface EditableImageProps {
  /** Indeks slot pada daftar gambar hero. */
  indeks: number;
  /** URL gambar; kosong menampilkan blok netral. */
  sumber?: string;
  alt: string;
  /** Kelas posisi/ukuran slot (mis. `top-0 right-0 h-[210px]`). */
  kelas: string;
  /** Gambar utama dimuat lebih awal (eager + prioritas tinggi). */
  utama?: boolean;
}

export function EditableImage({ indeks, sumber, alt, kelas, utama = false }: EditableImageProps) {
  const editor = useVisualEditor();
  const masukanRef = React.useRef<HTMLInputElement | null>(null);
  const [mengunggah, setMengunggah] = React.useState(false);

  /* Saat mengedit, gambar dibaca dari salinan kerja `hero_images` sehingga slot
     yang diunggah persis sesuai indeksnya; di luar mode edit memakai gambar
     hasil penggabungan server (mis. fallback foto properti). */
  const dariKonten = editor.modeEdit ? editor.nilaiGambarHero()[indeks] : undefined;
  const gambar = dariKonten ?? sumber;

  async function pilihBerkas(peristiwa: React.ChangeEvent<HTMLInputElement>) {
    const berkas = peristiwa.target.files?.[0];
    peristiwa.target.value = "";
    if (!berkas) return;
    setMengunggah(true);
    try {
      await editor.unggahGambarHero(indeks, berkas);
    } finally {
      setMengunggah(false);
    }
  }

  return (
    <div className={cn("group absolute overflow-hidden rounded-panel bg-divider shadow-md", kelas)}>
      {gambar ? (
        <Image
          src={gambar}
          alt={alt}
          fill
          sizes="(max-width: 960px) 80vw, 40vw"
          className="object-cover"
          loading={utama ? "eager" : "lazy"}
          fetchPriority={utama ? "high" : "auto"}
        />
      ) : null}

      {editor.modeEdit ? (
        <>
          <button
            type="button"
            onClick={() => masukanRef.current?.click()}
            className={cn(
              "absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 bg-ink/55 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
              mengunggah && "opacity-100",
            )}
          >
            <ImageUp className="size-5" aria-hidden="true" />
            {mengunggah ? "Mengunggah..." : "Ganti / Upload Foto"}
          </button>
          <input
            ref={masukanRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pilihBerkas}
          />
        </>
      ) : null}
    </div>
  );
}
