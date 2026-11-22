/**
 * Kamus terjemahan antarmuka aplikasi (autentikasi, checkout, dashboard mitra).
 *
 * Kunci kamus adalah teks Indonesia apa adanya sehingga komponen cukup memanggil
 * `t("Masuk")` tanpa memindahkan teks ke konstanta terpisah. Teks yang belum
 * memiliki padanan Inggris otomatis tampil dalam bahasa Indonesia (fallback
 * aman), sehingga terjemahan dapat ditambah bertahap tanpa risiko teks kosong.
 *
 * Nilai dinamis disisipkan lewat placeholder `{nama}`.
 */

import { BAHASA_BAWAAN, type Bahasa } from "@/lib/bahasa";

/** Pasangan nilai untuk placeholder `{kunci}` pada sebuah teks. */
export type NilaiTerjemah = Record<string, string | number>;

/** Padanan bahasa Inggris untuk teks antarmuka aplikasi. */
const EN: Record<string, string> = {
  /* ------------------------------------------------------------- Umum -- */
  Masuk: "Sign in",
  Keluar: "Sign out",
  Simpan: "Save",
  Batal: "Cancel",
  "Daftar akun": "Create account",
  "Profil Saya": "My profile",
  Pengaturan: "Settings",
  Dashboard: "Dashboard",
  "Favorit Saya": "My favorites",
  "Daftar Sebagai Mitra": "Register as Partner",
  "Akun Saya": "My account",
  "Perbarui identitas akun Anda dan lihat properti yang tersimpan.":
    "Update your account identity and view your saved properties.",
  "Kembali ke beranda": "Back to home",
  "Ganti bahasa": "Switch language",
  "Platform Listing Properti": "Property Listing Platform",
  "Masuk sebagai": "Signed in as",
  "Sembunyikan kata sandi": "Hide password",
  "Tampilkan kata sandi": "Show password",
  Tutup: "Close",
  "Tutup menu": "Close menu",

  /* ------------------------------------------------- Autentikasi masuk -- */
  "Masuk ke akun Anda": "Sign in to your account",
  "Kelola properti, langganan, dan prospek Anda dalam satu dashboard.":
    "Manage your properties, subscription, and leads in one dashboard.",
  Email: "Email",
  "Kata sandi": "Password",
  "Ingat saya": "Remember me",
  "Lupa kata sandi?": "Forgot password?",
  atau: "or",
  "Masuk dengan Google": "Sign in with Google",
  "Lanjutkan dengan Google": "Continue with Google",
  "Belum punya akun?": "Don't have an account?",
  "Ingin memasarkan properti?": "Want to market a property?",
  "Daftar sebagai mitra untuk mengisi data badan usaha, memilih paket, dan mulai memasang listing di katalog.":
    "Register as a partner to fill in your business details, choose a plan, and start listing in the catalog.",
  "Format email tidak valid": "Invalid email format",
  "Kata sandi minimal 8 karakter": "Password must be at least 8 characters",
  "Minimal 8 karakter": "At least 8 characters",
  "Berhasil masuk": "Signed in successfully",
  "Mengalihkan ke dashboard Anda...": "Redirecting to your dashboard...",
  "Gagal masuk": "Sign in failed",
  "Gagal menyiapkan sesi": "Failed to prepare session",
  "Gagal masuk dengan Google": "Failed to sign in with Google",

  /* ----------------------------------------------- Autentikasi pendaftaran -- */
  "Buat akun ENM Property. Setelah masuk, Anda dapat mendaftar sebagai mitra dan memilih paket langganan.":
    "Create an ENM Property account. Once signed in, you can register as a partner and choose a subscription plan.",
  "Nama lengkap": "Full name",
  "Saya menyetujui syarat dan ketentuan serta kebijakan privasi ENM Property.":
    "I agree to ENM Property's terms and conditions and privacy policy.",
  "Buat akun": "Create account",
  "Sudah punya akun?": "Already have an account?",
  "Nama minimal 3 karakter": "Name must be at least 3 characters",
  "Nama maksimal 100 karakter": "Name must be at most 100 characters",
  "Anda harus menyetujui syarat dan ketentuan": "You must agree to the terms and conditions",
  "Gagal mendaftar": "Registration failed",
  "Pendaftaran berhasil": "Registration successful",
  "Akun Anda dibuat. Pilih paket langganan untuk mulai memasang properti.":
    "Your account is created. Choose a subscription plan to start listing properties.",

  /* --------------------------------------------- Panel brand autentikasi -- */
  "Kelola listing properti Anda dari satu dashboard.":
    "Manage your property listings from a single dashboard.",
  "Daftar & pilih paket": "Register & choose a plan",
  "Buat akun mitra lalu pilih paket langganan sesuai kebutuhan listing.":
    "Create a partner account and choose a subscription plan that fits your listing needs.",
  "Unggah properti": "Upload properties",
  "Lengkapi data properti, foto, dan harga sewa dalam satu formulir.":
    "Complete the property details, photos, and rental price in one form.",
  "Terima leads": "Receive leads",
  "Pantau performa listing dan tindak lanjuti calon penyewa.":
    "Track listing performance and follow up with prospective renters.",
  "Seluruh harga dalam Rupiah (IDR) dan waktu WIB.":
    "All prices are in Rupiah (IDR) and times are in WIB.",
  "Firebase belum dikonfigurasi. Lengkapi": "Firebase is not configured. Complete",
  pada: "in",
  "sebelum melanjutkan.": "before continuing.",

  /* ---------------------------------------------------- Checkout paket -- */
  "Checkout Langganan": "Subscription Checkout",
  "Checkout Paket": "Package Checkout",
  "Tinjau paket yang Anda pilih sebelum melanjutkan pembayaran.":
    "Review the plan you selected before continuing to payment.",
  "Paket langganan mitra ENM Property.": "ENM Property partner subscription plan.",
  "Paket langganan mitra.": "Partner subscription plan.",
  Gratis: "Free",
  Durasi: "Duration",
  "Kuota listing": "Listing quota",
  "Level paket": "Plan level",
  "Boost katalog": "Catalog boost",
  "Akses keyword": "Keyword access",
  "Akses katalog": "Catalog access",
  "Akses nomor WA": "WhatsApp access",
  "Level {level}": "Level {level}",
  "{n} hari": "{n} days",
  "Tanpa batas": "Unlimited",
  "{n} listing": "{n} listings",
  Aktif: "Active",
  "Tidak termasuk": "Not included",
  Tersedia: "Available",
  "Tidak tersedia": "Not available",
  "Masuk untuk melanjutkan": "Sign in to continue",
  "Anda perlu masuk untuk menyetujui perjanjian kemitraan dan melanjutkan pembayaran.":
    "You need to sign in to approve the partnership agreement and continue with payment.",
  "Lengkapi data mitra dulu": "Complete your partner details first",
  "Sebelum berlangganan, Anda perlu mengisi data badan usaha lewat pendaftaran mitra. Setelah itu Anda otomatis kembali ke halaman ini untuk menyelesaikan pembayaran.":
    "Before subscribing, you need to fill in your business details through partner registration. Afterwards you will return here automatically to complete the payment.",
  "Perjanjian & Konfirmasi": "Agreement & Confirmation",
  "Perjanjian kemitraan wajib disetujui sebelum pembayaran paket.":
    "The partnership agreement must be approved before paying for a plan.",
  "Perjanjian kemitraan wajib disetujui sebelum mengaktifkan paket Gratis.":
    "The partnership agreement must be approved before activating the Free plan.",
  "Centang setiap poin berikut untuk melanjutkan":
    "Check each item below to continue",
  "Saya menyetujui perjanjian kemitraan ENM Property.":
    "I agree to the ENM Property partnership agreement.",
  "Perjanjian akan tercatat saat Anda melanjutkan.":
    "The agreement will be recorded when you continue.",
  "Anda harus menyetujui perjanjian kemitraan terlebih dahulu":
    "You must approve the partnership agreement first",
  "Versi {versi}": "Version {versi}",
  "Aktifkan Paket Gratis": "Activate Free Plan",
  "Paket Gratis langsung aktif tanpa biaya. Perjanjian kemitraan akan diminta saat Anda pertama kali masuk dashboard mitra.":
    "The Free plan activates instantly at no cost. The partnership agreement will be requested when you first enter the partner dashboard.",
  "Aktifkan paket": "Activate plan",
  "Lanjut ke pembayaran": "Continue to payment",
  "Gagal memuat paket": "Failed to load plan",
  "Gagal memuat data konfirmasi": "Failed to load confirmation data",
  "Muat ulang halaman untuk mencoba lagi.": "Reload the page to try again.",
  "Paket aktif": "Active plan",
  "Paket {nama} langsung aktif tanpa biaya.": "The {nama} plan is now active at no cost.",
  "Pesanan dibuat": "Order created",
  "Lanjutkan pembayaran melalui Midtrans.": "Continue payment via Midtrans.",

  /* ------------------------------------------------------- Navigasi mitra -- */
  Ringkasan: "Overview",
  "Properti Saya": "My Properties",
  "Tambah Properti": "Add Property",
  "Langganan & Akun": "Subscription & Account",
  "Paket & Langganan": "Plans & Subscription",
  Transaksi: "Transactions",
  Favorit: "Favorites",
  "Profil Mitra": "Partner Profile",
  Performa: "Performance",
  "Statistik Properti": "Property Statistics",
  "Riwayat Pembayaran": "Payment History",
  "Panel Mitra": "Partner Panel",
  Mitra: "Partner",

  /* ------------------------------------------------- Navigasi admin & owner -- */
  "Panel Admin": "Admin Panel",
  "Panel Owner": "Owner Panel",
  Admin: "Admin",
  Owner: "Owner",
  Monitoring: "Monitoring",
  Pemantauan: "Monitoring",
  "Katalog Properti": "Property Catalog",
  "Manajemen Mitra": "Partner Management",
  Langganan: "Subscription",
  "Katalog Paket": "Plan Catalog",
  "Laporan Langganan": "Subscription Report",
  "Laporan Mitra": "Partner Report",
  Konten: "Content",
  "Landing Page": "Landing Page",
  Superadmin: "Superadmin",
  "Manajemen Akun": "Account Management",
  "Master Kategori": "Category Master",
  "Master Fasilitas": "Facility Master",
  "Versi Perjanjian": "Agreement Versions",
  "Audit Log": "Audit Log",
  "Pengaturan Sistem": "System Settings",
  Kepatuhan: "Compliance",

  /* ------------------------------------------------------ Dashboard shell -- */
  "Menu navigasi {tagline}": "Navigation menu {tagline}",
  "Buka menu navigasi": "Open navigation menu",
  "Cari properti, mitra, invoice...": "Search properties, partners, invoices...",
  Cari: "Search",
  Notifikasi: "Notifications",
  "Menu akun": "Account menu",
  "Menu akun {nama}": "Account menu {nama}",

  /* -------------------------------------------------------- Ringkasan mitra -- */
  "Ringkasan Mitra": "Partner Overview",
  "Memuat performa listing Anda...": "Loading your listing performance...",
  "Gagal memuat ringkasan mitra": "Failed to load partner overview",
  "Pantau performa listing dan status paket {nama}.":
    "Track listing performance and plan status for {nama}.",
  "Akun mitra Anda sedang ditangguhkan. Hubungi admin untuk informasi lebih lanjut.":
    "Your partner account is suspended. Contact the admin for more information.",
  "Tayangan Listing": "Listing Views",
  "Leads WhatsApp": "WhatsApp Leads",
  "Sisa Kuota Listing": "Remaining Listing Quota",
  "{n} menunggu review": "{n} awaiting review",
  "{n} listing tayang": "{n} listings live",
  "Total kontak masuk": "Total incoming contacts",
  "Paket {nama}": "Plan {nama}",
  "Belum ada paket aktif": "No active plan yet",
  "Status Katalog Anda": "Your Catalog Status",
  "{n} properti terdaftar": "{n} properties registered",
  "Belum Ada Paket": "No Plan Yet",
  "Pilih paket langganan untuk mulai menayangkan properti Anda.":
    "Choose a subscription plan to start publishing your properties.",
  "Favorit penyewa": "Renter favorites",
  "Listing terpakai": "Listings used",
  "Pilih Paket": "Choose Plan",
  "Properti Terbaru": "Latest Properties",
  "Properti yang Anda ajukan ke katalog": "Properties you submitted to the catalog",
  "Lihat semua": "View all",
  Properti: "Property",
  Status: "Status",
  Tayangan: "Views",
  Diajukan: "Submitted",

  /* --------------------------------------------------------- Kartu langganan -- */
  "Paket Aktif": "Active Plan",
  "Sisa {n} hari · berakhir {tgl}": "{n} days left · ends {tgl}",
  "Berakhir {tgl}": "Ends {tgl}",
  " (tanpa batas)": " (unlimited)",
  "Masa aktif paket Anda tersisa {n} hari. Perpanjang sekarang agar listing tetap tayang tanpa jeda.":
    "Your plan has {n} days left. Renew now so your listings stay live without interruption.",
  "Masa aktif berakhir {tgl}.": "The active period ends {tgl}.",
  "Kelola Langganan": "Manage Subscription",

  /* ----------------------------------------------------- Halaman langganan -- */
  "Kelola paket aktif dan pilih paket baru untuk menayangkan lebih banyak properti.":
    "Manage your active plan and choose a new one to publish more properties.",
  "Gagal memuat langganan": "Failed to load subscription",
  "Belum berlangganan": "Not subscribed yet",
  "Anda belum memiliki paket aktif. Pilih salah satu paket di bawah untuk mulai menayangkan properti.":
    "You don't have an active plan yet. Choose one of the plans below to start publishing properties.",
  "Perjanjian Kemitraan": "Partnership Agreement",
  "Perjanjian wajib disetujui sebelum melakukan pembayaran paket.":
    "The agreement must be approved before paying for a plan.",
  Disetujui: "Approved",
  "Belum disetujui": "Not approved",
  "Gagal memuat perjanjian": "Failed to load agreement",
  "Poin yang disetujui": "Approved points",
  "Disetujui pada {tgl} WIB.": "Approved on {tgl} WIB.",
  "Perjanjian akan diminta saat Anda pertama kali masuk dashboard mitra.":
    "The agreement will be requested when you first enter the partner dashboard.",
  "Gagal memuat daftar paket": "Failed to load plan list",
  "Ringkasan Paket": "Plan Summary",
  "Rincian kuota dan masa berlaku paket aktif Anda.":
    "Details of your active plan's quota and validity period.",
  "Nama paket": "Plan name",
  Mulai: "Start",
  Berakhir: "Ends",
  "Sisa hari": "Days left",
  Kuota: "Quota",
  "Kode order terakhir": "Last order code",
  "Paket Anda": "Your plan",
  "Kuota tanpa batas": "Unlimited quota",
  "Pilih paket": "Choose plan",
  "Status Pesanan": "Order Status",
  "Kode order {kode}": "Order code {kode}",
  "Mode simulasi": "Simulation mode",
  "Backend menjalankan transaksi dalam mode simulasi. Gunakan tautan pembayaran di bawah untuk menyelesaikan pesanan.":
    "The backend is running the transaction in simulation mode. Use the payment link below to complete the order.",
  Paket: "Plan",
  Jumlah: "Amount",
  Dibuat: "Created",
  Kedaluwarsa: "Expires",
  "Buka halaman pembayaran": "Open payment page",
  "Periksa status": "Check status",
  Selesai: "Done",
  "Pembayaran berhasil. Paket {nama} kini aktif dan kuota listing Anda telah diperbarui.":
    "Payment successful. The {nama} plan is now active and your listing quota has been updated.",
  "Periksa status secara berkala hingga pembayaran terkonfirmasi.":
    "Check the status periodically until the payment is confirmed.",
  "Backend mengembalikan transaksi simulasi. Selesaikan lewat tautan pembayaran di bawah.":
    "The backend returned a simulated transaction. Complete it via the payment link below.",
  "Token pembayaran tidak tersedia": "Payment token unavailable",
  "Backend tidak mengembalikan Snap Token.": "The backend did not return a Snap Token.",
  "Pembayaran berhasil": "Payment successful",
  "Paket langganan Anda sedang diaktifkan.": "Your subscription plan is being activated.",
  "Pembayaran menunggu penyelesaian": "Payment awaiting completion",
  "Selesaikan sesuai instruksi.": "Complete it as instructed.",
  "Pembayaran gagal": "Payment failed",
  "Transaksi ditolak oleh Midtrans.": "The transaction was rejected by Midtrans.",
  "Bayar dengan Midtrans": "Pay with Midtrans",
  "atau pilih metode manual": "or choose a manual method",
  "Gagal membuka halaman pembayaran": "Failed to open the payment page",

  /* ---------------------------------------------------- Dialog & modal -- */
  "Konfirmasi paket {nama}": "Confirm plan {nama}",
  "Paket gratis akan langsung aktif setelah dikonfirmasi.":
    "The free plan will activate immediately after confirmation.",
  "Anda akan diarahkan ke halaman pembayaran Midtrans.":
    "You will be redirected to the Midtrans payment page.",
  Biaya: "Cost",
  "Persetujuan Anda sebelumnya tetap berlaku.": "Your previous approval remains valid.",
  "Setujui perjanjian kemitraan versi {versi} untuk mulai mengelola properti.":
    "Approve partnership agreement version {versi} to start managing properties.",
  "Setujui perjanjian": "Approve agreement",

  /* -------------------------------------------------------- Label status -- */
  Draft: "Draft",
  Draf: "Draft",
  "Menunggu review": "Pending review",
  Tayang: "Live",
  Nonaktif: "Inactive",
  "Menunggu verifikasi": "Pending verification",
  Ditangguhkan: "Suspended",
  Menunggu: "Pending",
  Berhasil: "Successful",
  Gagal: "Failed",
  Dibatalkan: "Cancelled",

  /* ------------------------------------------------------ Keadaan konten -- */
  "Belum ada data": "No data yet",
  "Gagal memuat data": "Failed to load data",
  "Coba lagi": "Try again",

  /* -------------------------------------------------- Komponen bersama -- */
  Beranda: "Home",
  Semua: "All",
  "Cari...": "Search...",
  Salin: "Copy",
  Tersalin: "Copied",
  "Tersalin ke papan klip": "Copied to clipboard",
  Konfirmasi: "Confirm",
  "Aksi baris": "Row actions",
  "Kode QR pembayaran": "Payment QR code",
  "Memuat sesi...": "Loading session...",
  Menampilkan: "Showing",
  dari: "of",
  "Halaman sebelumnya": "Previous page",
  "Halaman berikutnya": "Next page",
  "Halaman {nomor}": "Page {nomor}",

  /* -------------------------------------------------- Dialog ubah status -- */
  "Pilih status terlebih dahulu": "Select a status first",
  "Alasan maksimal 255 karakter": "Reason must be at most 255 characters",
  "Status baru": "New status",
  Alasan: "Reason",
  "Perbarui status": "Update status",
  "Pilih status": "Select status",
  "Opsional, akan dicatat pada audit log.": "Optional, it will be recorded in the audit log.",

  /* ---------------------------------------------------------- Audit log -- */
  "Jejak seluruh tindakan administratif yang tercatat pada platform.":
    "A trail of all administrative actions recorded on the platform.",
  "Menyiapkan berkas...": "Preparing file...",
  "Berkas audit berhasil diunduh": "Audit file downloaded successfully",
  "Gagal mengunduh berkas audit": "Failed to download audit file",
  "Cari aktor, entitas, atau catatan...": "Search actor, entity, or note...",
  catatan: "records",
  Waktu: "Time",
  Aktor: "Actor",
  Peran: "Role",
  Aksi: "Action",
  Entitas: "Entity",
  Catatan: "Note",
  "Belum ada catatan audit": "No audit records yet",
  "Aktivitas administratif akan tercatat di sini secara otomatis.":
    "Administrative activity will be recorded here automatically.",

  /* ------------------------------------------------------ Ringkasan admin -- */
  "Monitoring Platform": "Platform Monitoring",
  "Ringkasan katalog properti, mitra, dan langganan platform.":
    "Overview of the property catalog, partners, and platform subscriptions.",
  "Kelola Mitra": "Manage Partners",
  "Total Properti": "Total Properties",
  "{n} tayang": "{n} live",
  "Mitra Aktif": "Active Partners",
  "{n} ditangguhkan": "{n} suspended",
  "Langganan Berjalan": "Ongoing Subscriptions",
  "{n} segera berakhir": "{n} expiring soon",
  "Pendapatan Bulan Ini": "Revenue This Month",
  "Total {nilai}": "Total {nilai}",
  "Status Katalog": "Catalog Status",
  "Metrik Interaksi": "Interaction Metrics",
  "Akumulasi seluruh properti": "Accumulation across all properties",
  "Tayangan properti": "Property views",
  "Kontak WhatsApp": "WhatsApp contacts",
  "Order tercatat": "Orders recorded",
  "Order berhasil": "Successful orders",
  "Langganan Terbaru": "Latest Subscriptions",
  "Transaksi pembayaran paket dari mitra": "Plan payment transactions from partners",
  "Gagal memuat ringkasan platform": "Failed to load platform overview",
  "Kode Order": "Order Code",
  Tanggal: "Date",

  /* ------------------------------------------------- Kolom tabel bersama -- */
  Dibayar: "Paid",
  Wilayah: "Region",
  Kontak: "Contacts",

  /* -------------------------------------------------- Editor poin ceklis -- */
  "Tulis satu poin perjanjian...": "Write one agreement point...",
  "Belum ada poin ceklis. Mitra hanya menyetujui perjanjian secara umum.":
    "No checklist points yet. The partner only approves the agreement in general.",
  "Poin {nomor}": "Point {nomor}",
  "Hapus poin {nomor}": "Remove point {nomor}",
  "Tambah poin": "Add point",

  /* ---------------------------------------------------------- Profil akun -- */
  "Nomor telepon 8-20 digit": "Phone number must be 8-20 digits",
  "Identitas Akun": "Account Identity",
  "Perbarui nama tampilan dan nomor telepon Anda.": "Update your display name and phone number.",
  "Nomor telepon": "Phone number",
  "Opsional, 8-20 digit.": "Optional, 8-20 digits.",
  "Simpan perubahan": "Save changes",
  "Informasi Akun": "Account Information",
  "Data ini hanya dapat diubah oleh superadmin.": "This data can only be changed by a superadmin.",
  "Terakhir masuk": "Last sign-in",
  "Belum pernah": "Never",
  Terdaftar: "Registered",
  "Email terverifikasi": "Email verified",
  "Email belum terverifikasi": "Email not verified",
  "Kelola informasi akun dan keamanan Anda.": "Manage your account information and security.",
  "Gagal memuat profil": "Failed to load profile",
  "Keamanan Akun": "Account Security",
  "Kelola cara Anda masuk ke akun ini.": "Manage how you sign in to this account.",
  "Akun ini sudah dapat masuk memakai email & kata sandi maupun Google.":
    "This account can already sign in with email & password or Google.",
  "Akun ini masuk melalui Google. Buat kata sandi agar Anda juga dapat masuk memakai email dan kata sandi.":
    "This account signs in with Google. Create a password so you can also sign in with email and password.",
  "Kata sandi baru": "New password",
  "Ulangi kata sandi baru": "Repeat new password",
  "Buat kata sandi": "Create password",
  "Ulangi kata sandi tidak sama": "Password confirmation does not match",
  "Kata sandi dibuat": "Password created",
  "Anda kini dapat masuk memakai email dan kata sandi.":
    "You can now sign in with email and password.",
  "Tautkan akun Google agar Anda juga dapat masuk memakai Google.":
    "Link a Google account so you can also sign in with Google.",
  "Tautkan Google": "Link Google",
  "Google tertaut": "Google linked",
  "Anda kini dapat masuk memakai Google.": "You can now sign in with Google.",
  "Email sudah terdaftar": "Email already registered",
  "Akun dengan email ini memakai metode masuk lain. Masuk memakai metode tersebut, lalu tautkan Google dari halaman Profil Saya.":
    "An account with this email uses a different sign-in method. Sign in with that method, then link Google from the My Profile page.",

  /* ------------------------------------------------------- Properti mitra -- */
  "Jumlah unit wajib diisi": "Number of units is required",
  "Harus berupa angka": "Must be a number",
  "Ubah ketersediaan unit": "Update unit availability",
  "Unit tersedia": "Units available",
  "Jumlah unit yang masih dapat dipasarkan.":
    "Number of units still available for listing.",
  "Klik WhatsApp": "WhatsApp clicks",
  "Isi Form": "Form submissions",
  "Gagal memuat lead": "Failed to load leads",
  "Belum ada lead": "No leads yet",
  "Belum ada pengunjung yang menekan tombol WhatsApp pada properti ini.":
    "No visitor has pressed the WhatsApp button on this property yet.",
  "Belum ada pengunjung yang mengirim form kontak pada properti ini.":
    "No visitor has submitted the contact form on this property yet.",
  Pengunjung: "Visitor",
  Login: "Login",
  "Telp: {nomor}": "Phone: {nomor}",
  Unggulan: "Featured",
  "s.d. {tanggal}": "until {tanggal}",
  Harga: "Price",
  "Klik WA": "WA clicks",
  "Ubah properti": "Edit property",
  "Nonaktifkan boost": "Disable boost",
  "Aktifkan boost": "Enable boost",
  "Ubah status": "Update status",
  "Ubah ketersediaan": "Update availability",
  Hapus: "Delete",
  "Kelola listing properti, boost unggulan, status tayang, dan ketersediaan unit.":
    "Manage property listings, featured boosts, live status, and unit availability.",
  "Review katalog": "Review catalog",
  "Cari judul atau kota...": "Search title or city...",
  Penawaran: "Listing type",
  "Belum ada properti": "No properties yet",
  "Tambahkan properti pertama Anda untuk mulai menayangkan listing.":
    "Add your first property to start publishing listings.",
  "Ubah status properti": "Update property status",
  "Hapus properti": "Delete property",
  'Properti "{judul}" akan dihapus dari katalog. Tindakan ini tidak dapat dibatalkan.':
    'Property "{judul}" will be deleted from the catalog. This action cannot be undone.',
  properti: "properties",

  /* --------------------------------------------------- Formulir properti -- */
  "Simpan sebagai draf": "Save as draft",
  "Tayangkan sekarang": "Publish now",
  "Judul minimal 5 karakter": "Title must be at least 5 characters",
  "Judul maksimal 150 karakter": "Title must be at most 150 characters",
  "Deskripsi minimal 20 karakter": "Description must be at least 20 characters",
  "Deskripsi maksimal 5000 karakter": "Description must be at most 5000 characters",
  "Alamat wajib diisi": "Address is required",
  "Alamat maksimal 255 karakter": "Address must be at most 255 characters",
  "Kota wajib diisi": "City is required",
  "Kota maksimal 100 karakter": "City must be at most 100 characters",
  "Provinsi wajib diisi": "Province is required",
  "Provinsi maksimal 100 karakter": "Province must be at most 100 characters",
  "Kecamatan maksimal 100 karakter": "District must be at most 100 characters",
  "Lintang harus antara -90 dan 90": "Latitude must be between -90 and 90",
  "Bujur harus antara -180 dan 180": "Longitude must be between -180 and 180",
  "Harga wajib diisi": "Price is required",
  "Harga harus berupa angka": "Price must be a number",
  "{label} harus berupa angka": "{label} must be a number",
  "{label} maksimal {maks}": "{label} must be at most {maks}",
  "Fasilitas terlalu panjang": "Facilities text is too long",
  "Luas tanah": "Land area",
  "Luas bangunan": "Building area",
  "Kamar tidur": "Bedrooms",
  "Kamar mandi": "Bathrooms",
  "Jumlah unit": "Number of units",
  "Informasi dasar": "Basic information",
  "Judul dan deskripsi yang dilihat calon penyewa/pembeli.":
    "Title and description seen by prospective renters/buyers.",
  "Judul properti": "Property title",
  "Contoh: Rumah 2 Lantai Dekat Kampus": "Example: 2-Story House Near Campus",
  Deskripsi: "Description",
  "Minimal 20 karakter, jelaskan keunggulan properti.":
    "At least 20 characters, describe the property's highlights.",
  Klasifikasi: "Classification",
  "Jenis penawaran": "Listing type",
  "Jenis properti": "Property type",
  "Status penyimpanan": "Save status",
  Lokasi: "Location",
  Alamat: "Address",
  "Nama jalan, nomor": "Street name, number",
  Kecamatan: "District",
  "Kota/Kabupaten": "City/Regency",
  Provinsi: "Province",
  Lintang: "Latitude",
  Bujur: "Longitude",
  "Harga & ukuran": "Price & size",
  "Tanpa tanda titik atau koma.": "Without dots or commas.",
  "Periode harga": "Price period",
  "Pilih periode": "Select period",
  "Luas tanah (m²)": "Land area (m²)",
  "Luas bangunan (m²)": "Building area (m²)",
  "Isi bila properti memiliki beberapa unit.":
    "Fill in if the property has multiple units.",
  Fasilitas: "Facilities",
  "Pilih fasilitas dari daftar atau tambahkan fasilitas kustom dipisah koma.":
    "Select facilities from the list or add custom facilities separated by commas.",
  "Fasilitas kustom (opsional)": "Custom facilities (optional)",
  "Contoh: Smart Lock, Lift Barang": "Example: Smart Lock, Freight Lift",
  "Fasilitas yang dipilih dari daftar di atas otomatis masuk ke sini.":
    "Facilities selected from the list above are added here automatically.",
  Dijual: "For sale",
  Disewa: "For rent",
  Rumah: "House",
  Apartemen: "Apartment",
  Ruko: "Shophouse",
  Tanah: "Land",
  Kantor: "Office",
  Gudang: "Warehouse",
  Lainnya: "Other",
  "Per hari": "Per day",
  "Per bulan": "Per month",
  "Per tahun": "Per year",

  /* ---------------------------------------------- Formulir properti mitra -- */
  "Ubah Properti": "Edit Property",
  "Lengkapi data listing lalu simpan. Listing baru langsung tayang di katalog.":
    "Complete the listing details then save. New listings are published to the catalog immediately.",
  "Perbarui informasi listing, lalu simpan perubahan.":
    "Update the listing information, then save the changes.",
  Kembali: "Back",
  "Paket langganan diperlukan": "Subscription plan required",
  "Data ini diperbarui otomatis oleh sistem.":
    "This data is updated automatically by the system.",
  Diperbarui: "Updated",
  "Tips listing": "Listing tips",
  "Agar properti lebih cepat mendapat peminat.":
    "So your property attracts interest faster.",
  "Gunakan judul yang menyebut tipe properti dan lokasi.":
    "Use a title that mentions the property type and location.",
  "Isi luas tanah, luas bangunan, serta jumlah kamar bila ada.":
    "Fill in the land area, building area, and number of rooms if any.",
  "Pisahkan fasilitas dengan koma, contoh: Carport, Taman, Keamanan 24 jam.":
    "Separate facilities with commas, e.g. Carport, Garden, 24-hour Security.",
  "Pilih foto sebelum menyimpan; foto diunggah otomatis setelah properti tersimpan.":
    "Choose photos before saving; photos are uploaded automatically after the property is saved.",
  "Simpan properti": "Save property",
  "Gagal memuat properti": "Failed to load property",

  /* --------------------------------------------------------- Galeri foto -- */
  "Galeri Foto": "Photo Gallery",
  "{n} foto terunggah. Foto utama dipakai sebagai sampul listing.":
    "{n} photos uploaded. The primary photo is used as the listing cover.",
  "Mengunggah {selesai}/{total} foto…": "Uploading {selesai}/{total} photos…",
  "Unggah foto": "Upload photo",
  "Belum ada foto": "No photos yet",
  "Unggah minimal satu foto agar listing Anda lebih menarik calon penyewa maupun pembeli.":
    "Upload at least one photo to make your listing more appealing to prospective renters and buyers.",
  Utama: "Primary",
  "Jadikan foto utama": "Set as primary photo",
  "Hapus foto": "Delete photo",
  "Foto akan dihapus permanen dari listing ini.":
    "The photo will be permanently deleted from this listing.",
  "Foto Properti": "Property Photos",
  "Pilih hingga {maksimal} foto. Foto pertama menjadi sampul listing.":
    "Choose up to {maksimal} photos. The first photo becomes the listing cover.",
  "Pilih foto": "Choose photos",
  "Belum ada foto dipilih. Foto akan diunggah otomatis setelah properti tersimpan.":
    "No photos selected yet. Photos will be uploaded automatically after the property is saved.",
  Sampul: "Cover",
  "Foto {n}": "Photo {n}",
  "Foto KTP": "ID Card Photo",
  "Foto KTP mitra": "Partner ID card photo",
  "Unduh foto KTP": "Download ID card photo",
  "Foto KTP belum diunggah.": "The ID card photo has not been uploaded.",
  "Unggah foto KTP pemilik atau penanggung jawab. Format JPG, PNG, atau WEBP, maksimal 5 MB.":
    "Upload the ID card photo of the owner or person in charge. JPG, PNG, or WEBP format, max 5 MB.",
  "Ganti foto": "Change photo",
  "Pilih foto KTP": "Choose ID card photo",
  "Belum ada foto KTP dipilih. Foto KTP wajib diunggah saat pendaftaran mitra.":
    "No ID card photo selected yet. An ID card photo is required when registering as a partner.",
  "Pratinjau foto KTP": "ID card photo preview",
  "Hapus foto KTP": "Delete ID card photo",
  "Foto KTP wajib diunggah": "ID card photo is required",
  "Unggah foto KTP sebelum melanjutkan pendaftaran.":
    "Upload an ID card photo before continuing the registration.",

  /* --------------------------------------------------- Kartu properti -- */
  "Lihat detail {judul}": "View details {judul}",
  "Tanpa foto": "No photo",
  "{n} kamar": "{n} beds",
  "{n} mandi": "{n} baths",
  "Lihat detail": "View details",

  /* --------------------------------------------------------- Favorit -- */
  "Tersimpan di favorit": "Saved to favorites",
  "Simpan ke favorit": "Save to favorites",
  "Hapus dari favorit": "Remove from favorites",

  /* --- Transaksi mitra --- */
  "Riwayat transaksi langganan beserta status pembayarannya.":
    "Subscription transaction history along with their payment status.",
  "Status Pembayaran": "Payment status",
  Baru: "New",
  Perpanjangan: "Renewal",
  Peningkatan: "Upgrade",
  "Bayar sekarang": "Pay now",
  "Bayar Sekarang": "Payment Now",
  Jenis: "Type",
  "Cari kode order atau paket...": "Search order code or plan...",
  transaksi: "transactions",
  "Belum ada transaksi": "No transactions yet",
  "Transaksi langganan akan muncul setelah Anda melakukan pembayaran paket.":
    "Subscription transactions will appear after you make a plan payment.",
  "Detail Transaksi": "Transaction Detail",
  "Status pembayaran dan rincian transaksi langganan Anda.":
    "Payment status and details of your subscription transaction.",
  "Gagal memuat transaksi": "Failed to load transaction",
  "untuk mitra {nama}.": "for partner {nama}.",
  Penyedia: "Provider",
  "Dibayar pada": "Paid at",
  "telah aktif dan kuota listing Anda sudah diperbarui.":
    "is now active and your listing quota has been updated.",
  "Pembayaran tidak berhasil": "Payment unsuccessful",
  "Transaksi ini berstatus {status}.": "This transaction has the status {status}.",
  "Anda dapat mengulang pembayaran dari halaman Paket & Langganan.":
    "You can retry the payment from the Plans & Subscription page.",
  "Hubungi dukungan bila Anda merasa telah melakukan pembayaran.":
    "Contact support if you believe you have already paid.",
  "Menunggu pembayaran": "Awaiting payment",
  "Selesaikan pembayaran melalui Midtrans. Halaman ini akan diperbarui otomatis setelah pembayaran terkonfirmasi.":
    "Complete the payment via Midtrans. This page will update automatically once the payment is confirmed.",
  "Unduh invoice": "Download invoice",
  "Pilih paket lagi": "Choose a plan again",
  "Transaksi berstatus {status}.": "The transaction has the status {status}.",

  /* --- Statistik mitra --- */
  "Memuat statistik listing Anda...": "Loading your listing statistics...",
  "Gagal memuat statistik properti": "Failed to load property statistics",
  "Performa listing dan interaksi katalog {nama}.":
    "Listing performance and catalog interaction for {nama}.",
  "Kelola Properti": "Manage Properties",
  Unit: "Units",
  "{n} masih draf": "{n} still in draft",
  "Favorit Penyewa": "Renter Favorites",
  "Properti yang disimpan pengunjung": "Properties saved by visitors",
  "Distribusi Status": "Status Distribution",
  "{n} properti terdaftar pada katalog Anda": "{n} properties registered in your catalog",
  "Penggunaan Kuota": "Quota Usage",
  "Sisa {n} slot listing.": "{n} listing slots left.",
  "Paket tanpa batas kuota listing.": "Plan with unlimited listing quota.",
  "Properti tayang": "Live properties",
  "Properti draf": "Draft properties",
  "Performa Properti Terbaru": "Latest Property Performance",
  "Tayangan dan ketersediaan unit per listing": "Views and unit availability per listing",

  /* --- Favorit mitra --- */
  "Daftar properti yang Anda simpan untuk ditinjau kembali.":
    "The list of properties you saved to review again.",
  "Fitur favorit khusus akun customer": "Favorites feature is for customer accounts only",
  "Backend hanya mengizinkan peran": "The backend only allows the",
  "untuk menyimpan properti favorit. Jelajahi katalog properti terlebih dahulu, lalu simpan listing yang diminati melalui akun customer.":
    "role to save favorite properties. Browse the property catalog first, then save the listings you like through a customer account.",
  "Lihat Properti Saya": "View My Properties",
  "Gagal memuat favorit": "Failed to load favorites",
  favorit: "favorites",
  Disimpan: "Saved",
  "Belum ada favorit": "No favorites yet",
  "Properti yang Anda simpan akan tampil di sini.": "Properties you save will appear here.",
  'Properti "{judul}" akan dihapus dari daftar favorit Anda.':
    'Property "{judul}" will be removed from your favorites list.',
  "Properti ini akan dihapus dari daftar favorit Anda.":
    "This property will be removed from your favorites list.",

  /* --- Pembayaran mitra --- */
  "Langganan Saat Ini": "Current Subscription",
  "Status paket yang sedang aktif pada akun mitra Anda.":
    "The status of the plan currently active on your partner account.",
  Item: "Item",
  Kuantitas: "Quantity",
  "Harga Satuan": "Unit Price",
  Total: "Total",
  Subtotal: "Subtotal",
  "Gagal memuat invoice": "Failed to load invoice",
  Invoice: "Invoice",
  "Kode order": "Order code",
  "Unduh PDF": "Download PDF",
  Diterbitkan: "Issued",
  Metode: "Method",
  "Berlaku hingga": "Valid until",
  "Tanpa biaya": "No charge",
  "Menyiapkan invoice...": "Preparing invoice...",
  "Invoice berhasil diunduh": "Invoice downloaded successfully",
  "Gagal mengunduh invoice": "Failed to download invoice",
  "Tinjau tagihan langganan dan unduh invoice pembayaran Anda.":
    "Review your subscription bills and download your payment invoices.",
  "Gagal memuat data langganan": "Failed to load subscription data",
  "Belum ada riwayat pembayaran": "No payment history yet",
  "Invoice pembayaran akan muncul setelah Anda berlangganan paket berbayar.":
    "Payment invoices will appear after you subscribe to a paid plan.",
  "Belum ada invoice": "No invoice yet",
  "Paket gratis tidak menghasilkan invoice. Invoice akan tersedia saat Anda melakukan pembayaran paket berbayar.":
    "The free plan does not generate an invoice. Invoices will be available once you pay for a paid plan.",

  /* --- Pembayaran order mitra --- */
  "Pembayaran": "Payment",
  "Pembayaran Langganan": "Subscription Payment",
  "Selesaikan pembayaran paket Anda melalui Midtrans.":
    "Complete your plan payment via Midtrans.",
  "Kanal pembayaran belum tersedia": "Payment channel unavailable",
  "Kanal pembayaran belum tersedia. Muat ulang halaman ini beberapa saat lagi.":
    "The payment channel is not available yet. Reload this page in a moment.",
  "Pembayaran berhasil dikirim": "Payment successfully submitted",
  "Kami sedang memeriksa status pembayaran Anda. Jika jendela pembayaran masih terbuka, tutup jendela tersebut untuk melihat status terbaru.":
    "We are checking your payment status. If the payment window is still open, close it to see the latest status.",
  "Tutup jendela pembayaran": "Close payment window",
  "Gagal memuat data pembayaran": "Failed to load payment data",
  "Selesaikan pembayaran paket melalui Midtrans.":
    "Complete your plan payment via Midtrans.",
  "Lihat Transaksi": "View Transaction",
  "Pembayaran Berhasil": "Payment Successful",
  "Paket Anda aktif": "Your plan is active",
  "Pembayaran telah terkonfirmasi. Paket langganan":
    "The payment has been confirmed. The subscription plan",
  "kini aktif dan kuota listing Anda sudah diperbarui. Lengkapi profil kemitraan Anda agar listing dapat tayang di katalog.":
    "is now active and your listing quota has been updated. Complete your partner profile so your listings can go live in the catalog.",
  "Jumlah dibayar": "Amount paid",
  "Lengkapi Profil Mitra": "Complete Partner Profile",
  "Kembali ke Langganan": "Back to Subscription",

  /* --- Profil mitra --- */
  "Lengkapi data badan usaha dan informasi akun kemitraan Anda.":
    "Complete your business details and partnership account information.",
  "Gagal memuat profil mitra": "Failed to load partner profile",
  "Status Kemitraan": "Partnership Status",
  "Status akun mitra Anda.": "Your partner account status.",
  "Mitra sejak": "Partner since",
  Perjanjian: "Agreement",
  "Disetujui {tgl}": "Approved {tgl}",
  "Alasan penangguhan: ": "Suspension reason: ",
  "Perjanjian kemitraan Anda telah tercatat dan berlaku.":
    "Your partnership agreement has been recorded and is in effect.",
  "Data Badan Usaha": "Business Details",
  "Informasi ini tampil pada halaman properti dan kontak calon penyewa.":
    "This information appears on the property page and in prospective renter contacts.",
  "Simpan data": "Save data",
  "Perbarui nama tampilan dan nomor telepon akun Anda.":
    "Update your account's display name and phone number.",

  /* --- Formulir data mitra --- */
  "Data badan usaha": "Business details",
  "Nama bisnis / agensi": "Business / agency name",
  "Contoh: Griya Utama Property": "Example: Griya Utama Property",
  "Nama penanggung jawab": "Person in charge",
  "Nomor WhatsApp": "WhatsApp number",
  "Dikelola sistem. Calon penyewa/pembeli diarahkan ke nomor ini karena paket Anda belum mendukung nomor WhatsApp sendiri.":
    "Managed by the system. Prospective renters/buyers are directed to this number because your plan does not yet support your own WhatsApp number.",
  "Email bisnis": "Business email",
  opsional: "optional",
  "Jalan, nomor, kelurahan": "Street, number, sub-district",
  "Kota / kabupaten": "City / regency",
  "Nama bisnis minimal 3 karakter": "Business name must be at least 3 characters",
  "Nama bisnis maksimal 150 karakter": "Business name must be at most 150 characters",
  "Nama penanggung jawab minimal 3 karakter":
    "Person in charge name must be at least 3 characters",
  "Nama penanggung jawab maksimal 100 karakter":
    "Person in charge name must be at most 100 characters",
  "Nomor telepon minimal 8 digit": "Phone number must be at least 8 digits",
  "Nomor telepon maksimal 20 digit": "Phone number must be at most 20 digits",

  /* --- Pendaftaran mitra --- */
  "Isi data badan usaha Anda, lalu pilih paket langganan untuk mulai memasang listing.":
    "Fill in your business details, then choose a subscription plan to start listing.",
  "Masuk atau daftar akun dulu": "Sign in or create an account first",
  "Pendaftaran mitra memerlukan akun agar data badan usaha dan langganan Anda tersimpan.":
    "Partner registration requires an account so your business details and subscription are saved.",
  "Anda sudah terdaftar sebagai mitra": "You are already registered as a partner",
  "Data badan usaha Anda sudah tercatat. Lanjutkan memilih paket langganan untuk memasang listing.":
    "Your business details are recorded. Continue by choosing a subscription plan to start listing.",
  "Pilih Paket Langganan": "Choose a Subscription Plan",
  "Lihat Profil Mitra": "View Partner Profile",
  "Dengan melanjutkan, akun Anda langsung aktif sebagai mitra dan Anda dapat memilih paket langganan pada langkah berikutnya.":
    "By continuing, your account is immediately activated as a partner and you can choose a subscription plan in the next step.",
  "Daftar & lanjut pilih paket": "Register & continue to choose a plan",

  /* --- Katalog publik --- */
  "Jelajahi properti yang tayang, lalu hubungi mitra untuk informasi lebih lanjut.":
    "Browse the published properties, then contact the partner for more information.",
  "Cari judul, kota, atau kata kunci...": "Search title, city, or keyword...",
  Kategori: "Category",
  Tipe: "Type",
  "Gagal memuat katalog": "Failed to load the catalog",
  "Properti yang tayang akan tampil di sini. Coba ubah kata kunci atau filter.":
    "Published properties will appear here. Try changing the keyword or filter.",

  /* --- Detail properti publik --- */
  "Kembali ke katalog": "Back to catalog",
  "Properti tidak dapat dimuat": "Property could not be loaded",
  "Hubungi via WhatsApp": "Contact via WhatsApp",
  "Dikelola oleh": "Managed by",
  "Lihat seluruh katalog pengelola ini": "View this manager's entire catalog",
  Rating: "Rating",
  Ketersediaan: "Availability",
  "{n} unit": "{n} units",
  "{n} kamar tidur": "{n} bedrooms",
  "{n} kamar mandi": "{n} bathrooms",
  "Terbit {tgl}": "Published {tgl}",
  "Tinggalkan pesan": "Leave a message",
  "Isi data Anda, pengelola akan menghubungi kembali.":
    "Fill in your details, the manager will get back to you.",
  Nama: "Name",
  Pesan: "Message",
  "Saya tertarik dengan properti ini...": "I'm interested in this property...",
  "Kirim pesan": "Send message",
  "Nama minimal 2 karakter": "Name must be at least 2 characters",
  "Nama terlalu panjang": "Name is too long",
  "Nomor telepon terlalu panjang": "Phone number is too long",
  "Tuliskan pesan singkat": "Write a short message",
  "Pesan terlalu panjang": "Message is too long",
  "Pesan terkirim": "Message sent",
  "Pengelola akan menghubungi Anda.": "The manager will contact you.",
  "Diteruskan ke admin": "Forwarded to admin",
  "Mitra belum mengisi nomor WhatsApp, permintaan Anda diteruskan ke admin.":
    "The partner has not set a WhatsApp number, your request was forwarded to the admin.",

  /* --- Halaman pengelola --- */
  "Kembali ke dashboard": "Back to dashboard",
  "Profil pengelola tidak dapat dimuat": "Manager profile could not be loaded",
  "{n} properti": "{n} properties",
  "Katalog pengelola": "Manager catalog",
  "Seluruh properti yang tayang dan dikelola oleh mitra ini.":
    "All published properties managed by this partner.",
  "Pengelola ini belum menayangkan properti apa pun.":
    "This manager has not published any property yet.",

  /* --- Katalog paket --- */
  "Paket Langganan": "Subscription Plans",
  "Pilih paket yang sesuai kebutuhan Anda, lalu lanjutkan ke pembayaran.":
    "Choose the plan that fits your needs, then continue to payment.",
  "Buka dashboard": "Open dashboard",
  "Belum ada paket": "No plans yet",
  "Paket langganan belum tersedia saat ini. Silakan coba lagi nanti.":
    "Subscription plans are not available at the moment. Please try again later.",
  /* Deskripsi & fasilitas paket bawaan (teks bebas dari basis data). */
  "Paket uji coba untuk mitra baru.": "Trial plan for new partners.",
  "Cocok untuk agen properti perorangan.": "Suitable for individual property agents.",
  "Untuk agensi dengan banyak listing.": "For agencies with many listings.",
  "Dukungan email": "Email support",
  "Dukungan WhatsApp": "WhatsApp support",
  "Dukungan prioritas": "Priority support",
  "Statistik tayangan": "View statistics",
  "Statistik lanjutan": "Advanced statistics",
  "Prioritas review": "Priority review",
  "Boost listing level 3": "Level 3 listing boost",
  "Akses pengaturan nomor WA": "WhatsApp number settings access",
  "{n} listing aktif": "{n} active listings",
  "Masa aktif {n} hari": "Active for {n} days",

  /* --- Favorit akun --- */
  "Kembali ke profil": "Back to profile",
  "Akun Anda tidak memiliki akses ke daftar favorit. Gunakan akun customer untuk menyimpan properti yang diminati.":
    "Your account does not have access to the favorites list. Use a customer account to save properties you like.",
  "Tekan ikon hati pada properti di katalog untuk menyimpannya di sini.":
    "Press the heart icon on a property in the catalog to save it here.",
  "Jelajahi katalog": "Browse the catalog",

  /* --- Lupa kata sandi --- */
  "Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.":
    "Enter your account email. We will send a link to create a new password.",
  "Tautan reset telah dikirim": "Reset link sent",
  "Kami mengirim tautan ke": "We sent a link to",
  "Tautan berlaku terbatas, segera buat kata sandi baru.":
    "The link is time-limited, create a new password soon.",
  "Kirim tautan reset": "Send reset link",
  "Kembali ke halaman masuk": "Back to sign-in page",
  "Tautan terkirim": "Link sent",
  "Periksa kotak masuk atau folder spam email Anda.": "Check your inbox or spam folder.",
  "Gagal mengirim tautan": "Failed to send link",

  /* --- Admin: manajemen akun --- */
  "Akun baru": "New account",
  "Data akun": "Account data",
  "Kata sandi awal": "Initial password",
  "Minimal 8 karakter; mintalah pengguna menggantinya.":
    "At least 8 characters; ask the user to change it.",
  "Opsional.": "Optional.",
  "Buat akun pengguna beserta peran awalnya.": "Create a user account along with its initial role.",
  "Ubah akun": "Edit account",
  "Tautan reset disalin": "Reset link copied",
  "Salin manual": "Copy manually",
  Pengguna: "User",
  Telepon: "Phone",
  "Ubah data": "Edit data",
  Nonaktifkan: "Deactivate",
  Aktifkan: "Activate",
  "Reset kata sandi": "Reset password",
  "Kelola akun, peran, dan status seluruh pengguna platform.":
    "Manage the accounts, roles, and status of all platform users.",
  "Tambah Akun": "Add Account",
  "Cari nama atau email...": "Search name or email...",
  akun: "accounts",
  "Belum ada akun": "No accounts yet",
  "Akun pengguna akan tampil di sini.": "User accounts will appear here.",
  "Ubah status akun": "Update account status",
  "Alasan (opsional)": "Reason (optional)",
  "Tautan reset kata sandi": "Password reset link",
  "Bagikan tautan ini kepada pengguna; tautan hanya berlaku terbatas.":
    "Share this link with the user; the link is time-limited.",
  "Salin tautan": "Copy link",

  /* --- Admin: form paket --- */
  "Nama paket minimal 3 karakter": "Plan name must be at least 3 characters",
  "Nama paket maksimal 100 karakter": "Plan name must be at most 100 characters",
  "Slug maksimal 60 karakter": "Slug must be at most 60 characters",
  "Slug hanya huruf kecil, angka, dan tanda hubung":
    "Slug may only contain lowercase letters, numbers, and hyphens",
  "Deskripsi maksimal 500 karakter": "Description must be at most 500 characters",
  "{label} wajib diisi": "{label} is required",
  "{label} harus antara {min} dan {maks}": "{label} must be between {min} and {maks}",
  "{label} harus antara {min}": "{label} must be at least {min}",
  "Identitas paket": "Plan identity",
  "Contoh: Paket Pro": "Example: Pro Plan",
  Slug: "Slug",
  "opsional, dibuat otomatis bila kosong": "optional, generated automatically if empty",
  "Harga & masa aktif": "Price & validity",
  "Tanpa tanda titik atau koma. Diabaikan bila paket gratis.":
    "Without dots or commas. Ignored if the plan is free.",
  "Durasi (hari)": "Duration (days)",
  "Isi -1 untuk kuota tanpa batas.": "Enter -1 for unlimited quota.",
  "Urutan tampil": "Display order",
  "Pisahkan tiap fasilitas dengan koma atau baris baru.":
    "Separate each facility with a comma or new line.",
  "Level & boost": "Level & boost",
  "Level menentukan prioritas tampil di katalog; boost hanya berlaku bila paket mengizinkan.":
    "Level determines display priority in the catalog; boost only applies if the plan allows it.",
  "1 terendah. Makin tinggi makin diprioritaskan (1, 2, 3, ...).":
    "1 is the lowest. The higher the value, the higher the priority (1, 2, 3, ...).",
  "Boost listing aktif": "Boost listing active",
  "Mitra dapat menaikkan peringkat listing sesuai level paket.":
    "Partners can raise the listing ranking according to the plan level.",
  "Akses pengaturan mitra": "Partner settings access",
  "Paket gratis tidak memperoleh akses keyword, katalog, maupun nomor WhatsApp.":
    "The free plan does not get keyword, catalog, or WhatsApp number access.",
  "Akses pengaturan keyword": "Keyword settings access",
  "Mitra dapat mengatur kata kunci pencarian listing.":
    "Partners can set the listing search keywords.",
  "Akses pengaturan katalog": "Catalog settings access",
  "Mitra dapat mengatur tampilan katalog propertinya.":
    "Partners can customize their property catalog display.",
  "Akses pengaturan nomor WhatsApp": "WhatsApp number settings access",
  "Mitra dapat mengatur nomor WhatsApp untuk lead.":
    "Partners can set the WhatsApp number for leads.",
  "Paket gratis": "Free plan",
  "Mitra dapat mengaktifkan paket ini tanpa pembayaran.":
    "Partners can activate this plan without payment.",
  "Paket aktif akan tampil pada halaman katalog publik.":
    "An active plan will appear on the public catalog page.",

  /* --- Admin: katalog paket --- */
  "Ubah paket": "Edit plan",
  "Paket langganan baru": "New subscription plan",
  "Perubahan berlaku untuk pembelian berikutnya.": "Changes apply to the next purchase.",
  "Tentukan harga, kuota, dan fasilitas paket.":
    "Define the plan's price, quota, and facilities.",
  "Buat paket": "Create plan",
  "Link checkout disalin": "Checkout link copied",
  "Salin link checkout": "Copy checkout link",
  "Buka checkout": "Open checkout",
  "Daftar paket langganan yang ditawarkan kepada mitra.":
    "List of subscription plans offered to partners.",
  "Tambah Paket": "Add Plan",
  "Cari nama atau slug paket...": "Search plan name or slug...",
  paket: "plans",
  "Tambahkan paket langganan agar mitra dapat berlangganan.":
    "Add a subscription plan so partners can subscribe.",
  "Nonaktifkan paket": "Deactivate plan",
  'Paket "{nama}" tidak akan tampil di katalog publik.':
    'The "{nama}" plan will not appear in the public catalog.',
  'Paket "{nama}" akan tampil di katalog publik.':
    'The "{nama}" plan will appear in the public catalog.',

  /* --- Admin: master fasilitas --- */
  "Nama fasilitas minimal 2 karakter": "Facility name must be at least 2 characters",
  "Nama fasilitas maksimal 80 karakter": "Facility name must be at most 80 characters",
  "Deskripsi maksimal 300 karakter": "Description must be at most 300 characters",
  "Ikon maksimal 60 karakter": "Icon must be at most 60 characters",
  "Urutan harus berupa angka": "Order must be a number",
  "Ubah fasilitas": "Edit facility",
  "Fasilitas baru": "New facility",
  "Fasilitas dipakai mitra untuk melengkapi informasi listing properti.":
    "Facilities are used by partners to complete property listing details.",
  "Buat fasilitas": "Create facility",
  "Identitas fasilitas": "Facility identity",
  "Nama fasilitas": "Facility name",
  "Contoh: Kolam Renang": "Example: Swimming Pool",
  Ikon: "Icon",
  "opsional, nama ikon (mis. waves, car)": "optional, icon name (e.g. waves, car)",
  "Pengurutan & status": "Ordering & status",
  Urutan: "Order",
  "Aktifkan fasilitas": "Activate facility",
  "Fasilitas aktif dapat dipilih mitra saat mengunggah listing.":
    "Active facilities can be selected by partners when uploading listings.",
  "Kelola fasilitas properti yang dapat dipilih mitra saat mengunggah listing.":
    "Manage property facilities that partners can select when uploading listings.",
  "Tambah Fasilitas": "Add Facility",
  "Cari nama atau deskripsi fasilitas...": "Search facility name or description...",
  fasilitas: "facilities",
  "Belum ada fasilitas": "No facilities yet",
  "Tambahkan fasilitas agar mitra dapat melengkapi informasi listing properti.":
    "Add facilities so partners can complete property listing details.",
  "Nonaktifkan fasilitas": "Deactivate facility",
  'Fasilitas "{nama}" tidak akan dapat dipilih mitra.':
    'The "{nama}" facility will no longer be selectable by partners.',
  'Fasilitas "{nama}" akan dapat dipilih mitra saat mengunggah listing.':
    'The "{nama}" facility will be selectable by partners when uploading listings.',
  "Hapus fasilitas": "Delete facility",
  'Fasilitas "{nama}" akan dihapus dari master data. Tindakan ini tidak dapat dibatalkan.':
    'The "{nama}" facility will be deleted from the master data. This action cannot be undone.',

  /* --- Admin: master kategori --- */
  "Nama kategori minimal 2 karakter": "Category name must be at least 2 characters",
  "Nama kategori maksimal 80 karakter": "Category name must be at most 80 characters",
  "Ubah kategori": "Edit category",
  "Kategori baru": "New category",
  "Kategori dipakai untuk mengelompokkan properti pada katalog publik.":
    "Categories are used to group properties in the public catalog.",
  "Buat kategori": "Create category",
  "Identitas kategori": "Category identity",
  "Nama kategori": "Category name",
  "Contoh: Rumah": "Example: House",
  "Aktifkan kategori": "Activate category",
  "Kategori aktif tampil pada filter katalog publik.":
    "Active categories appear in the public catalog filter.",
  "Kelola kategori properti yang dipakai pada filter katalog publik.":
    "Manage the property categories used in the public catalog filter.",
  "Tambah Kategori": "Add Category",
  "Cari nama atau deskripsi kategori...": "Search category name or description...",
  kategori: "categories",
  "Belum ada kategori": "No categories yet",
  "Tambahkan kategori agar properti dapat dikelompokkan pada katalog.":
    "Add categories so properties can be grouped in the catalog.",
  "Nonaktifkan kategori": "Deactivate category",
  'Kategori "{nama}" tidak akan tampil pada filter katalog publik.':
    'The "{nama}" category will not appear in the public catalog filter.',
  'Kategori "{nama}" akan tampil pada filter katalog publik.':
    'The "{nama}" category will appear in the public catalog filter.',
  "Hapus kategori": "Delete category",
  'Kategori "{nama}" akan dihapus dari master data. Tindakan ini tidak dapat dibatalkan.':
    'The "{nama}" category will be deleted from the master data. This action cannot be undone.',

  /* --- Admin: katalog properti --- */
  "Pantau dan moderasi seluruh properti yang terdaftar di platform.":
    "Monitor and moderate all properties registered on the platform.",
  "Cari judul, kota, atau mitra...": "Search title, city, or partner...",
  "Properti yang diajukan mitra akan tampil di sini.":
    "Properties submitted by partners will appear here.",
  "Catatan moderasi": "Moderation note",

  /* --- Admin: laporan langganan --- */
  "Berkas laporan berhasil diunduh": "Report file downloaded successfully",
  "Gagal mengunduh berkas laporan": "Failed to download the report file",
  "Rekapitulasi transaksi pembayaran paket dari seluruh mitra.":
    "Recap of plan payment transactions from all partners.",
  "Total Transaksi": "Total Transactions",
  "Seluruh order tercatat": "All recorded orders",
  "Total Pendapatan": "Total Revenue",
  "Akumulasi nilai order": "Accumulated order value",
  "Cari kode order atau nama mitra...": "Search order code or partner name...",
  "Transaksi langganan mitra akan tampil di sini.":
    "Partner subscription transactions will appear here.",

  /* --- Admin: manajemen mitra --- */
  "Nama bisnis": "Business name",
  "Penanggung jawab": "Person in charge",
  Kota: "City",
  Bergabung: "Joined",
  "Perjanjian disetujui": "Agreement approved",
  Belum: "Not yet",
  "Tangguhkan, aktifkan kembali, atau tinjau data mitra yang terdaftar.":
    "Suspend, reactivate, or review registered partner data.",
  "Cari nama bisnis, PIC, atau kota...": "Search business name, PIC, or city...",
  mitra: "partners",
  "Belum ada mitra": "No partners yet",
  "Mitra yang mendaftar akan tampil di sini.": "Partners who register will appear here.",
  "Rincian data mitra": "Partner data details",
  "Ubah status mitra": "Update partner status",
  "Catatan (alasan penangguhan)": "Note (suspension reason)",

  /* --- Admin: pengaturan sistem --- */
  "Pratinjau logo di area masuk dan daftar": "Logo preview on the sign-in and registration area",
  "Pratinjau gambar panel area masuk": "Sign-in panel image preview",
  Bawaan: "Default",
  Kosong: "Empty",
  "Mengunggah...": "Uploading...",
  "Unggah gambar": "Upload image",
  "Pengaturan Platform": "Platform Settings",
  "Nilai tersimpan langsung di basis data. Kolom bertanda rahasia disembunyikan saat ditampilkan.":
    "Values are stored directly in the database. Fields marked as secret are hidden when displayed.",
  "Simpan pengaturan": "Save settings",
  "Konfigurasi global platform yang dapat disesuaikan tanpa perubahan kode.":
    "Global platform configuration that can be adjusted without code changes.",
  "Gagal memuat pengaturan": "Failed to load settings",
  "Pilih {label}": "Select {label}",

  /* --- Admin: versi perjanjian --- */
  "Versi wajib diisi": "Version is required",
  "Versi maksimal 30 karakter": "Version must be at most 30 characters",
  "Isi perjanjian minimal 20 karakter": "Agreement content must be at least 20 characters",
  "Tanggal tidak valid": "Invalid date",
  Versi: "Version",
  "Berlaku sejak": "Effective since",
  Judul: "Title",
  Isi: "Content",
  "Versi perjanjian baru": "New agreement version",
  "Versi perjanjian yang aktif akan diminta persetujuannya saat mitra berlangganan.":
    "The active agreement version will be presented for approval when a partner subscribes.",
  "Simpan versi": "Save version",
  "Identitas versi": "Version identity",
  "Perjanjian Kerja Sama Mitra": "Partner Cooperation Agreement",
  "Isi perjanjian": "Agreement content",
  "Minimal 20 karakter.": "At least 20 characters.",
  "Poin ceklis persetujuan": "Approval checklist points",
  "Poin yang harus dicentang mitra": "Points the partner must check",
  "Kosongkan bila mitra cukup menyetujui perjanjian secara umum.":
    "Leave empty if it is sufficient for the partner to approve the agreement in general.",
  "Jadikan versi aktif": "Make this the active version",
  "Versi sebelumnya otomatis dinonaktifkan.": "The previous version is automatically deactivated.",
  Arsip: "Archived",
  "Lihat isi": "View content",
  "Jadikan aktif": "Make active",
  "Kelola versi perjanjian kerja sama yang harus disetujui mitra.":
    "Manage the versions of the cooperation agreement that partners must approve.",
  "Versi Baru": "New Version",
  "Cari versi atau judul...": "Search version or title...",
  versi: "versions",
  "Belum ada perjanjian": "No agreements yet",
  "Buat versi perjanjian pertama sebelum mitra dapat berlangganan.":
    "Create the first agreement version before partners can subscribe.",
  "Versi {versi} akan menjadi perjanjian aktif dan versi sebelumnya dinonaktifkan.":
    "Version {versi} will become the active agreement and the previous version is deactivated.",

  /* --- Admin: konten landing --- */
  "Judul hero wajib diisi": "Hero title is required",
  "Maksimal 70 karakter": "At most 70 characters",
  "Maksimal 300 karakter": "At most 300 characters",
  "Maksimal 8 karakter": "At most 8 characters",
  "Maksimal {n} tautan": "At most {n} links",
  "Maksimal 40 karakter": "At most 40 characters",
  "Maksimal 500 karakter": "At most 500 characters",
  "Maksimal {n} gambar kolase": "At most {n} collage images",
  "Minimal 50 karakter": "At least 50 characters",
  "Maksimal 60 karakter": "At most 60 characters",
  "Minimal 120 karakter": "At least 120 characters",
  "Maksimal 160 karakter": "At most 160 characters",
  "Nama area tidak boleh kosong": "Area name cannot be empty",
  "Minimal 4 area prioritas": "At least 4 priority areas",
  "Maksimal 6 area prioritas": "At most 6 priority areas",
  "Maksimal 200 karakter": "At most 200 characters",
  "Maksimal 1000 karakter": "At most 1000 characters",
  "Maksimal {n} pertanyaan": "At most {n} questions",
  Keunggulan: "Highlights",
  "Properti Pilihan": "Featured Properties",
  "Paket Kemitraan": "Partnership Plans",
  "Panduan Mitra": "Partner Guide",
  FAQ: "FAQ",
  "Gambar hero": "Hero image",
  "Rasio 16:9; dikonversi otomatis ke WebP, lebar maksimal 1920px, berkas di bawah 250 KB.":
    "16:9 ratio; automatically converted to WebP, max width 1920px, file under 250 KB.",
  "Gambar Open Graph": "Open Graph image",
  "Ukuran 1200×630 untuk pratinjau tautan saat dibagikan di media sosial.":
    "1200×630 size for link previews when shared on social media.",
  "Belum ada gambar": "No image yet",
  "URL gambar": "Image URL",
  "Terisi otomatis setelah unggahan berhasil; dapat juga diisi tautan gambar eksternal.":
    "Auto-filled after a successful upload; an external image link can also be entered.",
  "Highlight Wilayah": "Highlight Regions",
  "4-6 area prioritas yang ditonjolkan pada landing page dan menjadi tautan internal ke katalog wilayah.":
    "4-6 priority areas highlighted on the landing page that become internal links to the regional catalog.",
  "Area {nomor}": "Area {nomor}",
  "Contoh: Denpasar": "Example: Denpasar",
  "Hapus area {nomor}": "Remove area {nomor}",
  "Tambah area": "Add area",
  "Gambar kolase hero": "Hero collage images",
  "Unggah 3-4 gambar. Gambar pertama tampil paling besar dan sisanya mengisi kolase. Bila kosong, halaman memakai foto properti teratas.":
    "Upload 3-4 images. The first image appears largest and the rest fill the collage. If empty, the page uses the top property photos.",
  "Hapus gambar {nomor}": "Remove image {nomor}",
  "Tambah gambar": "Add image",
  "Pertanyaan {nomor}": "Question {nomor}",
  "Jawaban {nomor}": "Answer {nomor}",
  "Tulis pertanyaan": "Write a question",
  "Tulis jawaban": "Write an answer",
  "Hapus pertanyaan": "Remove question",
  "Tambah pertanyaan": "Add question",
  "Belum ada pertanyaan khusus. Halaman memakai pertanyaan bawaan hingga daftar ini diisi.":
    "No custom questions yet. The page uses default questions until this list is filled.",
  "Hero Banner": "Hero Banner",
  "Metadata SEO Global": "Global SEO Metadata",
  "Judul utama halaman ditampilkan sebagai satu-satunya tag":
    "The page's main title is displayed as the only",
  "(teks murni, tanpa editor WYSIWYG).": "tag (plain text, no WYSIWYG editor).",
  "Judul hero": "Hero title",
  "Subjudul hero": "Hero subtitle",
  "Teks tombol CTA hero": "Hero CTA button text",
  "Maksimal 70 karakter.": "At most 70 characters.",
  "Maksimal 300 karakter.": "At most 300 characters.",
  "Footer": "Footer",
  "Identitas dan tautan pada kaki halaman. Kosongkan untuk memakai teks bawaan.":
    "Identity and links in the page footer. Leave blank to use the default text.",
  "Inisial brand": "Brand initials",
  "Maksimal 8 karakter, mis. “EN”.": "At most 8 characters, e.g. “EN”.",
  "Nama brand": "Brand name",
  "Maksimal 60 karakter, mis. “ENM PROPERTY”.": "At most 60 characters, e.g. “ENM PROPERTY”.",
  "Deskripsi footer": "Footer description",
  "Hak cipta": "Copyright",
  "Tautan footer (Indonesia)": "Footer links (Indonesian)",
  "Tautan navigasi pada footer halaman Indonesia. Kosongkan untuk memakai tautan bawaan.":
    "Navigation links in the Indonesian page footer. Leave blank to use the default links.",
  "Label tautan {nomor}": "Link label {nomor}",
  "URL tautan {nomor}": "Link URL {nomor}",
  "Contoh: Properti": "Example: Properties",
  "Contoh: #properti atau https://…": "Example: #properties or https://…",
  "Hapus tautan": "Remove link",
  "Tambah tautan": "Add link",
  "Belum ada tautan khusus. Halaman memakai tautan bawaan hingga daftar ini diisi.":
    "No custom links yet. The page uses the default links until this list is filled.",
  "Footer description (EN)": "Footer description (EN)",
  "Footer copyright (EN)": "Footer copyright (EN)",
  "Footer links (EN)": "Footer links (EN)",
  "Tautan navigasi pada footer halaman Inggris (/en). Kosongkan untuk memakai tautan bawaan.":
    "Navigation links in the English page footer (/en). Leave blank to use the default links.",
  "Maksimal 40 karakter, mis. “Jelajahi Katalog”.":
    "At most 40 characters, e.g. “Browse Catalog”.",
  "Meta title": "Meta title",
  "Meta description": "Meta description",
  "50-60 karakter agar tidak terpotong di hasil pencarian.":
    "50-60 characters so it isn't truncated in search results.",
  "120-160 karakter.": "120-160 characters.",
  "Wilayah Unggulan": "Featured Regions",
  "Area prioritas yang ditonjolkan pada landing page sekaligus memperkuat internal linking.":
    "Priority areas highlighted on the landing page while strengthening internal linking.",
  "Judul & Deskripsi Bagian": "Section Titles & Descriptions",
  "Judul dan deskripsi tiap bagian halaman utama. Kosongkan untuk memakai teks bawaan.":
    "The title and description of each main page section. Leave empty to use the default text.",
  "Judul bagian {label}": "Section title {label}",
  "Deskripsi bagian {label}": "Section description {label}",
  "Maksimal 200 karakter.": "At most 200 characters.",
  "Daftar Pertanyaan (FAQ)": "Questions List (FAQ)",
  "Pertanyaan dan jawaban yang tampil pada bagian FAQ. Kosongkan untuk memakai daftar bawaan; baris yang tidak lengkap otomatis diabaikan.":
    "Questions and answers displayed in the FAQ section. Leave empty to use the default list; incomplete rows are ignored automatically.",
  "Pertanyaan umum (Indonesia)": "General questions (Indonesian)",
  "Tampil pada halaman utama berbahasa Indonesia.":
    "Shown on the Indonesian main page.",
  "CTA Mitra “Titip Properti”": "Partner CTA “List Property”",
  "Ajakan kemitraan yang mengarahkan pengunjung ke halaman pendaftaran mitra.":
    "A partnership call to action that directs visitors to the partner registration page.",
  "Judul CTA": "CTA title",
  "Deskripsi CTA": "CTA description",
  "Bahasa Inggris (English)": "English",
  "Hero title (EN)": "Hero title (EN)",
  "Hero subtitle (EN)": "Hero subtitle (EN)",
  "Hero CTA text (EN)": "Hero CTA text (EN)",
  "Meta title (EN)": "Meta title (EN)",
  "Meta description (EN)": "Meta description (EN)",
  "Bagian {label} — judul (EN)": "Section {label} — title (EN)",
  "Bagian {label} — deskripsi (EN)": "Section {label} — description (EN)",
  "CTA title (EN)": "CTA title (EN)",
  "CTA description (EN)": "CTA description (EN)",
  "FAQ items (EN)": "FAQ items (EN)",
  "Tampil pada halaman landing berbahasa Inggris (/en). Kosongkan untuk memakai daftar bawaan.":
    "Shown on the English landing page (/en). Leave empty to use the default list.",
  "Terakhir diperbarui {tgl}": "Last updated {tgl}",
  "Publish perubahan landing page": "Publish landing page changes",
  "Konten yang ditampilkan pada bagian paling atas halaman utama.":
    "Content shown at the very top of the main page.",
  "Teks tombol CTA": "CTA button text",
  "Gambar kolase": "Collage images",
  "Judul dan deskripsi yang tampil di hasil pencarian.":
    "The title and description shown in search results.",
  "Area prioritas yang ditonjolkan pada landing page.":
    "Priority areas highlighted on the landing page.",
  "Belum ada area prioritas.": "No priority areas yet.",
  "Judul dan deskripsi tiap bagian halaman utama.":
    "The title and description of each main page section.",
  "Pertanyaan dan jawaban pada bagian FAQ halaman utama.":
    "Questions and answers in the main page FAQ section.",
  "Memakai daftar pertanyaan bawaan.": "Using the default question list.",
  "FAQ {nomor} — pertanyaan (EN)": "FAQ {nomor} — question (EN)",
  "FAQ {nomor} — jawaban (EN)": "FAQ {nomor} — answer (EN)",
  "Kelola konten halaman utama: hero, metadata SEO, wilayah unggulan, dan ajakan mitra.":
    "Manage the main page content: hero, SEO metadata, featured regions, and partner call to action.",
  "Gagal memuat konten landing page": "Failed to load landing page content",
  "Pantau konten halaman utama. Perubahan hanya dapat dilakukan oleh admin.":
    "Monitor the main page content. Changes can only be made by an admin.",
  "Dipakai sebagai": "Used as",
  dan: "and",
  "halaman utama.": "of the main page.",
  "Teks untuk halaman": "Text for the",
  "Kosongkan bila terjemahan belum tersedia; halaman Inggris akan memakai teks bawaan sehingga tidak pernah tampil kosong.":
    "Leave empty if the translation is not available; the English page will use the default text so it never appears empty.",
  "Versi teks untuk halaman": "Text version for the",

  /* --- Owner: laporan --- */
  "Pemantauan Owner": "Owner Monitoring",
  "Ringkasan kinerja platform: mitra, properti, langganan, dan pendapatan.":
    "Overview of platform performance: partners, properties, subscriptions, and revenue.",
  "Gagal memuat ringkasan owner": "Failed to load owner overview",
  "Langganan aktif": "Active subscriptions",
  "Menunggu bayar": "Pending payment",
  "Mitra Teratas": "Top Partners",
  "Berdasarkan jumlah properti dan interaksi":
    "Based on the number of properties and interactions",
  "Kinerja katalog dan interaksi setiap mitra di platform.":
    "Catalog performance and interaction of each partner on the platform.",
  "Belum ada data mitra": "No partner data yet",
  "Kinerja mitra akan tampil di sini setelah ada aktivitas.":
    "Partner performance will appear here once there is activity.",

  /* ------------------------------------------------- Metadata halaman -- */
  "Masuk ke akun ENM Property untuk mengelola properti dan langganan Anda.":
    "Sign in to your ENM Property account to manage your properties and subscription.",
  "Profil Pengelola": "Manager Profile",
  "Detail Properti": "Property Detail",
  "Lupa Kata Sandi": "Forgot Password",
  "Ringkasan Admin": "Admin Overview",
  "Daftar Akun": "Create Account",
  "Lihat seluruh properti yang dikelola oleh mitra ENM Property.":
    "View all properties managed by ENM Property partners.",
  "Kelola informasi akun dan lihat properti favorit Anda.":
    "Manage your account information and view your favorite properties.",
  "Lihat detail properti beserta spesifikasi, fasilitas, dan kontak mitra.":
    "View property details along with specifications, facilities, and partner contact.",
  "Minta tautan reset kata sandi untuk akun ENM Property Anda.":
    "Request a password reset link for your ENM Property account.",
  "Jelajahi properti rumah, apartemen, ruko, dan tanah yang tayang di ENM Property.":
    "Explore houses, apartments, shophouses, and land listed on ENM Property.",
  "Monitoring katalog properti, mitra, langganan, dan pembayaran platform.":
    "Monitor the property catalog, partners, subscriptions, and platform payments.",
  "Isi data badan usaha dan pilih paket langganan untuk memasang properti di katalog ENM Property.":
    "Fill in your business details and choose a subscription plan to list properties in the ENM Property catalog.",
  "Rekapitulasi transaksi langganan paket mitra.":
    "Recapitulation of partner plan subscription transactions.",
  "Properti yang Anda simpan untuk ditinjau kembali.":
    "Properties you saved to review later.",
  "Buat akun ENM Property, lalu pilih paket langganan untuk mulai memasang listing.":
    "Create an ENM Property account, then choose a subscription plan to start listing.",
  "Verifikasi dan kelola seluruh mitra yang terdaftar di platform.":
    "Verify and manage all partners registered on the platform.",
  "Kelola versi perjanjian kerja sama mitra.":
    "Manage versions of the partner cooperation agreement.",
  "Kelola konten halaman utama ENMProperty: hero, metadata SEO, dan wilayah unggulan.":
    "Manage the ENMProperty main page content: hero, SEO metadata, and featured regions.",
  "Jejak tindakan administratif pada platform.":
    "Trail of administrative actions on the platform.",
  "Konfigurasi global platform ENMProperty.":
    "Global configuration of the ENMProperty platform.",
  "Bandingkan paket langganan ENM Property, lalu pilih paket yang sesuai kebutuhan Anda.":
    "Compare ENM Property subscription plans, then choose the plan that suits your needs.",
  "Kelola kategori properti untuk katalog publik.":
    "Manage property categories for the public catalog.",
  "Kelola akun, peran, dan status pengguna platform.":
    "Manage platform user accounts, roles, and status.",
  "Pilih paket langganan dan kelola masa aktif tayang properti Anda.":
    "Choose a subscription plan and manage your property listing active period.",
  "Kelola fasilitas properti yang dapat dipilih mitra.":
    "Manage property facilities that partners can select.",
  "Riwayat transaksi langganan dan status pembayarannya.":
    "Subscription transaction history and its payment status.",
  "Kelola paket langganan yang ditawarkan kepada mitra.":
    "Manage subscription plans offered to partners.",
  "Kelola data badan usaha dan informasi akun kemitraan Anda.":
    "Manage your business details and partnership account information.",
  "Status pembayaran dan rincian transaksi langganan.":
    "Payment status and subscription transaction details.",
  "Kinerja katalog dan interaksi setiap mitra.":
    "Catalog performance and interaction of each partner.",
  "Tagihan langganan dan invoice pembayaran paket Anda.":
    "Your subscription bills and plan payment invoices.",
  "Pantau performa listing, kuota, dan status paket langganan Anda.":
    "Monitor your listing performance, quota, and subscription plan status.",
  "Statistik performa listing dan interaksi katalog properti Anda.":
    "Statistics of your listing performance and property catalog interaction.",
  "Kelola listing properti, status tayang, dan ketersediaan unit.":
    "Manage property listings, listing status, and unit availability.",
  "Pantau konten halaman utama ENMProperty (mode baca-saja).":
    "Monitor the ENMProperty main page content (read-only mode).",
  "Perbarui informasi listing properti dan kelola galeri foto.":
    "Update property listing information and manage the photo gallery.",
  "Lengkapi data properti baru lalu simpan sebagai draf atau ajukan untuk tayang.":
    "Complete the new property details, then save as draft or submit for listing.",
  "Tinjau paket langganan yang Anda pilih sebelum melanjutkan pembayaran.":
    "Review the subscription plan you selected before proceeding to payment.",

  /* ------------------------------------------------------- Zona Berbahaya -- */
  "Zona Berbahaya": "Danger Zone",
  "Tindakan pada bagian ini bersifat permanen dan tidak dapat dibatalkan.":
    "Actions in this section are permanent and cannot be undone.",
  "Hapus akun permanen": "Permanently delete account",
  "Menghapus akun akan menghapus profil mitra, SELURUH katalog properti aktif maupun nonaktif, foto, riwayat pesanan, dan akses akun Anda secara permanen.":
    "Deleting your account will permanently remove your partner profile, ALL active and inactive property listings, photos, order history, and your account access.",
  "Hapus akun saya": "Delete my account",
  "Tindakan ini tidak dapat dibatalkan. Seluruh data akun dan katalog mitra akan hilang selamanya.":
    "This action cannot be undone. All account data and the partner catalog will be lost forever.",
  "Profil mitra, SELURUH katalog properti aktif/nonaktif, foto, riwayat pesanan, dan akses akun akan dihapus permanen.":
    "Your partner profile, ALL active/inactive property listings, photos, order history, and account access will be permanently deleted.",
  "Masukkan kata sandi untuk memverifikasi ulang akun Anda.":
    "Enter your password to re-verify your account.",
  "Ketik {frasa} untuk mengonfirmasi.": "Type {frasa} to confirm.",
  "Akun dihapus permanen": "Account permanently deleted",
  "Akun Anda beserta seluruh katalog properti, foto, dan riwayat pesanan telah dihapus secara permanen.":
    "Your account along with the entire property catalog, photos, and order history has been permanently deleted.",
  "Hapus akun": "Delete account",
  "Hapus akun ini secara permanen?": "Permanently delete this account?",
  "Seluruh data pengguna ini—profil, properti, foto, langganan, dan transaksi—akan dihapus permanen dan tidak dapat dikembalikan.":
    "All of this user's data—profile, properties, photos, subscriptions, and transactions—will be permanently deleted and cannot be restored.",
  "Akun dihapus": "Account deleted",
  "Gagal menghapus akun": "Failed to delete account",

  /* ------------------------------------------------------ Batalkan order -- */
  "Melanjutkan pembayaran": "Continuing payment",
  "Anda dialihkan ke halaman pembayaran pesanan yang belum selesai.":
    "You are being redirected to the payment page for your unfinished order.",
  "Popup pembayaran tidak dapat dibuka. Anda dialihkan ke halaman pembayaran QRIS/VA.":
    "The payment popup could not be opened. You are being redirected to the QRIS/VA payment page.",
  "Ingin memilih paket lain? Batalkan pesanan ini lalu pilih paket kembali.":
    "Want to choose another plan? Cancel this order, then select a plan again.",
  "Batalkan pembayaran": "Cancel payment",
  "Batalkan pembayaran?": "Cancel payment?",
  "Pesanan yang dibatalkan tidak dapat dilanjutkan. Anda dapat memilih paket lagi dari halaman Paket & Langganan.":
    "A canceled order cannot be resumed. You can choose another plan from the Plans & Subscription page.",
};

/** Menyisipkan nilai ke placeholder `{kunci}` bila ada. */
function sisipkan(teks: string, nilai?: NilaiTerjemah): string {
  if (!nilai) return teks;
  return teks.replace(/\{(\w+)\}/g, (utuh, kunci: string) =>
    kunci in nilai ? String(nilai[kunci]) : utuh,
  );
}

/**
 * Menerjemahkan satu teks antarmuka ke bahasa tujuan.
 *
 * @param bahasa Bahasa tujuan (selain `en` akan memakai teks Indonesia apa adanya).
 * @param teks   Teks Indonesia yang menjadi kunci kamus.
 * @param nilai  Pasangan nilai untuk mengisi placeholder `{kunci}`.
 */
export function terjemah(bahasa: Bahasa, teks: string, nilai?: NilaiTerjemah): string {
  const dasar = bahasa === BAHASA_BAWAAN ? teks : (EN[teks] ?? teks);
  return sisipkan(dasar, nilai);
}
