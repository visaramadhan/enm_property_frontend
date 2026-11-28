"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  useLandingAdmin,
  usePerbaruiLanding,
  usePublikasikanLanding,
  useProfilSaya,
  useUnggahGambarLanding,
} from "@/lib/api/hooks";
import type { Bahasa } from "@/lib/bahasa";
import type { LandingContentView, LandingFAQItem } from "@/types/api";

/**
 * Penyedia keadaan editor visual landing page (Live Edit Mode).
 *
 * Editor dirender sebagai lapisan (overlay) di halaman publik `/`. Seluruh teks
 * yang dapat disunting dikelola di sini dengan pemisahan bahasa:
 * - `konten` menyimpan salinan kerja `LandingContentView` (kolom utama = ID dan
 *   kolom `*_en` = EN). Kolom media (`hero_images`) dibagi lintas bahasa.
 * - `updateTeks` menulis ke kolom sesuai bahasa aktif, `saveChanges` mengirim
 *   seluruh kolom ke backend CMS lalu memicu publikasi (revalidasi ISR).
 *
 * Penyimpanan tetap berada di backend (`PUT /admin/landing`) sehingga halaman
 * publik yang dirender server tetap menjadi sumber tampilan sesungguhnya.
 */

/** Bahasa yang dapat disunting pada editor visual. */
export type BahasaEditor = "id" | "en";

/** Peran yang boleh membuka editor visual. */
const PERAN_EDITOR: readonly string[] = ["admin", "superadmin"];

/** Kunci kolom teks pada `LandingContentView`. */
export type KunciTeks = keyof LandingContentView;

interface KonteksVisualEditor {
  /** Pengguna berperan admin/superadmin (gesekan editor hanya tampil bagi mereka). */
  dapatMengedit: boolean;
  /**
   * Bahasa rute halaman yang sedang dibuka (`/` = id, `/en` = en). Dipakai
   * `EditableText` sebagai bahasa tampilan saat mode edit tidak aktif, sehingga
   * pilihan cookie bahasa tidak mengubah isi halaman (selaras pratinjau server).
   */
  bahasaHalaman: Bahasa;
  /** Mode edit sedang aktif. */
  modeEdit: boolean;
  /** Bahasa aktif yang sedang disunting. */
  bahasa: BahasaEditor;
  /** Pratinjau lebar seluler (390px) sedang aktif. */
  seluler: boolean;
  /** Ada perubahan yang belum disimpan. */
  belumDisimpan: boolean;
  /** Penyimpanan sedang berjalan. */
  menyimpan: boolean;
  /** Salinan kerja konten sudah termuat dari backend. */
  siap: boolean;
  /** Salinan kerja konten landing (null sebelum termuat). */
  konten: LandingContentView | null;
  bukaEditor: () => void;
  tutupEditor: () => void;
  ubahBahasa: (bahasa: BahasaEditor) => void;
  ubahSeluler: (nilai: boolean) => void;
  /** Nilai teks terpilih sesuai bahasa aktif. */
  nilaiTeks: (kunci: KunciTeks, bervariasi?: boolean) => string;
  /** Menyetel nilai teks pada kolom bahasa aktif. */
  ubahTeks: (kunci: KunciTeks, nilai: string, bervariasi?: boolean) => void;
  /** Daftar FAQ pada kolom bahasa aktif. */
  nilaiFaq: () => LandingFAQItem[];
  /** Menyetel daftar FAQ pada kolom bahasa aktif. */
  ubahFaq: (daftar: LandingFAQItem[]) => void;
  /** Daftar gambar kolase hero (dibagi lintas bahasa). */
  nilaiGambarHero: () => string[];
  /** Mengunggah gambar hero ke slot tertentu. */
  unggahGambarHero: (indeks: number, berkas: File) => Promise<void>;
  simpan: () => Promise<void>;
  reset: () => void;
}

const Konteks = React.createContext<KonteksVisualEditor | null>(null);

/** Menyisipkan akhiran kolom bahasa Inggris. */
function kunciBerbahasa(kunci: KunciTeks, bahasa: BahasaEditor, bervariasi: boolean): KunciTeks {
  if (!bervariasi || bahasa === "id") return kunci;
  return `${kunci}_en` as KunciTeks;
}

