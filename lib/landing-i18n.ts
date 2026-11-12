/**
 * Kamus teks statis halaman landing (Indonesia & Inggris).
 *
 * Teks yang dikelola admin lewat CMS (judul hero, judul bagian, CTA, metadata)
 * tidak berada di sini — nilai itu berasal dari API konten landing. Kamus ini
 * hanya menampung salinan tetap (label, langkah, FAQ, catatan) beserta teks
 * cadangan ketika kolom CMS belum diisi. Dengan begitu halaman `/en` tidak
 * pernah tampil kosong walau terjemahan CMS belum lengkap.
 */
export type Bahasa = "id" | "en";

/** Kunci bahasa yang dikenali; selain ini selalu jatuh ke Indonesia. */
export const BAHASA_BAWAAN: Bahasa = "id";
/** Nama cookie penyimpan pilihan bahasa pengunjung. */
export const COOKIE_BAHASA = "enm_bahasa";

const ID = {
  meta: {
    judulBawaan: "Listing Properti Bali",
    locale: "id_ID",
    html: "id",
  },
  header: {
    menu: [
      { id: "properti", href: "#properti", label: "Properti" },
      { id: "paket", href: "#paket", label: "Paket Mitra" },
      { id: "panduan", href: "#panduan", label: "Panduan Kemitraan" },
    ],
    daftarMitra: "Daftar Sebagai Mitra",
    bukaMenu: "Buka menu",
    tutupMenu: "Tutup menu",
    navigasiUtama: "Navigasi utama",
    navigasiUtamaKecil: "Navigasi utama layar kecil",
    gantiBahasa: "Ganti bahasa",
    labelBahasa: { id: "ID", en: "EN" },
  },
  hero: {
    eyebrow: "Platform listing properti",
    ctaSekunder: "Pasang Properti +",
    labelArea: "Area populer",
    catatan: "Informasi listing dan kontak dalam satu platform.",
    chip: "Jelajahi listing properti",
    ariaKolase: "Kolase foto properti pilihan",
    altKolase: (area: string, judul: string) => `Properti pilihan di ${area} - ${judul}`,
  },
  keunggulan: {
    eyebrow: "Keunggulan",
    item: [
      { judul: "Cari Properti", deskripsi: "Jelajahi listing properti untuk disewa atau dibeli sesuai kebutuhanmu." },
      {
        judul: "Informasi dan Kontak",
        deskripsi: "Pelajari detail properti dan hubungi kontak yang tersedia melalui WhatsApp.",
      },
      {
        judul: "Pasarkan Properti",
        deskripsi: "Kelola informasi, foto, harga, dan ketersediaan listing melalui akun mitra.",
      },
    ],
  },
  properti: {
    eyebrow: "Properti pilihan",
    lihatSemua: "Lihat semua properti →",
    skemaNama: (kota: string) => `Daftar properti pilihan di ${kota}`,
    kosongTeks: "Belum ada properti yang tayang saat ini.",
    kosongTautan: "Buka katalog",
    kosongSufiks: "untuk melihat seluruh listing.",
  },
  paket: {
    eyebrow: "Untuk agen dan pemilik properti",
    badgeGratis: "Mulai gratis",
    badgeMitra: "Paket mitra",
    deskripsiBawaan: "Paket langganan mitra ENM Property.",
    labelHarga: "Harga paket",
    gratis: "Gratis",
    tanpaBatasWaktu: "Tanpa batas waktu",
    pilih: (nama: string) => `Pilih ${nama} →`,
    catatan:
      "Harga, durasi, kuota listing, metode kontak, dan fitur mengikuti konfigurasi paket aktif ENM Property.",
    perbandingan: "Perbandingan paket secara lengkap",
    kolomInfo: "Informasi paket",
    catatanTabel:
      "Nilai pada tabel diambil langsung dari konfigurasi paket aktif yang disediakan API ENM Property.",
    kosongTeks: "Daftar paket sedang tidak dapat dimuat.",
    kosongTautan: "Buka halaman paket",
    kosongSufiks: "untuk melihat informasi terbaru.",
    baris: {
      harga: "Harga paket",
      masaAktif: "Masa aktif",
      kapasitas: "Kapasitas listing",
      boost: "Boost listing",
      keyword: "Pengaturan keyword",
      katalog: "Pengaturan katalog",
      whatsapp: "Nomor WhatsApp",
      fitur: "Daftar fitur",
      pendaftaran: "Proses pendaftaran",
      pembayaran: "Pembayaran",
      hari: (n: string) => `${n} hari`,
      tanpaBatas: "Tanpa batas",
      listing: (n: string) => `${n} listing`,
      tersedia: "Tersedia",
      tanpaNilai: "—",
      jumlahFitur: (n: string) => `${n} fitur`,
      registrasi: "Registrasi kemitraan",
      checkout: "Checkout paket",
      tidakPerlu: "Tidak diperlukan",
      melaluiPembayaran: "Melalui alur pembayaran",
    },
  },
  panduan: {
    eyebrow: "Panduan kemitraan",
    langkah: [
      {
        nomor: "01",
        judul: "Pilih paket",
        deskripsi:
          "Bandingkan paket yang tersedia. Harga, durasi, kuota, dan fitur mengikuti data paket aktif ENM Property.",
        tautan: { href: "#paket", label: "Lihat paket" },
      },
      {
        nomor: "02",
        judul: "Masuk atau daftar",
        deskripsi: "Gunakan akun ENM. Jika belum memiliki akun, daftar melalui email atau Google Sign-In.",
      },
      {
        nomor: "03",
        judul: "Lengkapi data mitra",
        deskripsi:
          "Isi nama usaha atau agen dan nomor WhatsApp aktif. Alamat usaha dapat dilengkapi bila diperlukan.",
      },
      {
        nomor: "04",
        judul: "Setujui perjanjian",
        deskripsi: "Baca perjanjian kemitraan yang berlaku, kemudian ikuti proses aktivasi sesuai paket pilihan.",
      },
    ],
    sebelumEyebrow: "Sebelum memulai",
    sebelumJudul: "Siapkan informasi untuk pendaftaran dan listing.",
    sebelumDeskripsi:
      "Data yang lengkap membantu kamu menyiapkan profil mitra dan informasi properti sebelum listing ditayangkan.",
    persiapan: [
      { judul: "Akun ENM Property", keterangan: "Email dan nama akun yang akan digunakan." },
      { judul: "Nama usaha atau agen", keterangan: "Nama yang digunakan pada profil kemitraan." },
      { judul: "Nomor WhatsApp aktif", keterangan: "Nomor kontak mitra yang dapat dihubungi." },
      {
        judul: "Informasi properti",
        keterangan: "Judul, jenis listing, lokasi, foto, harga, dan ketersediaan sesuai kondisi properti.",
      },
      {
        judul: "Perjanjian kemitraan",
        keterangan: "Baca dan setujui versi perjanjian yang berlaku sebelum melanjutkan.",
      },
    ],
    setelahEyebrow: "Setelah mendaftar",
    alur: [
      {
        judul: "Pilih alur aktivasi",
        deskripsi:
          "Paket Free tidak memerlukan pembayaran. Paket berlangganan melanjutkan ke tahapan pembayaran yang disediakan.",
      },
      {
        judul: "Lengkapi listing",
        deskripsi:
          "Isi data properti, foto, lokasi, harga per periode yang relevan, dan ketersediaan unit sesuai informasi aktual.",
      },
      {
        judul: "Simpan dan tayangkan",
        deskripsi:
          "Kelola listing dari dashboard mitra. Listing yang berstatus aktif akan tampil di katalog publik ENM Property.",
      },
      {
        judul: "Kelola kontak dan ketersediaan",
        deskripsi:
          "Perbarui informasi properti agar calon penyewa atau pembeli melihat detail yang sesuai dengan listing.",
      },
    ],
  },
  faq: {
    eyebrow: "Pertanyaan umum",
    item: [
      {
        tanya: "Apakah semua paket membutuhkan pembayaran?",
        jawab:
          "Tidak. Paket Free mengikuti alur pendaftaran tanpa pembayaran. Paket berlangganan melanjutkan ke tahapan pembayaran sesuai instruksi checkout.",
      },
      {
        tanya: "Apa perbedaan paket Free, Basic, Pro, dan Business?",
        jawab:
          "Setiap paket memiliki konfigurasi harga, durasi, kapasitas listing, metode kontak, dan daftar fitur. Rincian tiap paket mengikuti data paket aktif yang disediakan oleh ENM Property.",
      },
      {
        tanya: "Data apa yang wajib disiapkan untuk menjadi mitra?",
        jawab:
          "Siapkan akun ENM, nama usaha atau agen, nomor WhatsApp aktif, dan informasi properti seperti judul, lokasi, foto, serta harga.",
      },
      {
        tanya: "Kapan properti tampil di katalog publik?",
        jawab: "Listing yang berstatus aktif akan tampil di katalog publik ENM Property.",
      },
      {
        tanya: "Bagaimana cara mengelola listing setelah aktif?",
        jawab: "Kelola listing, foto, harga, kontak, dan ketersediaan dari dashboard mitra.",
      },
      {
        tanya: "Apakah paket dapat diperpanjang atau ditingkatkan?",
        jawab: "Ketentuan perpanjangan dan peningkatan paket mengikuti data paket aktif ENM Property.",
      },
    ],
  },
  cta: {
    eyebrow: "Untuk pemilik dan agen properti",
    tombol: "Daftar sebagai mitra →",
  },
  footer: {
    tautan: [
      { href: "#properti", label: "Properti" },
      { href: "#paket", label: "Paket Mitra" },
      { href: "#panduan", label: "Panduan Kemitraan" },
    ],
    katalog: "Katalog",
    ariaBrand: "ENM Property beranda",
    deskripsi:
      "Platform listing properti untuk mencari properti yang sesuai atau memasarkan listing melalui akun mitra.",
    navigasi: "Navigasi footer",
    hakCipta: "ENM Property. Semua hak dilindungi undang-undang.",
  },
  bawaan: {
    judulHero: "Temukan properti yang tepat untukmu.",
    subJudulHero:
      "Cari properti untuk disewa atau dibeli, lihat detail listing, lalu hubungi kontak yang tersedia melalui WhatsApp. Punya properti? Pasarkan dan kelola listing-mu melalui ENM Property.",
    labelCtaHero: "Sewa & Beli Properti",
    judulKeunggulan: "",
    deskripsiKeunggulan: "",
    judulCta: "Siap memasarkan properti melalui ENM?",
    deskripsiCta:
      "Bandingkan paket, siapkan informasi mitra, lalu ikuti proses pendaftaran untuk mulai mengelola listing.",
    judulProperti: "Temukan properti untuk disewa dan dibeli.",
    deskripsiProperti: "Jelajahi listing yang tersedia dan buka detailnya untuk informasi lebih lanjut.",
    judulPaket: "Pilih Paket Kemitraan",
    deskripsiPaket:
      "Temukan informasi paket dan ketentuan yang sesuai dengan kebutuhan listing propertimu.",
    judulPanduan: "Empat langkah menjadi mitra ENM",
    deskripsiPanduan: "Mulai dari menentukan paket hingga mengelola listing melalui akun mitra.",
    judulFaq: "Informasi sebelum bergabung",
    deskripsiFaq: "Ringkasan alur pendaftaran dan pengelolaan listing mitra.",
  },
};

