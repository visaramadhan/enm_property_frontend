import Link from "next/link";

const langkah = [
  {
    nomor: "01",
    judul: "Daftar & pilih paket",
    deskripsi: "Buat akun mitra lalu pilih paket langganan sesuai kebutuhan listing.",
  },
  {
    nomor: "02",
    judul: "Unggah properti",
    deskripsi: "Lengkapi data properti, foto, dan harga sewa dalam satu formulir.",
  },
  {
    nomor: "03",
    judul: "Terima leads",
    deskripsi: "Pantau performa listing dan tindak lanjuti calon penyewa.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel brand - hanya tampil di desktop */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-12 text-secondary-foreground lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(226,160,63,.20),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(200,90,50,.28),transparent_55%)]"
        />

        <Link href="/" className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-field bg-primary text-sm font-bold text-primary-foreground">
            EN
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold">ENM Property</span>
            <span className="text-xs text-secondary-foreground/60">Platform Listing Properti</span>
          </span>
        </Link>

        <div className="relative flex flex-col gap-8">
          <h2 className="max-w-md text-3xl font-semibold leading-snug">
            Kelola listing properti Anda dari satu dashboard.
          </h2>

          <ol className="flex flex-col gap-6">
            {langkah.map((item) => (
              <li key={item.nomor} className="flex gap-4">
                <span
                  data-numeric
                  className="text-sm font-semibold tracking-[.04em] text-accent"
                  aria-hidden="true"
                >
                  {item.nomor}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold">{item.judul}</span>
                  <span className="max-w-sm text-sm text-secondary-foreground/70">
                    {item.deskripsi}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative text-xs text-secondary-foreground/50">
          &copy; ENM Property. Seluruh harga dalam Rupiah (IDR) dan waktu WIB.
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-md flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
