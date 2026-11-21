/**
 * Utilitas unggah foto sisi klien.
 *
 * Dua masalah utama unggahan multi-foto dari perangkat seluler diselesaikan di
 * sini: (1) foto kamera berukuran besar (>5 MB) gagal atau lambat sehingga
 * dikompresi lebih dulu, dan (2) menembak seluruh berkas sekaligus memicu
 * time-out/batas laju server sehingga unggahan dijalankan sebagai antrean
 * terbatas dengan percobaan ulang.
 */

/** Sisi terpanjang gambar setelah dikompresi (selaras `maxPhotoWidth` backend). */
const MAKS_SISI = 1600;

/** Kualitas hasil kompresi (0-1). */
const KUALITAS = 0.8;

/** Berkas kecil dan berdimensi wajar dilewatkan tanpa dikompresi ulang. */
const AMBANG_LEWAT_BYTE = 600 * 1024;

/** Jumlah unggahan yang dijalankan bersamaan. */
const MAKS_BERSAMAAN = 2;

/** Jumlah percobaan ulang per berkas sebelum dinyatakan gagal. */
const MAKS_PERCOBAAN = 3;

/** Jeda dasar antar percobaan ulang (ms) yang dikalikan nomor percobaan. */
const JEDA_DASAR_MS = 800;

let dukunganWebP: boolean | null = null;

/** Memeriksa apakah canvas mendukung enkode WebP (hasil di-cache). */
function bisaWebP(): boolean {
  if (dukunganWebP !== null) return dukunganWebP;
  try {
    const kanvas = document.createElement("canvas");
    kanvas.width = 1;
    kanvas.height = 1;
    dukunganWebP = kanvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    dukunganWebP = false;
  }
  return dukunganWebP;
}

/** Mengganti ekstensi nama berkas agar sesuai tipe hasil kompresi. */
function namaBaru(nama: string, ekstensi: string): string {
  const dasar = nama.replace(/\.[^.]+$/, "");
  return `${dasar || "foto"}.${ekstensi}`;
}

type SumberGambar = {
  gambar: CanvasImageSource;
  lebar: number;
  tinggi: number;
  lepas: () => void;
};

/** Memuat berkas gambar menjadi sumber yang dapat digambar ke canvas. */
async function muatSumber(file: File): Promise<SumberGambar> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        gambar: bitmap,
        lebar: bitmap.width,
        tinggi: bitmap.height,
        lepas: () => bitmap.close(),
      };
    } catch {
      // Jatuh ke elemen <img> bila peramban gagal men-decode lewat ImageBitmap.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const gambar = new Image();
    gambar.src = url;
    await gambar.decode();
    return {
      gambar,
      lebar: gambar.naturalWidth,
      tinggi: gambar.naturalHeight,
      lepas: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/**
 * Mengompresi gambar di peramban: perkecil sisi terpanjang ke {@link MAKS_SISI}
 * lalu enkode ulang memakai WebP bila didukung, selain itu JPEG, dengan
 * kualitas {@link KUALITAS}.
 *
 * Berkas yang bukan gambar, berformat animasi, atau gagal diproses
 * dikembalikan apa adanya sehingga unggahan tetap berjalan meski kompresi
 * tidak memungkinkan pada perangkat tersebut.
 */
export async function kompresGambar(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  let sumber: SumberGambar;
  try {
    sumber = await muatSumber(file);
  } catch {
    return file;
  }

  try {
    const sisiMaks = Math.max(sumber.lebar, sumber.tinggi);
    const perluPerkecil = sisiMaks > MAKS_SISI;
    if (!perluPerkecil && file.size <= AMBANG_LEWAT_BYTE) return file;

    const skala = perluPerkecil ? MAKS_SISI / sisiMaks : 1;
    const lebar = Math.max(1, Math.round(sumber.lebar * skala));
    const tinggi = Math.max(1, Math.round(sumber.tinggi * skala));

    const kanvas = document.createElement("canvas");
    kanvas.width = lebar;
    kanvas.height = tinggi;
    const konteks = kanvas.getContext("2d");
    if (!konteks) return file;
    konteks.drawImage(sumber.gambar, 0, 0, lebar, tinggi);

    const tipe = bisaWebP() ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      kanvas.toBlob(resolve, tipe, KUALITAS),
    );
    if (!blob) return file;
    // Hindari hasil kompresi yang justru lebih besar dari berkas asli.
    if (!perluPerkecil && blob.size >= file.size) return file;

    return new File([blob], namaBaru(file.name, tipe === "image/webp" ? "webp" : "jpg"), {
      type: tipe,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    sumber.lepas();
  }
}

export interface HasilUnggahFoto {
  /** Jumlah berkas yang berhasil diunggah. */
  berhasil: number;
  /** Berkas yang gagal setelah seluruh percobaan ulang. */
  gagal: File[];
}

export interface OpsiUnggahFoto {
  /** Callback kemajuan: jumlah berkas selesai dari total berkas. */
  onProgres?: (selesai: number, total: number) => void;
}

function tunggu(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mengompresi lalu mengunggah berkas secara berantrean (maksimal
 * {@link MAKS_BERSAMAAN} unggahan bersamaan) dengan percobaan ulang per berkas.
 *
 * Berbeda dari mengirim seluruh berkas sekaligus, antrean ini menjaga jumlah
 * permintaan yang berjalan agar tidak memicu time-out maupun batas laju
 * server pada koneksi seluler. Bila seluruh berkas gagal, galat terakhir
 * dilempar agar pemanggil dapat menampilkan pesan kegagalan.
 */
export async function unggahFotoAntre(
  files: File[],
  unggah: (files: File[]) => Promise<unknown>,
  opsi: OpsiUnggahFoto = {},
): Promise<HasilUnggahFoto> {
  const hasil: HasilUnggahFoto = { berhasil: 0, gagal: [] };
  if (files.length === 0) return hasil;

  // Kompresi dijalankan berurutan agar memori perangkat tidak melonjak saat
  // memproses banyak foto kamera berukuran besar sekaligus.
  const siap: File[] = [];
  for (const file of files) siap.push(await kompresGambar(file));

  const total = siap.length;
  let selesai = 0;
  let galatTerakhir: unknown = null;
  const antrean = [...siap];

  async function pekerja() {
    while (antrean.length > 0) {
      const berkas = antrean.shift();
      if (!berkas) break;

      let sukses = false;
      for (let percobaan = 1; percobaan <= MAKS_PERCOBAAN; percobaan++) {
        try {
          await unggah([berkas]);
          sukses = true;
          break;
        } catch (error) {
          galatTerakhir = error;
          if (percobaan < MAKS_PERCOBAAN) await tunggu(JEDA_DASAR_MS * percobaan);
        }
      }

      if (sukses) hasil.berhasil += 1;
      else hasil.gagal.push(berkas);
      selesai += 1;
      opsi.onProgres?.(selesai, total);
    }
  }

  const jumlahPekerja = Math.min(MAKS_BERSAMAAN, siap.length);
  await Promise.all(Array.from({ length: jumlahPekerja }, () => pekerja()));

  if (hasil.berhasil === 0) throw galatTerakhir ?? new Error("Gagal mengunggah foto");
  return hasil;
}
