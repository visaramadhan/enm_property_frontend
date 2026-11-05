"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMasukAkunDummy } from "@/lib/api/use-sesi";
import { AKUN_DUMMY, LABEL_PERAN, akunDummyTersedia, type AkunDummy } from "@/lib/auth/akun-dummy";
import { dashboardPeran } from "@/lib/navigation";
import { toastGagal, toastSukses } from "@/lib/toast";
import { cn } from "@/lib/utils";

/**
 * Panel masuk cepat sebagai akun demo.
 *
 * Hanya tampil saat backend berjalan pada mode pengembangan
 * (`NEXT_PUBLIC_DEV_AUTH_TOKEN` terisi), sehingga tidak pernah muncul pada
 * deployment produksi. Tampilan mengikuti Design System ENM Property v1.3:
 * memakai token warna `note-*`, `secondary-tint`, dan `primary-tint`.
 */
export function PanelAkunDummy({ className }: { className?: string }) {
  const router = useRouter();
  const masukAkunDummy = useMasukAkunDummy();
  const [dipilih, setDipilih] = React.useState<string | null>(null);

  if (!akunDummyTersedia) return null;

  async function masuk(akun: AkunDummy) {
    setDipilih(akun.uid);
    try {
      await masukAkunDummy(akun.uid);
      toastSukses(`Masuk sebagai ${akun.nama}`, "Sesi demo aktif tanpa akun Firebase.");
      router.replace(dashboardPeran(akun.peran));
    } catch (error) {
      toastGagal("Gagal masuk sebagai akun demo", error);
      setDipilih(null);
    }
  }

  return (
    <section
      aria-labelledby="akun-demo"
      className={cn(
        "flex flex-col gap-3 rounded-panel border border-note-border bg-note-bg p-4",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary-tint text-secondary">
          <UserRoundCheck className="size-4" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 id="akun-demo" className="text-[13px] font-semibold text-ink">
            Akun demo
          </h2>
          <p className="text-xs text-ink-muted">
            Masuk cepat dengan data contoh backend. Tanpa kata sandi, tanpa akun Firebase.
          </p>
        </div>
      </header>

      <ul className="flex flex-col gap-2">
        {AKUN_DUMMY.map((akun) => (
          <li key={akun.uid}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => masuk(akun)}
              disabled={dipilih !== null}
              className="h-auto w-full justify-between gap-3 px-3 py-2 text-left whitespace-normal"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-[13px] font-medium text-ink">{akun.nama}</span>
                <span className="truncate text-xs text-ink-muted">{akun.email}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="rounded-xs bg-primary-tint px-2 py-0.5 text-[11px] font-medium text-primary-ink">
                  {LABEL_PERAN[akun.peran]}
                </span>
                {dipilih === akun.uid ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
              </span>
            </Button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink-subtle">
        Akun pembeli diarahkan ke halaman publik karena dashboard pembeli belum tersedia.
      </p>
    </section>
  );
}