/** Bentuk kamus; versi Inggris wajib mengikuti struktur ini. */
export type Kamus = typeof ID;

const EN: Kamus = {
  meta: {
    judulBawaan: "Bali Property Listings",
    locale: "en_US",
    html: "en",
  },
  header: {
    menu: [
      { id: "properti", href: "#properti", label: "Properties" },
      { id: "paket", href: "#paket", label: "Partner Plans" },
      { id: "panduan", href: "#panduan", label: "Partnership Guide" },
    ],
    daftarMitra: "Register as Partner",
    bukaMenu: "Open menu",
    tutupMenu: "Close menu",
    navigasiUtama: "Main navigation",
    navigasiUtamaKecil: "Main navigation for small screens",
    gantiBahasa: "Switch language",
    labelBahasa: { id: "ID", en: "EN" },
  },
  hero: {
    eyebrow: "Property listing platform",
    ctaSekunder: "List a Property +",
    labelArea: "Popular areas",
    catatan: "Listing information and contact in one platform.",
    chip: "Explore property listings",
    ariaKolase: "Selected property photo collage",
    altKolase: (area: string, judul: string) => `Selected properties in ${area} - ${judul}`,
  },
  keunggulan: {
    eyebrow: "Highlights",
    item: [
      {
        judul: "Find a Property",
        deskripsi: "Browse property listings to rent or buy according to your needs.",
      },
      {
        judul: "Information and Contact",
        deskripsi: "Learn the property details and reach the available contact via WhatsApp.",
      },
      {
        judul: "Market a Property",
        deskripsi: "Manage information, photos, price, and listing availability through a partner account.",
      },
    ],
  },
  properti: {
    eyebrow: "Selected properties",
    lihatSemua: "View all properties →",
    skemaNama: (kota: string) => `Selected property listings in ${kota}`,
    kosongTeks: "No properties are live right now.",
    kosongTautan: "Open the catalog",
    kosongSufiks: "to see all listings.",
  },
  paket: {
    eyebrow: "For agents and property owners",
    badgeGratis: "Start free",
    badgeMitra: "Partner plan",
    deskripsiBawaan: "ENM Property partner subscription plan.",
    labelHarga: "Plan price",
    gratis: "Free",
    tanpaBatasWaktu: "No time limit",
    pilih: (nama: string) => `Select ${nama} →`,
    catatan:
      "Price, duration, listing quota, contact method, and features follow the active ENM Property plan configuration.",
    perbandingan: "Full plan comparison",
    kolomInfo: "Plan information",
    catatanTabel:
      "The values in the table are taken directly from the active plan configuration provided by the ENM Property API.",
    kosongTeks: "The plan list cannot be loaded right now.",
    kosongTautan: "Open the plans page",
    kosongSufiks: "to see the latest information.",
    baris: {
      harga: "Plan price",
      masaAktif: "Active period",
      kapasitas: "Listing capacity",
      boost: "Listing boost",
      keyword: "Keyword settings",
      katalog: "Catalog settings",
      whatsapp: "WhatsApp number",
      fitur: "Feature list",
      pendaftaran: "Registration process",
      pembayaran: "Payment",
      hari: (n: string) => `${n} days`,
      tanpaBatas: "Unlimited",
      listing: (n: string) => `${n} listings`,
      tersedia: "Available",
      tanpaNilai: "—",
      jumlahFitur: (n: string) => `${n} features`,
      registrasi: "Partnership registration",
      checkout: "Plan checkout",
      tidakPerlu: "Not required",
      melaluiPembayaran: "Through the payment flow",
    },
  },
  panduan: {
    eyebrow: "Partnership guide",
    langkah: [
      {
        nomor: "01",
        judul: "Choose a plan",
        deskripsi:
          "Compare the available plans. Price, duration, quota, and features follow the active ENM Property plan data.",
        tautan: { href: "#paket", label: "View plans" },
      },
      {
        nomor: "02",
        judul: "Sign in or register",
        deskripsi: "Use your ENM account. If you don't have one yet, register with email or Google Sign-In.",
      },
      {
        nomor: "03",
        judul: "Complete partner data",
        deskripsi:
          "Fill in your business or agent name and an active WhatsApp number. The business address can be completed if needed.",
      },
      {
        nomor: "04",
        judul: "Approve the agreement",
        deskripsi:
          "Read the applicable partnership agreement, then follow the activation process for your chosen plan.",
      },
    ],
    sebelumEyebrow: "Before you start",
    sebelumJudul: "Prepare your information for registration and listing.",
    sebelumDeskripsi:
      "Complete data helps you set up your partner profile and property information before the listing goes live.",
    persiapan: [
      { judul: "An ENM Property account", keterangan: "The email and account name you will use." },
      { judul: "Business or agent name", keterangan: "The name used on your partnership profile." },
      { judul: "An active WhatsApp number", keterangan: "The partner contact number that can be reached." },
      {
        judul: "Property information",
        keterangan: "Title, listing type, location, photos, price, and availability matching the property condition.",
      },
      {
        judul: "Partnership agreement",
        keterangan: "Read and approve the applicable agreement version before continuing.",
      },
    ],
    setelahEyebrow: "After registering",
    alur: [
      {
        judul: "Choose the activation flow",
        deskripsi: "The Free plan requires no payment. Subscription plans continue to the provided payment stage.",
      },
      {
        judul: "Complete the listing",
        deskripsi:
          "Fill in the property data, photos, location, price per relevant period, and unit availability according to actual information.",
      },
      {
        judul: "Save and publish",
        deskripsi:
          "Manage listings from the partner dashboard. Listings with active status appear in the ENM Property public catalog.",
      },
      {
        judul: "Manage contact and availability",
        deskripsi:
          "Update the property information so prospective renters or buyers see details matching the listing.",
      },
    ],
  },
  faq: {
    eyebrow: "Frequently asked questions",
    item: [
      {
        tanya: "Do all plans require payment?",
        jawab:
          "No. The Free plan follows a registration flow without payment. Subscription plans continue to a payment stage according to the checkout instructions.",
      },
      {
        tanya: "What is the difference between the Free, Basic, Pro, and Business plans?",
        jawab:
          "Each plan has its own price, duration, listing capacity, contact method, and feature list. The details of each plan follow the active plan data provided by ENM Property.",
      },
      {
        tanya: "What data must I prepare to become a partner?",
        jawab:
          "Prepare an ENM account, business or agent name, an active WhatsApp number, and property information such as title, location, photos, and price.",
      },
      {
        tanya: "When does a property appear in the public catalog?",
        jawab: "Listings with active status appear in the ENM Property public catalog.",
      },
      {
        tanya: "How do I manage listings after activation?",
        jawab: "Manage listings, photos, price, contact, and availability from the partner dashboard.",
      },
      {
        tanya: "Can a plan be extended or upgraded?",
        jawab: "The terms for extending and upgrading a plan follow the active plan data of ENM Property.",
      },
    ],
  },
  cta: {
    eyebrow: "For property owners and agents",
    tombol: "Register as a partner →",
  },
  footer: {
    tautan: [
      { href: "#properti", label: "Properties" },
      { href: "#paket", label: "Partner Plans" },
      { href: "#panduan", label: "Partnership Guide" },
    ],
    katalog: "Catalog",
    ariaBrand: "ENM Property home",
    deskripsi:
      "A property listing platform to find the right property or market listings through a partner account.",
    navigasi: "Footer navigation",
    hakCipta: "ENM Property. All rights reserved.",
  },
  bawaan: {
    judulHero: "Find the right property for you.",
    subJudulHero:
      "Search properties to rent or buy, view listing details, then reach the available contact via WhatsApp. Have a property? Market and manage your listing through ENM Property.",
    labelCtaHero: "Rent & Buy Property",
    judulKeunggulan: "",
    deskripsiKeunggulan: "",
    judulCta: "Ready to market your property with ENM?",
    deskripsiCta:
      "Compare plans, prepare your partner information, then complete the registration to start managing your listings.",
    judulProperti: "Find properties to rent and buy.",
    deskripsiProperti: "Explore the available listings and open the details for more information.",
    judulPaket: "Choose a Partnership Plan",
    deskripsiPaket: "Find the plan and terms that fit your property listing needs.",
    judulPanduan: "Four steps to become an ENM partner",
    deskripsiPanduan: "From choosing a plan to managing listings through your partner account.",
    judulFaq: "Information before joining",
    deskripsiFaq: "A summary of the registration flow and partner listing management.",
  },
};

/** Kamus lengkap per bahasa. */
export const KAMUS: Record<Bahasa, Kamus> = { id: ID, en: EN };

/** Mengambil kamus untuk satu bahasa. */
export function kamus(bahasa: Bahasa): Kamus {
  return KAMUS[bahasa];
}

/** Menormalkan string apa pun menjadi kunci bahasa yang sah. */
export function keBahasa(nilai: string | undefined | null): Bahasa {
  return nilai === "en" ? "en" : BAHASA_BAWAAN;
}

/** Prefix rute untuk bahasa Inggris; bahasa Indonesia memakai akar `/`. */
export const RUTE: Record<Bahasa, string> = { id: "/", en: "/en" };
