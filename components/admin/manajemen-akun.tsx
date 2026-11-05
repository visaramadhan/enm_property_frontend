"use client";

import * as React from "react";
import { Check, KeyRound, PencilLine, Plus, Power } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  BidangPenggunaBaru,
  BidangPenggunaUbah,
  keBuatPengguna,
  keUpdatePengguna,
  nilaiAwalPenggunaBaru,
  nilaiDariPengguna,
  skemaPenggunaBaru,
  skemaPenggunaUbah,
  type NilaiPenggunaBaru,
  type NilaiPenggunaUbah,
} from "@/components/admin/form-akun";
import { AksiBaris } from "@/components/shared/aksi-baris";
import type { KolomTabel } from "@/components/shared/data-table";
import { DetailDialog } from "@/components/shared/detail-dialog";
import { DialogUbahStatus, type NilaiStatus } from "@/components/shared/dialog-status";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TabelData } from "@/components/shared/tabel-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useBuatPengguna,
  useDaftarPengguna,
  usePerbaruiPengguna,
  useResetSandiPengguna,
  useUbahStatusPengguna,
} from "@/lib/api/hooks";
import { OPSI_PERAN, OPSI_STATUS_PENGGUNA } from "@/lib/enum";
import { formatWib } from "@/lib/format";
import { useTabelQuery } from "@/lib/hooks/use-tabel-query";
import { toastSukses } from "@/lib/toast";
import type { Role, UserStatus, UserView } from "@/types/api";

interface FilterAkun {
  role?: Role;
  status?: UserStatus;
}