export function VisualEditorProvider({
  bahasaHalaman = "id",
  children,
}: {
  /** Bahasa rute halaman; juga menjadi bahasa awal yang disunting editor. */
  bahasaHalaman?: Bahasa;
  children: React.ReactNode;
}) {
  const profil = useProfilSaya();
  const dapatMengedit = PERAN_EDITOR.includes(profil.data?.role ?? "");

  const [modeEdit, setModeEdit] = React.useState(false);
  const [bahasa, setBahasa] = React.useState<BahasaEditor>(bahasaHalaman);
  const [seluler, setSeluler] = React.useState(false);
  const [belumDisimpan, setBelumDisimpan] = React.useState(false);
  const [konten, setKonten] = React.useState<LandingContentView | null>(null);

  /* Permintaan hanya dijalankan setelah peran diketahui admin/superadmin. */
  const admin = useLandingAdmin(dapatMengedit);
  const perbarui = usePerbaruiLanding();
  const publikasi = usePublikasikanLanding();
  const unggah = useUnggahGambarLanding();

  /* Sinkronkan salinan kerja sekali saat data pertama tiba (atau setelah
     reset/simpan) agar hasil pengambilan ulang tidak menimpa suntingan aktif. */
  const tersinkron = React.useRef(false);
  React.useEffect(() => {
    if (admin.data && !tersinkron.current) {
      setKonten(admin.data);
      tersinkron.current = true;
    }
  }, [admin.data]);

  const nilaiTeks = React.useCallback(
    (kunci: KunciTeks, bervariasi = true) => {
      const aktif = kunciBerbahasa(kunci, bahasa, bervariasi);
      return String(konten?.[aktif] ?? "");
    },
    [konten, bahasa],
  );

  const ubahTeks = React.useCallback(
    (kunci: KunciTeks, nilai: string, bervariasi = true) => {
      const aktif = kunciBerbahasa(kunci, bahasa, bervariasi);
      setKonten((sebelumnya) => (sebelumnya ? { ...sebelumnya, [aktif]: nilai } : sebelumnya));
      setBelumDisimpan(true);
    },
    [bahasa],
  );

  const nilaiFaq = React.useCallback(() => {
    const aktif = kunciBerbahasa("faq_items", bahasa, true);
    const daftar = konten?.[aktif];
    return Array.isArray(daftar) ? (daftar as LandingFAQItem[]) : [];
  }, [konten, bahasa]);

  const ubahFaq = React.useCallback(
    (daftar: LandingFAQItem[]) => {
      const aktif = kunciBerbahasa("faq_items", bahasa, true);
      setKonten((sebelumnya) => (sebelumnya ? { ...sebelumnya, [aktif]: daftar } : sebelumnya));
      setBelumDisimpan(true);
    },
    [bahasa],
  );

  const nilaiGambarHero = React.useCallback(() => konten?.hero_images ?? [], [konten]);

  const unggahGambarHero = React.useCallback(
    async (indeks: number, berkas: File) => {
      /* Pratinjau instan dengan object URL sebelum unggahan selesai. */
      const pratinjau = URL.createObjectURL(berkas);
      setKonten((sebelumnya) => {
        if (!sebelumnya) return sebelumnya;
        const daftar = [...sebelumnya.hero_images];
        daftar[indeks] = pratinjau;
        return { ...sebelumnya, hero_images: daftar };
      });
      setBelumDisimpan(true);

      try {
        const hasil = await unggah.mutateAsync({ kind: "hero", file: berkas });
        setKonten((sebelumnya) => {
          if (!sebelumnya) return sebelumnya;
          const daftar = [...sebelumnya.hero_images];
          daftar[indeks] = hasil.url;
          return { ...sebelumnya, hero_images: daftar };
        });
      } finally {
        URL.revokeObjectURL(pratinjau);
      }
    },
    [unggah],
  );

  const simpan = React.useCallback(async () => {
    if (!konten) return;
    const { updated_at: _abaikan, ...permintaan } = konten;
    await perbarui.mutateAsync(permintaan);
    await publikasi.mutateAsync();
    setBelumDisimpan(false);
  }, [konten, perbarui, publikasi]);

  const reset = React.useCallback(() => {
    setKonten(admin.data ?? null);
    setBelumDisimpan(false);
    tersinkron.current = Boolean(admin.data);
    toast.info("Perubahan dibatalkan");
  }, [admin.data]);

  const nilai = React.useMemo<KonteksVisualEditor>(
    () => ({
      dapatMengedit,
      bahasaHalaman,
      modeEdit,
      bahasa,
      seluler,
      belumDisimpan,
      menyimpan: perbarui.isPending || publikasi.isPending,
      siap: konten !== null,
      konten,
      bukaEditor: () => setModeEdit(true),
      tutupEditor: () => setModeEdit(false),
      ubahBahasa: setBahasa,
      ubahSeluler: setSeluler,
      nilaiTeks,
      ubahTeks,
      nilaiFaq,
      ubahFaq,
      nilaiGambarHero,
      unggahGambarHero,
      simpan,
      reset,
    }),
    [
      dapatMengedit,
      bahasaHalaman,
      modeEdit,
      bahasa,
      seluler,
      belumDisimpan,
      perbarui.isPending,
      publikasi.isPending,
      konten,
      nilaiTeks,
      ubahTeks,
      nilaiFaq,
      ubahFaq,
      nilaiGambarHero,
      unggahGambarHero,
      simpan,
      reset,
    ],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

/**
 * Mengambil konteks editor visual. Bila dipakai di luar penyedianya (mis. saat
 * komponen dirender pada halaman tanpa editor), nilai netral dikembalikan agar
 * teks tetap tampil apa adanya tanpa suntingan.
 */
export function useVisualEditor(): KonteksVisualEditor {
  const nilai = React.useContext(Konteks);
  if (nilai) return nilai;

  return {
    dapatMengedit: false,
    bahasaHalaman: "id",
    modeEdit: false,
    bahasa: "id",
    seluler: false,
    belumDisimpan: false,
    menyimpan: false,
    siap: false,
    konten: null,
    bukaEditor: () => {},
    tutupEditor: () => {},
    ubahBahasa: () => {},
    ubahSeluler: () => {},
    nilaiTeks: () => "",
    ubahTeks: () => {},
    nilaiFaq: () => [],
    ubahFaq: () => {},
    nilaiGambarHero: () => [],
    unggahGambarHero: async () => {},
    simpan: async () => {},
    reset: () => {},
  };
}
