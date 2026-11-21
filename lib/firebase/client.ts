import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Firebase hanya diinisialisasi bila seluruh env var wajib tersedia,
 * agar halaman auth tetap bisa dibuka (mode fallback) saat backend belum siap.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase belum dikonfigurasi. Lengkapi NEXT_PUBLIC_FIREBASE_* pada .env.local.");
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/**
 * Menetapkan penyimpanan sesi Firebase ke `localStorage` secara eksplisit.
 *
 * Dipakai sebelum proses masuk agar sesi bertahan setelah halaman dimuat ulang
 * ( nilai bawaan SDK dapat berbeda antar peramban/konteks). Halaman masuk dengan
 * opsi "Ingat saya" nonaktif tetap boleh menimpanya dengan `sessionPersistence`.
 */
export async function pastikanPersistensiAuth(): Promise<Auth> {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  return auth;
}

/**
 * Menunggu Firebase selesai memulihkan sesi dari penyimpanan lokal.
 *
 * Tanpa penantian ini, pembacaan `currentUser` tepat setelah halaman dimuat
 * ulang dapat mengembalikan `null` sesaat sehingga permintaan pertama ke backend
 * dikirim tanpa token dan pengguna tampak keluar sendiri.
 */
export async function tungguSesiFirebase(): Promise<Auth | null> {
  if (!isFirebaseConfigured) return null;
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  return auth;
}
