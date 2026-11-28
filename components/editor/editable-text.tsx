"use client";

import * as React from "react";

import { useVisualEditor, type KunciTeks } from "@/components/editor/visual-editor-context";
import { cn } from "@/lib/utils";

/**
 * Teks yang dapat disunting langsung di tempat (inline).
 *
 * Di luar mode edit komponen ini hanya merender teks sesuai bahasa halaman
 * (mis. `/en` memakai `nilaiEn`), sehingga HTML hasil prerender tetap berisi
 * teks asli untuk mesin pencari. Saat mode edit aktif, teks diberi garis
 * putus-putus ketika disorot, badge "Edit Teks (ID/EN)", dan dapat diubah
 * di tempat lewat `contentEditable` maupun `<textarea>`.
 */

interface EditableTextProps {
  /** Kunci kolom konten pada `LandingContentView`. */
  kunci: KunciTeks;
  /** Nilai kolom utama (Indonesia) dari server. */
  nilai: string;
  /** Nilai kolom Inggris dari server; memakai `nilai` bila kosong. */
  nilaiEn?: string;
  /** Bila true, suntingan menulis ke varian `_en` saat bahasa aktif EN. */
  bervariasi?: boolean;
  /** Elemen HTML yang dirender; default `<span>`. */
  as?: React.ElementType;
  className?: string;
  /** Menggunakan `<textarea>` (mis. deskripsi panjang multi-baris). */
  multiline?: boolean;
  /** Menampilkan badge "Edit Teks" ketika disorot. */
  badge?: boolean;
}

export function EditableText({
  kunci,
  nilai,
  nilaiEn,
  bervariasi = true,
  as,
  className,
  multiline = false,
  badge = true,
}: EditableTextProps) {
  const editor = useVisualEditor();
  const ref = React.useRef<HTMLElement | null>(null);

  /* Saat tidak menyunting, teks mengikuti bahasa rute halaman. Saat menyunting,
     mengikuti bahasa aktif editor. */
  const bahasaTerpilih = editor.modeEdit ? editor.bahasa : editor.bahasaHalaman;
  const dariServer = bahasaTerpilih === "en" ? nilaiEn || nilai : nilai;

  const dariKonten = editor.nilaiTeks(kunci, bervariasi);
  const teks = editor.modeEdit && dariKonten ? dariKonten : dariServer;

  /* Setel ulang isi `contentEditable` hanya ketika tidak sedang difokuskan agar
     posisi kursor tidak melompat saat mengetik. */
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !editor.modeEdit || multiline) return;
    if (document.activeElement === el) return;
    if (el.textContent !== teks) el.textContent = teks;
  }, [teks, editor.modeEdit, multiline]);

  if (!editor.modeEdit) {
    const Tag = (as ?? "span") as React.ElementType;
    return <Tag className={className}>{teks}</Tag>;
  }

  const labelBadge = `Edit Teks (${editor.bahasa.toUpperCase()})`;

  if (multiline) {
    return (
      <span className="group relative block">
        {badge ? (
          <span className="pointer-events-none absolute -top-3 left-0 z-10 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            {labelBadge}
          </span>
        ) : null}
        <textarea
          value={teks}
          onChange={(peristiwa) => editor.ubahTeks(kunci, peristiwa.target.value, bervariasi)}
          rows={3}
          className={cn(
            className,
            "block w-full resize-y rounded-sm bg-primary/5 outline-2 outline-offset-2 outline-transparent transition [outline-style:dashed] hover:outline-primary focus:outline-primary",
          )}
        />
      </span>
    );
  }

  const Tag = (as ?? "span") as React.ElementType;

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      data-badge={badge ? labelBadge : undefined}
      onBlur={(peristiwa: React.FocusEvent<HTMLElement>) =>
        editor.ubahTeks(kunci, peristiwa.currentTarget.textContent ?? "", bervariasi)
      }
      onKeyDown={(peristiwa: React.KeyboardEvent<HTMLElement>) => {
        if (peristiwa.key === "Enter" && !peristiwa.shiftKey) {
          peristiwa.preventDefault();
          peristiwa.currentTarget.blur();
        }
        if (peristiwa.key === "Escape") peristiwa.currentTarget.blur();
      }}
      className={cn(
        className,
        "relative cursor-text outline-2 outline-offset-2 outline-transparent transition [outline-style:dashed] hover:outline-primary focus:outline-primary",
        badge &&
          "after:pointer-events-none after:absolute after:-top-3 after:left-0 after:z-10 after:rounded after:bg-primary after:px-1.5 after:py-0.5 after:text-[10px] after:font-semibold after:text-primary-foreground after:opacity-0 after:transition-opacity after:content-[attr(data-badge)] hover:after:opacity-100 focus:after:opacity-100",
      )}
    />
  );
}