function FormAkunBaru({ onTutup }: { onTutup: () => void }) {
  const buat = useBuatPengguna();
  const form = useForm<NilaiPenggunaBaru>({
    resolver: zodResolver(skemaPenggunaBaru),
    defaultValues: nilaiAwalPenggunaBaru,
  });

  async function kirim(nilai: NilaiPenggunaBaru) {
    try {
      await buat.mutateAsync(keBuatPengguna(nilai));
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
      judul="Akun baru"
      deskripsi="Buat akun pengguna beserta peran awalnya."
      ukuran="max-w-xl"
      memuat={buat.isPending}
      labelKirim="Buat akun"
      onSubmit={form.handleSubmit(kirim)}
    >
      <BidangPenggunaBaru control={form.control} />
    </FormDialog>
  );
}

function FormAkunUbah({ pengguna, onTutup }: { pengguna: UserView; onTutup: () => void }) {
  const ubah = usePerbaruiPengguna();
  const form = useForm<NilaiPenggunaUbah>({
    resolver: zodResolver(skemaPenggunaUbah),
    defaultValues: nilaiDariPengguna(pengguna),
  });

  async function kirim(nilai: NilaiPenggunaUbah) {
    try {
      await ubah.mutateAsync({ id: pengguna.id, body: keUpdatePengguna(nilai) });
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
      judul="Ubah akun"
      deskripsi={pengguna.email}
      ukuran="max-w-xl"
      memuat={ubah.isPending}
      labelKirim="Simpan perubahan"
      onSubmit={form.handleSubmit(kirim)}
    >
      <BidangPenggunaUbah control={form.control} />
    </FormDialog>
  );
}

export function ManajemenAkun() {
  const tabel = useTabelQuery<FilterAkun>({ perPage: 10 });
  const daftar = useDaftarPengguna(tabel.query);
  const ubahStatus = useUbahStatusPengguna();
  const resetSandi = useResetSandiPengguna();

  const [editor, setEditor] = React.useState<{ mode: "baru" } | { mode: "ubah"; pengguna: UserView } | null>(null);
  const [targetStatus, setTargetStatus] = React.useState<UserView | null>(null);
  const [tautanReset, setTautanReset] = React.useState<string | null>(null);

  async function kirimStatus(nilai: NilaiStatus) {
    if (!targetStatus) return;
    try {
      await ubahStatus.mutateAsync({
        id: targetStatus.id,
        body: { active: nilai.status === "active", reason: nilai.reason || undefined },
      });
      setTargetStatus(null);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function mintaReset(pengguna: UserView) {
    try {
      const hasil = await resetSandi.mutateAsync(pengguna.id);
      setTautanReset(hasil.reset_link);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  async function salinTautan() {
    if (!tautanReset) return;
    try {
      await navigator.clipboard.writeText(tautanReset);
      toastSukses("Tautan reset disalin");
    } catch {
      toastSukses("Salin manual", tautanReset);
    }
  }

  const kolom: KolomTabel<UserView>[] = [
    {
      kunci: "pengguna",
      judul: "Pengguna",
      render: (baris) => (
        <span className="flex flex-col">
          <span className="font-medium text-ink">{baris.name}</span>
          <span className="text-xs text-ink-muted">{baris.email}</span>
        </span>
      ),
    },
    {
      kunci: "peran",
      judul: "Peran",
      render: (baris) => <StatusBadge jenis="peran" status={baris.role} label={baris.role_label} />,
    },
    {
      kunci: "telepon",
      judul: "Telepon",
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => baris.phone || "-",
    },
    {
      kunci: "status",
      judul: "Status",
      render: (baris) => (
        <StatusBadge
          jenis="pengguna"
          status={baris.status}
          label={baris.status === "active" ? "Aktif" : "Nonaktif"}
        />
      ),
    },
    {
      kunci: "masuk",
      judul: "Terakhir masuk",
      selClassName: "whitespace-nowrap text-ink-muted",
      render: (baris) => (baris.last_login_at ? formatWib(baris.last_login_at) : "Belum pernah"),
    },
    {
      kunci: "aksi",
      judul: "",
      kepalaClassName: "text-right",
      selClassName: "text-right",
      render: (baris) => (
        <AksiBaris
          aksi={[
            { label: "Ubah data", ikon: PencilLine, onPilih: () => setEditor({ mode: "ubah", pengguna: baris }) },
            {
              label: baris.status === "active" ? "Nonaktifkan" : "Aktifkan",
              ikon: Power,
              onPilih: () => setTargetStatus(baris),
            },
            { label: "Reset kata sandi", ikon: KeyRound, onPilih: () => void mintaReset(baris) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        judul="Manajemen Akun"
        deskripsi="Kelola akun, peran, dan status seluruh pengguna platform."
        aksi={
          <Button onClick={() => setEditor({ mode: "baru" })}>
            <Plus />
            Tambah Akun
          </Button>
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
        placeholderCari="Cari nama atau email..."
        satuan="akun"
        filter={[
          {
            kunci: "role",
            label: "Peran",
            nilai: tabel.filter.role,
            opsi: OPSI_PERAN,
            onUbah: (nilai) => tabel.ubahFilter("role", nilai as Role | undefined),
          },
          {
            kunci: "status",
            label: "Status",
            nilai: tabel.filter.status,
            opsi: OPSI_STATUS_PENGGUNA,
            onUbah: (nilai) => tabel.ubahFilter("status", nilai as UserStatus | undefined),
          },
        ]}
        kosong={<EmptyState judul="Belum ada akun" deskripsi="Akun pengguna akan tampil di sini." />}
      />

      {editor?.mode === "baru" ? <FormAkunBaru key="baru" onTutup={() => setEditor(null)} /> : null}
      {editor?.mode === "ubah" ? (
        <FormAkunUbah
          key={editor.pengguna.id}
          pengguna={editor.pengguna}
          onTutup={() => setEditor(null)}
        />
      ) : null}

      {targetStatus ? (
        <DialogUbahStatus
          key={targetStatus.id}
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTargetStatus(null);
          }}
          judul="Ubah status akun"
          deskripsi={targetStatus.email}
          opsi={OPSI_STATUS_PENGGUNA}
          nilaiAwal={targetStatus.status}
          denganAlasan
          labelAlasan="Alasan (opsional)"
          memuat={ubahStatus.isPending}
          onKirim={kirimStatus}
        />
      ) : null}

      {tautanReset ? (
        <DetailDialog
          terbuka
          onUbahTerbuka={(nilai) => {
            if (!nilai) setTautanReset(null);
          }}
          judul="Tautan reset kata sandi"
          deskripsi="Bagikan tautan ini kepada pengguna; tautan hanya berlaku terbatas."
          ukuran="max-w-lg"
          footer={
            <Button type="button" onClick={() => void salinTautan()}>
              <Check />
              Salin tautan
            </Button>
          }
        >
          <Input readOnly value={tautanReset} className="font-mono text-xs" />
        </DetailDialog>
      ) : null}
    </>
  );
}
