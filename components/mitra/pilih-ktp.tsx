"use client";

import * as React from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Pemilih foto KTP (satu berkas) untuk formulir pendaftaran mitra.
 *
 * Berkas ditahan di sisi klien beserta pratinjaunya; halaman pemanggil
 * mengunggahnya ke `POST /partners/ktp` lalu mengirim URL hasilnya pada
 * pendaftaran mitra.
 */
export function PilihKTP({
  berkas,
  onUbah,
}: {
  berkas: File | null;
  onUbah: (berkas: File | null) => void;
}) {
  const { t } = useBahasa();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Pratinjau memakai object URL yang dibebaskan kembali saat berkas berganti
  // atau komponen dilepas agar tidak menahan memori berkas.
  const pratinjau = React.useMemo(
    () => (berkas ? URL.createObjectURL(berkas) : null),
    [berkas],
  );
  React.useEffect(() => {
    return () => {
      if (pratinjau) URL.revokeObjectURL(pratinjau);
    };
  }, [pratinjau]);

  function pilih(event: React.ChangeEvent<HTMLInputElement>) {
    const dipilih = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (dipilih) onUbah(dipilih);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{t("Foto KTP")}</CardTitle>
          <CardDescription>
            {t(
              "Unggah foto KTP pemilik atau penanggung jawab. Format JPG, PNG, atau WEBP, maksimal 5 MB.",
            )}
          </CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <ImagePlus />
          {berkas ? t("Ganti foto") : t("Pilih foto KTP")}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pilih} />
      </CardHeader>

      <CardContent>
        {!pratinjau ? (
          <p className="rounded-sm border border-dashed border-line px-4 py-6 text-center text-[13px] text-ink-muted">
            {t("Belum ada foto KTP dipilih. Foto KTP wajib diunggah saat pendaftaran mitra.")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-card border border-line bg-hover">
            {/* Pratinjau berkas lokal (blob URL) tidak melalui `next/image`. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pratinjau}
              alt={t("Pratinjau foto KTP")}
              className="max-h-64 w-full object-contain"
            />
            <div className="flex items-center justify-end border-t border-divider bg-surface p-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={() => onUbah(null)}>
                <Trash2 className="text-danger" />
                {t("Hapus foto KTP")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
