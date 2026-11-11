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
  useBuatFasilitas,
  useDaftarFasilitasAdmin,
  useHapusFasilitas,
  usePerbaruiFasilitas,
  useUbahStatusFasilitas,
} from "@/lib/api/hooks";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import type { CreateFacilityRequest, FacilityView, UpdateFacilityRequest } from "@/types/api";

const skemaFasilitas = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama fasilitas minimal 2 karakter")
    .max(80, "Nama fasilitas maksimal 80 karakter"),
  slug: z
    .string()
    .trim()
    .max(60, "Slug maksimal 60 karakter")
    .refine((nilai) => nilai === "" || /^[a-z0-9-]+$/.test(nilai), "Slug hanya huruf kecil, angka, dan tanda hubung"),
  description: z.string().trim().max(300, "Deskripsi maksimal 300 karakter"),
  icon: z.string().trim().max(60, "Ikon maksimal 60 karakter"),
  sort_order: z
    .string()
    .trim()
    .refine((nilai) => /^\d+$/.test(nilai), "Urutan harus berupa angka"),
  is_active: z.boolean(),
});

type NilaiFasilitas = z.infer<typeof skemaFasilitas>;

function nilaiDariFasilitas(fasilitas: FacilityView): NilaiFasilitas {
  return {
    name: fasilitas.name,
    slug: fasilitas.slug,
    description: fasilitas.description,
    icon: fasilitas.icon,
    sort_order: String(fasilitas.sort_order),
    is_active: fasilitas.is_active,
  };
}

function keCreateFasilitas(nilai: NilaiFasilitas): CreateFacilityRequest {
  return {
    slug: nilai.slug.trim() || undefined,
    name: nilai.name.trim(),
    description: nilai.description.trim() || undefined,
    icon: nilai.icon.trim() || undefined,
    sort_order: Number(nilai.sort_order),
    is_active: nilai.is_active,
  };
}

function keUpdateFasilitas(nilai: NilaiFasilitas): UpdateFacilityRequest {
  return {
    name: nilai.name.trim(),
    description: nilai.description.trim(),
    icon: nilai.icon.trim(),
    sort_order: Number(nilai.sort_order),
    is_active: nilai.is_active,
  };
}

function FormFasilitas({ fasilitas, onTutup }: { fasilitas?: FacilityView; onTutup: () => void }) {
  const buat = useBuatFasilitas();
  const ubah = usePerbaruiFasilitas();
  const form = useForm<NilaiFasilitas>({
    resolver: zodResolver(skemaFasilitas),
    defaultValues: fasilitas
      ? nilaiDariFasilitas(fasilitas)
      : { name: "", slug: "", description: "", icon: "", sort_order: "0", is_active: true },
  });

  async function kirim(nilai: NilaiFasilitas) {
    try {
      if (fasilitas) await ubah.mutateAsync({ id: fasilitas.id, body: keUpdateFasilitas(nilai) });
      else await buat.mutateAsync(keCreateFasilitas(nilai));
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
      judul={fasilitas ? "Ubah fasilitas" : "Fasilitas baru"}
      deskripsi="Fasilitas dipakai mitra untuk melengkapi informasi listing properti."
      memuat={buat.isPending || ubah.isPending}
      labelKirim={fasilitas ? "Simpan perubahan" : "Buat fasilitas"}
      onSubmit={form.handleSubmit(kirim)}
    >
      <KelompokField judul="Identitas fasilitas">
        <TextField control={form.control} name="name" label="Nama fasilitas" wajib placeholder="Contoh: Kolam Renang" />
        {fasilitas ? null : (
          <TextField
            control={form.control}
            name="slug"
            label="Slug"
            placeholder="opsional, dibuat otomatis bila kosong"
          />
        )}
        <TextareaField control={form.control} name="description" label="Deskripsi" rows={2} />
        <TextField
          control={form.control}
          name="icon"
          label="Ikon"
          placeholder="opsional, nama ikon (mis. waves, car)"
        />
      </KelompokField>

      <KelompokField judul="Pengurutan & status" kolom={2}>
        <TextField control={form.control} name="sort_order" label="Urutan tampil" inputMode="numeric" />
        <CheckboxField
          control={form.control}
          name="is_active"
          label="Aktifkan fasilitas"
          deskripsi="Fasilitas aktif dapat dipilih mitra saat mengunggah listing."
        />
      </KelompokField>
    </FormDialog>
  );
}

export function KatalogFasilitas() {
  const { pengguna } = useAuth();
  const bolehKelola = pengguna?.role === "superadmin";

  const tabel = useTabelQuery({ perPage: 10 });
  const daftar = useDaftarFasilitasAdmin(tabel.query);
  const ubahStatus = useUbahStatusFasilitas();
  const hapus = useHapusFasilitas();

  const [editor, setEditor] = React.useState<{ terbuka: boolean; fasilitas?: FacilityView } | null>(null);
  const [targetStatus, setTargetStatus] = React.useState<FacilityView | null>(null);
  const [targetHapus, setTargetHapus] = React.useState<FacilityView | null>(null);

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

  const kolom: KolomTabel<FacilityView>[] = [
    {
      kunci: "fasilitas",
      judul: "Fasilitas",
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
              { label: "Ubah fasilitas", ikon: PencilLine, onPilih: () => setEditor({ terbuka: true, fasilitas: baris }) },
              {
                label: baris.is_active ? "Nonaktifkan" : "Aktifkan",
                ikon: Power,
                onPilih: () => setTargetStatus(baris),
              },
              {
                label: "Hapus fasilitas",
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
        judul="Master Fasilitas"
        deskripsi="Kelola fasilitas properti yang dapat dipilih mitra saat mengunggah listing."
        aksi={
          bolehKelola ? (
            <Button onClick={() => setEditor({ terbuka: true })}>
              <Plus />
              Tambah Fasilitas
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
        placeholderCari="Cari nama atau deskripsi fasilitas..."
        satuan="fasilitas"
        kosong={
          <EmptyState
            judul="Belum ada fasilitas"
            deskripsi="Tambahkan fasilitas agar mitra dapat melengkapi informasi listing properti."
          />
        }
      />

      {editor?.terbuka ? (
        <FormFasilitas
          key={editor.fasilitas?.id ?? "baru"}
          fasilitas={editor.fasilitas}
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
          judul={targetStatus.is_active ? "Nonaktifkan fasilitas" : "Aktifkan fasilitas"}
          deskripsi={
            targetStatus.is_active
              ? `Fasilitas "${targetStatus.name}" tidak akan dapat dipilih mitra.`
              : `Fasilitas "${targetStatus.name}" akan dapat dipilih mitra saat mengunggah listing.`
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
          judul="Hapus fasilitas"
          deskripsi={`Fasilitas "${targetHapus.name}" akan dihapus dari master data. Tindakan ini tidak dapat dibatalkan.`}
          labelKonfirmasi="Hapus"
          variant="danger"
          memuat={hapus.isPending}
          onKonfirmasi={() => void konfirmasiHapus()}
        />
      ) : null}
    </>
  );
}
