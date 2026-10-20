const pesanError: Record<string, string> = {
  "auth/invalid-email": "Format email tidak valid.",
  "auth/missing-password": "Kata sandi wajib diisi.",
  "auth/user-disabled": "Akun ini dinonaktifkan. Hubungi admin.",
  "auth/user-not-found": "Akun tidak ditemukan. Periksa email atau daftar terlebih dahulu.",
  "auth/wrong-password": "Email atau kata sandi salah.",
  "auth/invalid-credential": "Email atau kata sandi salah.",
  "auth/email-already-in-use": "Email sudah terdaftar. Silakan masuk atau reset kata sandi.",
  "auth/weak-password": "Kata sandi terlalu lemah. Gunakan minimal 8 karakter.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
  "auth/popup-closed-by-user": "Proses masuk dengan Google dibatalkan.",
  "auth/popup-blocked": "Popup Google diblokir browser. Izinkan popup lalu coba lagi.",
  "auth/cancelled-popup-request": "Proses masuk dengan Google dibatalkan.",
  "auth/account-exists-with-different-credential":
    "Email ini sudah terdaftar dengan metode lain. Masuk memakai email dan kata sandi.",
  "auth/network-request-failed": "Koneksi gagal. Periksa jaringan Anda.",
  "auth/unauthorized-domain": "Domain ini belum diizinkan pada Firebase Authentication.",
  "auth/requires-recent-login": "Sesi Anda sudah lama. Silakan masuk kembali.",
  "auth/invalid-action-code": "Tautan verifikasi/reset sudah tidak berlaku.",
  "auth/expired-action-code": "Tautan verifikasi/reset sudah kedaluwarsa. Minta tautan baru.",
};

const pesanDefault = "Terjadi kesalahan. Silakan coba lagi.";

/** Terjemahkan kode error Firebase Auth menjadi pesan berbahasa Indonesia. */
export function pesanErrorAuth(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  if (pesanError[code]) return pesanError[code];

  if (error instanceof Error && error.message.startsWith("Firebase belum dikonfigurasi")) {
    return error.message;
  }

  return pesanDefault;
}
