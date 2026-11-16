"use client";

import * as React from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";

import { useBahasa } from "@/components/providers/bahasa-provider";
import { CeklisPersetujuan } from "@/components/shared/ceklis-perjanjian";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useLanggananMitra,
  usePaketPublik,
  usePerjanjianMitra,
  useSetujuiPerjanjianMitra,
} from "@/lib/api/hooks";
import type { VendorAgreementResponse } from "@/types/api";

/**
 * Modal perjanjian kemitraan yang muncul saat mitra pertama kali masuk dashboard
 * (mis. setelah paket Gratis aktif otomatis pada pendaftaran).
 *
 * Modal hanya relevan bagi mitra dengan paket aktif Gratis; mitra berbayar
 * tidak diminta menandatangani lewat modal ini. Modal juga hilang sendiri
 * begitu persetujuan tercatat.
 */
export function ModalPerjanjianMitra() {
  const perjanjian = usePerjanjianMitra();
  const langganan = useLanggananMitra();
  const paket = usePaketPublik();

  const data = perjanjian.data;
  const paketAktifGratis = Boolean(
    langganan.data?.plan_id &&
      paket.data?.find((item) => item.id === langganan.data?.plan_id)?.is_free,
  );

  if (!data || data.accepted || !paketAktifGratis) return null;

  /* `key` memastikan seluruh centang dimulai ulang saat versi perjanjian berganti. */
  return <DialogPersetujuan key={data.agreement.id} data={data} />;
}

/**
 * Isi modal persetujuan: mitra mencentang setiap poin perjanjian satu per satu
 * dan tombol persetujuan aktif hanya setelah seluruh poin dicentang. Bila admin
 * tidak mengisi poin ceklis, mitra cukup menyetujui melalui satu ceklis umum.
 */
function DialogPersetujuan({ data }: { data: VendorAgreementResponse }) {
  const { t } = useBahasa();
  const setujui = useSetujuiPerjanjianMitra();
  const poin = data.agreement.checklist;

  const [terbuka, setTerbuka] = React.useState(true);
  const [tercentang, setTercentang] = React.useState<boolean[]>(() => poin.map(() => false));
  const [setujuUmum, setSetujuUmum] = React.useState(false);

  const semuaDisetujui = poin.length > 0 ? tercentang.every(Boolean) : setujuUmum;

  function ubahCentang(indeks: number, terisi: boolean) {
    setTercentang((sebelumnya) =>
      sebelumnya.map((nilai, posisi) => (posisi === indeks ? terisi : nilai)),
    );
  }

  async function kirim() {
    try {
      await setujui.mutateAsync({ agreement_id: data.agreement.id });
      setTerbuka(false);
    } catch {
      // Pesan kegagalan sudah ditampilkan oleh `useMutasi`.
    }
  }

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(nilai) => {
        if (!setujui.isPending) setTerbuka(nilai);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-secondary" aria-hidden="true" />
            {t(data.agreement.title)}
          </DialogTitle>
          <DialogDescription>
            {t("Setujui perjanjian kemitraan versi {versi} untuk mulai mengelola properti.", {
              versi: data.agreement.version,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[55vh] flex-col gap-5 overflow-y-auto pr-1">
          <p className="rounded-field border border-line bg-hover/50 p-4 text-[13px] whitespace-pre-line text-ink-muted">
            {data.agreement.content}
          </p>

          {poin.length > 0 ? (
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-ink">
                {t("Centang setiap poin berikut untuk melanjutkan")}
              </span>
              <CeklisPersetujuan
                poin={poin}
                nilai={tercentang}
                onUbah={ubahCentang}
                disabled={setujui.isPending}
                idDasar="ceklis-modal-perjanjian"
              />
            </div>
          ) : (
            <label className="flex items-start gap-2.5 text-[13px] text-ink">
              <Checkbox
                className="mt-0.5"
                checked={setujuUmum}
                disabled={setujui.isPending}
                onCheckedChange={(nilai) => setSetujuUmum(nilai === true)}
              />
              <span>{t("Saya menyetujui perjanjian kemitraan ENM Property.")}</span>
            </label>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={!semuaDisetujui || setujui.isPending}
            onClick={() => void kirim()}
          >
            {setujui.isPending ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />}
            {t("Setujui perjanjian")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
