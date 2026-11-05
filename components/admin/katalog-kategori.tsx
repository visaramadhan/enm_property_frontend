"use client";

import * as React from "react";
import { PencilLine, Plus, Power, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AksiBaris } from "@/components/shared/aksi-baris";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { KolomTabel } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { CheckboxField, KelompokField, TextField, TextareaField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { TabelData } from "@/components/shared/tabel-data";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useBuatKategori,
  useDaftarKategoriAdmin,
  useHapusKategori,
  usePerbaruiKategori,
  useUbahStatusKategori,
} from "@/lib/api/hooks";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { CategoryView, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/api";

/**
 * Skema & konversi formulir kategori.
 *
 * Nilai numerik disimpan sebagai teks agar cocok dengan `<input>` lalu
 * dikonversi pada `keCreateKategori`/`keUpdateKategori` (pola sama dengan
 * formulir paket, DRY).
 */
const skemaKategori = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(80, "Nama kategori maksimal 80 karakter"),
  slug: z
    .string()
    .trim()
    .max(60, "Slug maksimal 60 karakter")
    .refine((nilai) => nilai === "" || /^[a-z0-9-]+$/.test(nilai), "Slug hanya huruf kecil, angka, dan tanda hubung"),
  description: z.string().trim().max(300, "Deskripsi maksimal 300 karakter"),
  sort_order: z
    .string()
    .trim()
    .refine((nilai) => /^\d+$/.test(nilai), "Urutan harus berupa angka"),
  is_active: z.boolean(),
});

type NilaiKategori = z.infer<typeof skemaKategori>;

function nilaiDariKategori(kategori: CategoryView): NilaiKategori {
  return {
    name: kategori.name,
    slug: kategori.slug,
    description: kategori.description,
    sort_order: String(kategori.sort_order),
    is_active: kategori.is_active,
  };
}

function keCreateKategori(nilai: NilaiKategori): CreateCategoryRequest {
  return {
    slug: nilai.slug.trim() || undefined,
    name: nilai.name.trim(),
    description: nilai.description.trim() || undefined,
    sort_order: Number(nilai.sort_order),
    is_active: nilai.is_active,
  };
}

function keUpdateKategori(nilai: NilaiKategori): UpdateCategoryRequest {
  return {
    name: nilai.name.trim(),
    description: nilai.description.trim(),
    sort_order: Number(nilai.sort_order),
    is_active: nilai.is_active,
  };
}

