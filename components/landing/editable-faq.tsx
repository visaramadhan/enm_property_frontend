"use client";

import * as React from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import { EditableText } from "@/components/editor/editable-text";
import { useVisualEditor } from "@/components/editor/visual-editor-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LandingFAQItem } from "@/types/api";

/**
 * Bagian pertanyaan umum (FAQ) landing page.
 *
 * Di luar mode edit menampilkan daftar `<details>` (jawaban tetap ada di HTML
 * awal sehingga terbaca mesin pencari). Di dalam mode edit, setiap item menjadi
 * kartu dengan dua bidang sunting dan tombol hapus, ditambah tombol "Tambah
 * FAQ" — daftar disimpan ke kolom bahasa yang sedang aktif lewat `ubahFaq`.
 */

const KONTAINER = "mx-auto w-full max-w-7xl px-4 lg:px-8";
const JANGKAR = "scroll-mt-[72px]";

interface EditableFaqProps {
  /** Label kecil di atas judul. */
  eyebrow: string;
  /** Judul bagian (nilai sudah diselesaikan sesuai bahasa rute oleh pemanggil). */
  judul: string;
  /** Deskripsi singkat (nilai sudah diselesaikan sesuai bahasa rute). */
  subjudul: string;
  /** Daftar FAQ versi bahasa rute (sudah diisi fallback oleh pemanggil). */
  items: LandingFAQItem[];
}

export function EditableFaq({ eyebrow, judul, subjudul, items }: EditableFaqProps) {
  const editor = useVisualEditor();

  /* Di luar mode edit dipakai daftar dari server (bahasa rute). Di mode edit
     daftar dibaca dari salinan kerja pada kolom bahasa yang sedang aktif. */
  const daftar = editor.modeEdit ? editor.nilaiFaq() : items;

  function ubahItem(indeks: number, patch: Partial<LandingFAQItem>) {
    editor.ubahFaq(daftar.map((item, i) => (i === indeks ? { ...item, ...patch } : item)));
  }

  function hapusItem(indeks: number) {
    editor.ubahFaq(daftar.filter((_, i) => i !== indeks));
  }

  function tambahItem() {
    editor.ubahFaq([...daftar, { tanya: "", jawab: "" }]);
  }

  return (
    <section id="faq" className={cn(JANGKAR, "border-t border-line bg-surface py-12 sm:py-16")}>
      <div className={KONTAINER}>
        <div className="mx-auto mb-9 max-w-[720px] text-center">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-primary uppercase before:h-0.5 before:w-5 before:rounded-full before:bg-current before:content-['']">
            {eyebrow}
          </p>
          <EditableText
            as="h2"
            kunci="faq_title"
            nilai={judul}
            className="my-2.5 text-[clamp(24px,3vw,30px)] leading-tight font-bold tracking-[-0.03em] text-ink"
          />
          <EditableText
            as="p"
            kunci="faq_subtitle"
            nilai={subjudul}
            className="text-sm text-ink-muted"
          />
        </div>

        {editor.modeEdit ? (
          <div className="mx-auto flex max-w-[850px] flex-col gap-3">
            {daftar.map((item, indeks) => (
              <div
                key={`faq-${indeks}`}
                className="flex flex-col gap-2 rounded-[10px] border border-line bg-canvas p-4"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={item.tanya}
                    onChange={(peristiwa) => ubahItem(indeks, { tanya: peristiwa.target.value })}
                    placeholder="Pertanyaan"
                    className="h-9 flex-1 rounded-md border border-line bg-surface px-3 text-sm font-semibold text-ink outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => hapusItem(indeks)}
                    aria-label="Hapus FAQ"
                    className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <textarea
                  value={item.jawab}
                  onChange={(peristiwa) => ubahItem(indeks, { jawab: peristiwa.target.value })}
                  placeholder="Jawaban"
                  rows={2}
                  className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink-muted outline-none focus:border-primary"
                />
              </div>
            ))}

            <Button type="button" variant="outline" onClick={tambahItem} className="self-start">
              <Plus className="size-4" aria-hidden="true" />
              Tambah FAQ
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-[850px] flex-col gap-3">
            {daftar.map((item, indeks) => (
              <details
                key={`${item.tanya}-${indeks}`}
                open={indeks === 0}
                className="group rounded-[10px] border border-line bg-surface"
              >
                <summary className="flex list-none cursor-pointer items-center justify-between gap-4 p-5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {item.tanya}
                  <Sparkles
                    className="size-4 shrink-0 text-primary transition-transform duration-250 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-[18px] text-[13px] leading-[1.7] text-ink-muted">
                  {item.jawab}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