/** Dialog buat/ubah kategori; `kategori` kosong berarti mode pembuatan. */
function FormKategori({ kategori, onTutup }: { kategori?: CategoryView; onTutup: () => void }) {
  const buat = useBuatKategori();
  const ubah = usePerbaruiKategori();
  const form = useForm<NilaiKategori>({
    resolver: zodResolver(skemaKategori),
    defaultValues: kategori
      ? nilaiDariKategori(kategori)
      : { name: "", slug: "", description: "", sort_order: "0", is_active: true },
  });

  async function kirim(nilai: NilaiKategori) {
    try {
      if (kategori) await ubah.mutateAsync({ id: kategori.id, body: keUpdateKategori(nilai) });
      else await buat.mutateAsync(keCreateKategori(nilai));
      onTutup();
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <FormDialog
      terbuka
      onUbahTerbuka={(nilai) => {
        if (!nilai) onTutup();
      }}
      judul={kategori ? "Ubah kategori" : "Kategori baru"}
      deskripsi="Kategori dipakai untuk mengelompokkan properti pada katalog publik."
      memuat={buat.isPending || ubah.isPending}
      labelKirim={kategori ? "Simpan perubahan" : "Buat kategori"}
      onSubmit={form.handleSubmit(kirim)}
    >
      <KelompokField judul="Identitas kategori">
        <TextField control={form.control} name="name" label="Nama kategori" wajib placeholder="Contoh: Rumah" />
        {kategori ? null : (
          <TextField
            control={form.control}
            name="slug"
            label="Slug"
            placeholder="opsional, dibuat otomatis bila kosong"
          />
        )}
        <TextareaField control={form.control} name="description" label="Deskripsi" rows={3} />
      </KelompokField>

      <KelompokField judul="Pengurutan & status" kolom={2}>
        <TextField control={form.control} name="sort_order" label="Urutan tampil" inputMode="numeric" />
        <CheckboxField
          control={form.control}
          name="is_active"
          label="Aktifkan kategori"
          deskripsi="Kategori aktif tampil pada filter katalog publik."
        />
      </KelompokField>
    </FormDialog>
  );
}

export function KatalogKategori() {
  const { pengguna } = useAuth();
  const bolehKelola = pengguna?.role === "superadmin";

  const tabel = useTabelQuery({ perPage: 10 });
  const daftar = useDaftarKategoriAdmin(tabel.query);
  const ubahStatus = useUbahStatusKategori();
  const hapus = useHapusKategori();

  const [editor, setEditor] = React.useState<{ terbuka: boolean; kategori?: CategoryView } | null>(null);
  const [targetStatus, setTargetStatus] = React.useState<CategoryView | null>(null);
  const [targetHapus, setTargetHapus] = React.useState<CategoryView | null>(null);

  async function konfirmasiStatus() {
    if (!targetStatus) return;
    try {
      await ubahStatus.mutateAsync({
        id: targetStatus.id,
        body: { active: !targetStatus.is_active },
      });
      setTargetStatus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function konfirmasiHapus() {
    if (!targetHapus) return;
    try {
      await hapus.mutateAsync(targetHapus.id);
      setTargetHapus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  const kolom: KolomTabel<CategoryView>[] = [
    {
      kunci: "kategori",
      judul: "Kategori",
      render: (baris) => (
        <span className="flex flex-col">
          <span className="font-medium text-ink">{baris.name}</span>
          <span className="text-xs text-ink-muted">{baris.slug}</span>
        </span>
      ),
    },
    {
      kunci: "deskripsi",
      judul: "Deskripsi",
      selClassName: "text-ink-muted",
      render: (baris) => baris.description || "—",
    },
    {
      kunci: "urutan",
      judul: "Urutan",
      kepalaClassName: "text-right",
      selClassName: "text-right text-ink-muted",
      render: (baris) => <span data-numeric>{baris.sort_order}</span>,
    },
    {
      kunci: "status",
      judul: "Status",
      render: (baris) => (
        <Badge variant={baris.is_active ? "success" : "neutral"}>
          {baris.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      kunci: "aksi",
      judul: "",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) =>
        bolehKelola ? (
          <AksiBaris
            aksi={[
              { label: "Ubah kategori", ikon: PencilLine, onPilih: () => setEditor({ terbuka: true, kategori: baris }) },
              {
                label: baris.is_active ? "Nonaktifkan" : "Aktifkan",
                ikon: Power,
                onPilih: () => setTargetStatus(baris),
              },
              {
                label: "Hapus kategori",
                ikon: Trash2,
                variant: "danger",
                onPilih: () => setTargetHapus(baris),
              },
            ]}
          />
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        judul="Master Kategori"
        deskripsi="Kelola kategori properti yang dipakai pada filter katalog publik."
        aksi={
          bolehKelola ? (
            <Button onClick={() => setEditor({ terbuka: true })}>
              <Plus />
              Tambah Kategori
            </Button>
          ) : null
        }
      />

      <TabelData
        kolom={kolom}
        data={daftar.data?.items}
        meta={daftar.data?.meta}
        kunciBaris={(baris) => baris.id}
        memuat={daftar.isPending}
        error={daftar.isError ? daftar.error : undefined}
        onCobaLagi={() => void daftar.refetch()}
        onUbahHalaman={tabel.aturHalaman}
        nilaiCari={tabel.cari}
        onCari={tabel.ubahCari}
        placeholderCari="Cari nama atau deskripsi kategori..."
        satuan="kategori"
        kosong={
          <EmptyState
            judul="Belum ada kategori"
            deskripsi="Tambahkan kategori agar properti dapat dikelompokkan pada katalog."
          />
        }
      />

      {editor?.terbuka ? (
        <FormKategori
          key={editor.kategori?.id ?? "baru"}
          kategori={editor.kategori}
          onTutup={() => setEditor(null)}
        />
      ) : null}

      {targetStatus ? (
        <ConfirmDialog
          key={targetStatus.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetStatus(null);
          }}
          judul={targetStatus.is_active ? "Nonaktifkan kategori" : "Aktifkan kategori"}
          deskripsi={
            targetStatus.is_active
              ? `Kategori "${targetStatus.name}" tidak akan tampil pada filter katalog publik.`
              : `Kategori "${targetStatus.name}" akan tampil pada filter katalog publik.`
          }
          labelKonfirmasi={targetStatus.is_active ? "Nonaktifkan" : "Aktifkan"}
          variant={targetStatus.is_active ? "danger" : "primary"}
          memuat={ubahStatus.isPending}
          onKonfirmasi={() => void konfirmasiStatus()}
        />
      ) : null}

      {targetHapus ? (
        <ConfirmDialog
          key={targetHapus.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetHapus(null);
          }}
          judul="Hapus kategori"
          deskripsi={`Kategori "${targetHapus.name}" akan dihapus dari master data. Tindakan ini tidak dapat dibatalkan.`}
          labelKonfirmasi="Hapus"
          variant="danger"
          memuat={hapus.isPending}
          onKonfirmasi={() => void konfirmasiHapus()}
        />
      ) : null}
    </>
  );
}
