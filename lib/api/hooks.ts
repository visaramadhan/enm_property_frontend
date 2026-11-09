"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import * as api from "@/lib/api/endpoints";
import { awalan, kunci } from "@/lib/api/keys";
import { useMutasi } from "@/lib/api/use-mutasi";
import type { Paginated } from "@/types/api";
import type {
  AdminCreateUserRequest,
  AdminDashboard,
  AdminPropertyStatusRequest,
  AdminUpdatePropertyRequest,
  AdminUpdateUserRequest,
  AgreementView,
  AuditFilterQuery,
  AuditView,
  CategoryView,
  ChargeRequest,
  CheckoutRequest,
  CheckoutResponse,
  ContactFormRequest,
  ContactFormResponse,
  CreateAgreementRequest,
  CreateCategoryRequest,
  CreatePlanRequest,
  CreatePropertyRequest,
  FavoriteToggleResponse,
  FavoriteView,
  InvoiceView,
  LandingContentView,
  LandingImageKind,
  LandingImageResponse,
  LandingPublishResponse,
  LeadView,
  ListQuery,
  OrderStatusView,
  OrderView,
  OwnerDashboard,
  PartnerPublicView,
  PartnerReportRow,
  PartnerView,
  PaymentView,
  PhotoView,
  PlanView,
  PropertyContactResponse,
  PropertyDetail,
  PropertyFilterQuery,
  PropertySummary,
  RegisterPartnerRequest,
  ReportFilterQuery,
  ResetPasswordResponse,
  SetAvailabilityRequest,
  SetBoostRequest,
  SetPlanStatusRequest,
  SetPropertyStatusRequest,
  SetUserStatusRequest,
  SettingImageKind,
  SettingImageResponse,
  SettingView,
  SiteSettingsView,
  SubscriptionReport,
  SubscriptionView,
  SuspendPartnerRequest,
  UpdateMeRequest,
  UpdatePartnerRequest,
  UpdatePlanRequest,
  UpdateCategoryRequest,
  UpdateLandingRequest,
  UpdateSettingsRequest,
  UploadPhotoResponse,
  UserView,
  VendorAgreementResponse,
  VendorDashboard,
} from "@/types/api";

/** Menormalkan objek filter menjadi entri kunci cache yang stabil. */
function kunciDari(query: object) {
  return query as Record<string, unknown>;
}

/**
 * Status order yang sudah final (tidak akan berubah lagi).
 *
 * Dipakai untuk menghentikan polling otomatis pada halaman pembayaran dan
 * transaksi agar server tidak terus dipanggil setelah pembayaran tuntas.
 */
function statusOrderFinal(status?: string): boolean {
  return status === "paid" || status === "failed" || status === "expired" || status === "cancelled";
}

/* =========================================================== Sesi & Profil */

export function useProfilSaya(): UseQueryResult<UserView> {
  return useQuery({
    queryKey: kunci.profilSaya(),
    queryFn: api.ambilProfilSaya,
  });
}

export function usePerbaruiProfilSaya() {
  return useMutasi<UserView, UpdateMeRequest>({
    mutasi: api.perbaruiProfilSaya,
    kunciInvalidasi: [awalan.profilSaya, awalan.sesi],
    pesanSukses: "Profil berhasil diperbarui",
    pesanGagal: "Gagal memperbarui profil",
  });
}

/* ================================================================ Admin */

export function useDashboardAdmin(): UseQueryResult<AdminDashboard> {
  return useQuery({
    queryKey: kunci.dashboardAdmin(),
    queryFn: api.dashboardAdmin,
  });
}

export function useDaftarMitraAdmin(query: ListQuery = {}) {
  return useQuery<Paginated<PartnerView>>({
    queryKey: kunci.mitraAdmin(kunciDari(query)),
    queryFn: () => api.daftarMitraAdmin(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useDetailMitraAdmin(id: string) {
  return useQuery<PartnerView>({
    queryKey: kunci.detailMitraAdmin(id),
    queryFn: () => api.detailMitraAdmin(id),
    enabled: Boolean(id),
  });
}

export function useUbahStatusMitra() {
  return useMutasi<PartnerView, { id: string; body: SuspendPartnerRequest }>({
    mutasi: ({ id, body }) => api.ubahStatusMitra(id, body),
    kunciInvalidasi: [awalan.mitraAdmin, awalan.dashboardAdmin],
    pesanSukses: "Status mitra diperbarui",
    pesanGagal: "Gagal mengubah status mitra",
  });
}

export function useDaftarPropertiAdmin(query: PropertyFilterQuery = {}) {
  return useQuery<Paginated<PropertySummary>>({
    queryKey: kunci.propertiAdmin(kunciDari(query)),
    queryFn: () => api.daftarPropertiAdmin(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useUbahStatusPropertiAdmin() {
  return useMutasi<PropertyDetail, { id: string; body: AdminPropertyStatusRequest }>({
    mutasi: ({ id, body }) => api.ubahStatusPropertiAdmin(id, body),
    kunciInvalidasi: [awalan.propertiAdmin, awalan.dashboardAdmin],
    pesanSukses: "Status properti diperbarui",
    pesanGagal: "Gagal mengubah status properti",
  });
}

export function usePerbaruiPropertiAdmin() {
  return useMutasi<PropertyDetail, { id: string; body: AdminUpdatePropertyRequest }>({
    mutasi: ({ id, body }) => api.perbaruiPropertiAdmin(id, body),
    kunciInvalidasi: [awalan.propertiAdmin],
    pesanSukses: "Properti berhasil diperbarui",
    pesanGagal: "Gagal memperbarui properti",
  });
}

export function useBuatPropertiAdmin() {
  return useMutasi<
    PropertyDetail,
    CreatePropertyRequest & { partner_id: string; publish?: boolean }
  >({
    mutasi: api.buatPropertiAdmin,
    kunciInvalidasi: [awalan.propertiAdmin, awalan.dashboardAdmin],
    pesanSukses: "Properti berhasil dibuat",
    pesanGagal: "Gagal membuat properti",
  });
}

export function useHapusFotoAdmin() {
  return useMutasi<void, { propertyId: string; photoId: string }>({
    mutasi: ({ propertyId, photoId }) => api.hapusFotoAdmin(propertyId, photoId),
    kunciInvalidasi: [awalan.propertiAdmin],
    pesanSukses: "Foto dihapus",
    pesanGagal: "Gagal menghapus foto",
  });
}

export function useDaftarPaketAdmin(query: ListQuery = {}) {
  return useQuery<Paginated<PlanView>>({
    queryKey: kunci.paketAdmin(kunciDari(query)),
    queryFn: () => api.daftarPaketAdmin(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useBuatPaket() {
  return useMutasi<PlanView, CreatePlanRequest>({
    mutasi: api.buatPaket,
    kunciInvalidasi: [awalan.paketAdmin, awalan.paketPublik],
    pesanSukses: "Paket berhasil dibuat",
    pesanGagal: "Gagal membuat paket",
  });
}

export function usePerbaruiPaket() {
  return useMutasi<PlanView, { id: string; body: UpdatePlanRequest }>({
    mutasi: ({ id, body }) => api.perbaruiPaket(id, body),
    kunciInvalidasi: [awalan.paketAdmin, awalan.paketPublik],
    pesanSukses: "Paket berhasil diperbarui",
    pesanGagal: "Gagal memperbarui paket",
  });
}

export function useUbahStatusPaket() {
  return useMutasi<PlanView, { id: string; body: SetPlanStatusRequest }>({
    mutasi: ({ id, body }) => api.ubahStatusPaket(id, body),
    kunciInvalidasi: [awalan.paketAdmin, awalan.paketPublik],
    pesanSukses: "Status paket diperbarui",
    pesanGagal: "Gagal mengubah status paket",
  });
}

/* -------------------------------------------------------------- Kategori */

export function useDaftarKategoriAdmin(query: ListQuery = {}) {
  return useQuery<Paginated<CategoryView>>({
    queryKey: kunci.kategoriAdmin(kunciDari(query)),
    queryFn: () => api.daftarKategoriAdmin(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useBuatKategori() {
  return useMutasi<CategoryView, CreateCategoryRequest>({
    mutasi: api.buatKategori,
    kunciInvalidasi: [awalan.kategoriAdmin, awalan.kategoriPublik],
    pesanSukses: "Kategori berhasil dibuat",
    pesanGagal: "Gagal membuat kategori",
  });
}

export function usePerbaruiKategori() {
  return useMutasi<CategoryView, { id: string; body: UpdateCategoryRequest }>({
    mutasi: ({ id, body }) => api.perbaruiKategori(id, body),
    kunciInvalidasi: [awalan.kategoriAdmin, awalan.kategoriPublik],
    pesanSukses: "Kategori berhasil diperbarui",
    pesanGagal: "Gagal memperbarui kategori",
  });
}

export function useUbahStatusKategori() {
  return useMutasi<CategoryView, { id: string; body: SetPlanStatusRequest }>({
    mutasi: ({ id, body }) => api.ubahStatusKategori(id, body),
    kunciInvalidasi: [awalan.kategoriAdmin, awalan.kategoriPublik],
    pesanSukses: "Status kategori diperbarui",
    pesanGagal: "Gagal mengubah status kategori",
  });
}

export function useHapusKategori() {
  return useMutasi<void, string>({
    mutasi: api.hapusKategori,
    kunciInvalidasi: [awalan.kategoriAdmin, awalan.kategoriPublik],
    pesanSukses: "Kategori dihapus",
    pesanGagal: "Gagal menghapus kategori",
  });
}

export function useDaftarPengguna(query: ListQuery = {}) {
  return useQuery<Paginated<UserView>>({
    queryKey: kunci.pengguna(kunciDari(query)),
    queryFn: () => api.daftarPengguna(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useBuatPengguna() {
  return useMutasi<UserView, AdminCreateUserRequest>({
    mutasi: api.buatPengguna,
    kunciInvalidasi: [awalan.pengguna],
    pesanSukses: "Akun berhasil dibuat",
    pesanGagal: "Gagal membuat akun",
  });
}

export function usePerbaruiPengguna() {
  return useMutasi<UserView, { id: string; body: AdminUpdateUserRequest }>({
    mutasi: ({ id, body }) => api.perbaruiPengguna(id, body),
    kunciInvalidasi: [awalan.pengguna],
    pesanSukses: "Akun berhasil diperbarui",
    pesanGagal: "Gagal memperbarui akun",
  });
}

export function useUbahStatusPengguna() {
  return useMutasi<UserView, { id: string; body: SetUserStatusRequest }>({
    mutasi: ({ id, body }) => api.ubahStatusPengguna(id, body),
    kunciInvalidasi: [awalan.pengguna],
    pesanSukses: "Status akun diperbarui",
    pesanGagal: "Gagal mengubah status akun",
  });
}

export function useResetSandiPengguna() {
  return useMutasi<ResetPasswordResponse, string>({
    mutasi: api.resetSandiPengguna,
    kunciInvalidasi: [awalan.audit],
    pesanSukses: "Tautan reset kata sandi dibuat",
    pesanGagal: "Gagal membuat tautan reset",
  });
}

export function useDaftarPerjanjian(query: ListQuery = {}) {
  return useQuery<Paginated<AgreementView>>({
    queryKey: kunci.perjanjian(kunciDari(query)),
    queryFn: () => api.daftarPerjanjian(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useBuatPerjanjian() {
  return useMutasi<AgreementView, CreateAgreementRequest>({
    mutasi: api.buatPerjanjian,
    kunciInvalidasi: [awalan.perjanjian],
    pesanSukses: "Versi perjanjian dibuat",
    pesanGagal: "Gagal membuat perjanjian",
  });
}

export function useAktifkanPerjanjian() {
  return useMutasi<AgreementView, string>({
    mutasi: api.aktifkanPerjanjian,
    kunciInvalidasi: [awalan.perjanjian],
    pesanSukses: "Versi perjanjian diaktifkan",
    pesanGagal: "Gagal mengaktifkan perjanjian",
  });
}

export function useDaftarAudit(query: AuditFilterQuery = {}) {
  return useQuery<Paginated<AuditView>>({
    queryKey: kunci.audit(kunciDari(query)),
    queryFn: () => api.daftarAudit(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function usePengaturan() {
  return useQuery<SettingView[]>({
    queryKey: kunci.pengaturan(),
    queryFn: api.ambilPengaturan,
  });
}

export function usePerbaruiPengaturan() {
  return useMutasi<SettingView[], UpdateSettingsRequest>({
    mutasi: api.perbaruiPengaturan,
    kunciInvalidasi: [awalan.pengaturan],
    pesanSukses: "Pengaturan disimpan",
    pesanGagal: "Gagal menyimpan pengaturan",
  });
}

/** Mengunggah berkas logo/gambar login pada halaman pengaturan sistem. */
export function useUnggahGambarPengaturan() {
  return useMutasi<SettingImageResponse, { kind: SettingImageKind; file: File }>({
    mutasi: ({ kind, file }) => api.unggahGambarPengaturan(kind, file),
    kunciInvalidasi: [awalan.pengaturan, awalan.pengaturanPublik],
    pesanSukses: "Gambar berhasil diunggah",
    pesanGagal: "Gagal mengunggah gambar",
  });
}

export function useLaporanLangganan(query: ReportFilterQuery = {}) {
  return useQuery<SubscriptionReport>({
    queryKey: kunci.laporanLangganan(kunciDari(query)),
    queryFn: () => api.laporanLanggananAdmin(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

/* ================================================================ Mitra */

export function useDashboardMitra(): UseQueryResult<VendorDashboard> {
  return useQuery({
    queryKey: kunci.dashboardMitra(),
    queryFn: api.dashboardMitra,
  });
}

export function useLanggananMitra(): UseQueryResult<SubscriptionView> {
  return useQuery({
    queryKey: kunci.langgananMitra(),
    queryFn: api.langgananMitra,
  });
}

export function useProfilMitra(aktif = true): UseQueryResult<PartnerView> {
  return useQuery({
    queryKey: kunci.profilMitra(),
    queryFn: api.profilMitra,
    enabled: aktif,
  });
}

export function usePerbaruiProfilMitra() {
  return useMutasi<PartnerView, UpdatePartnerRequest>({
    mutasi: api.perbaruiProfilMitra,
    kunciInvalidasi: [awalan.profilMitra, awalan.dashboardMitra, awalan.profilSaya],
    pesanSukses: "Profil mitra disimpan",
    pesanGagal: "Gagal menyimpan profil mitra",
  });
}

export function usePerjanjianMitra(aktif = true): UseQueryResult<VendorAgreementResponse> {
  return useQuery({
    queryKey: kunci.perjanjianMitra(),
    queryFn: api.perjanjianMitra,
    enabled: aktif,
  });
}

export function useDaftarPropertiMitra(query: PropertyFilterQuery = {}) {
  return useQuery<Paginated<PropertySummary>>({
    queryKey: kunci.propertiMitra(kunciDari(query)),
    queryFn: () => api.daftarPropertiMitra(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useDetailPropertiMitra(id: string) {
  return useQuery<PropertyDetail>({
    queryKey: kunci.detailPropertiMitra(id),
    queryFn: () => api.detailPropertiMitra(id),
    enabled: Boolean(id),
  });
}

export function useBuatProperti() {
  return useMutasi<PropertyDetail, CreatePropertyRequest>({
    mutasi: api.buatProperti,
    kunciInvalidasi: [awalan.propertiMitra, awalan.dashboardMitra, awalan.langgananMitra],
    pesanSukses: "Properti berhasil diajukan",
    pesanGagal: "Gagal menyimpan properti",
  });
}

export function usePerbaruiProperti() {
  return useMutasi<PropertyDetail, { id: string; body: CreatePropertyRequest }>({
    mutasi: ({ id, body }) => api.perbaruiProperti(id, body),
    kunciInvalidasi: [awalan.propertiMitra, awalan.dashboardMitra],
    pesanSukses: "Properti berhasil diperbarui",
    pesanGagal: "Gagal memperbarui properti",
  });
}

export function useHapusProperti() {
  return useMutasi<void, string>({
    mutasi: api.hapusProperti,
    kunciInvalidasi: [awalan.propertiMitra, awalan.dashboardMitra, awalan.langgananMitra],
    pesanSukses: "Properti dihapus",
    pesanGagal: "Gagal menghapus properti",
  });
}

export function useUbahStatusProperti() {
  return useMutasi<PropertyDetail, { id: string; body: SetPropertyStatusRequest }>({
    mutasi: ({ id, body }) => api.ubahStatusProperti(id, body),
    kunciInvalidasi: [awalan.propertiMitra, awalan.dashboardMitra],
    pesanSukses: "Status properti diperbarui",
    pesanGagal: "Gagal mengubah status properti",
  });
}

export function useUbahKetersediaanProperti() {
  return useMutasi<PropertyDetail, { id: string; body: SetAvailabilityRequest }>({
    mutasi: ({ id, body }) => api.ubahKetersediaanProperti(id, body),
    kunciInvalidasi: [awalan.propertiMitra],
    pesanSukses: "Ketersediaan unit diperbarui",
    pesanGagal: "Gagal memperbarui ketersediaan",
  });
}

/** Mengaktifkan/menonaktifkan boost listing (kuota mengikuti paket mitra). */
export function useUbahBoostProperti() {
  return useMutasi<PropertyDetail, { id: string; body: SetBoostRequest }>({
    mutasi: ({ id, body }) => api.ubahBoostProperti(id, body),
    kunciInvalidasi: [awalan.propertiMitra, awalan.dashboardMitra],
    pesanSukses: "Status boost diperbarui",
    pesanGagal: "Gagal memperbarui boost",
  });
}

/** Daftar lead (klik WA / isi form) pada satu properti mitra. */
export function useLeadProperti(id: string, channel?: string, aktif = true) {
  return useQuery<LeadView[]>({
    queryKey: kunci.leadProperti(id, channel),
    queryFn: () => api.daftarLeadProperti(id, channel),
    enabled: Boolean(id) && aktif,
  });
}

export function useUnggahFotoMitra() {
  return useMutasi<UploadPhotoResponse, { propertyId: string; files: File[] }>({
    mutasi: ({ propertyId, files }) => api.unggahFotoMitra(propertyId, files),
    kunciInvalidasi: [awalan.propertiMitra],
    pesanSukses: "Foto berhasil diunggah",
    pesanGagal: "Gagal mengunggah foto",
  });
}

export function useHapusFotoMitra() {
  return useMutasi<void, { propertyId: string; photoId: string }>({
    mutasi: ({ propertyId, photoId }) => api.hapusFotoMitra(propertyId, photoId),
    kunciInvalidasi: [awalan.propertiMitra],
    pesanSukses: "Foto dihapus",
    pesanGagal: "Gagal menghapus foto",
  });
}

export function useTetapkanFotoUtama() {
  return useMutasi<PhotoView[], { propertyId: string; photoId: string }>({
    mutasi: ({ propertyId, photoId }) => api.tetapkanFotoUtamaMitra(propertyId, photoId),
    kunciInvalidasi: [awalan.propertiMitra],
    pesanSukses: "Foto utama diperbarui",
    pesanGagal: "Gagal menetapkan foto utama",
  });
}

export function useDaftarFavorit(query: ListQuery = {}) {
  return useQuery<Paginated<FavoriteView>>({
    queryKey: kunci.favorit(kunciDari(query)),
    queryFn: () => api.daftarFavorit(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useTambahFavorit() {
  return useMutasi<FavoriteToggleResponse, string>({
    mutasi: api.tambahFavorit,
    kunciInvalidasi: [awalan.favorit],
    pesanSukses: "Ditambahkan ke favorit",
    pesanGagal: "Gagal menambahkan favorit",
  });
}

export function useHapusFavorit() {
  return useMutasi<FavoriteToggleResponse, string>({
    mutasi: api.hapusFavorit,
    kunciInvalidasi: [awalan.favorit],
    pesanSukses: "Dihapus dari favorit",
    pesanGagal: "Gagal menghapus favorit",
  });
}

export function useCheckout() {
  return useMutasi<CheckoutResponse, CheckoutRequest>({
    mutasi: api.checkoutLangganan,
    kunciInvalidasi: [awalan.langgananMitra, awalan.dashboardMitra, awalan.profilMitra],
    pesanSukses: null,
    pesanGagal: "Gagal memulai pembayaran",
  });
}

export function useDaftarkanMitra() {
  return useMutasi<PartnerView, RegisterPartnerRequest>({
    mutasi: api.daftarkanMitra,
    kunciInvalidasi: [awalan.profilSaya, awalan.profilMitra, awalan.sesi],
    pesanSukses: "Pendaftaran mitra berhasil dikirim",
    pesanGagal: "Gagal mendaftarkan mitra",
  });
}

/**
 * Status satu order langganan.
 *
 * `intervalMs` (opsional) mengaktifkan polling otomatis; polling berhenti
 * sendiri ketika status order sudah final sehingga halaman transaksi berubah
 * tanpa perlu memuat ulang manual (Fase 6.5).
 */
export function useStatusOrder(orderCode: string, aktif = true, intervalMs?: number) {
  return useQuery<OrderStatusView>({
    queryKey: kunci.statusOrder(orderCode),
    queryFn: () => api.statusOrder(orderCode),
    enabled: Boolean(orderCode) && aktif,
    refetchInterval: (query) => {
      if (!intervalMs) return false;
      return statusOrderFinal(query.state.data?.order.status) ? false : intervalMs;
    },
  });
}

export function useInvoice(orderCode: string) {
  return useQuery<InvoiceView>({
    queryKey: kunci.invoice(orderCode),
    queryFn: () => api.ambilInvoice(orderCode),
    enabled: Boolean(orderCode),
  });
}

/** Memulai pembayaran QRIS/VA untuk satu order langganan. */
export function useChargeLangganan() {
  return useMutasi<PaymentView, { orderCode: string; body: ChargeRequest }>({
    mutasi: ({ orderCode, body }) => api.chargeLangganan(orderCode, body),
    kunciInvalidasi: [awalan.pembayaranOrder, awalan.transaksiMitra],
    pesanSukses: null,
    pesanGagal: "Gagal memulai pembayaran",
  });
}

/** Instruksi pembayaran QRIS/VA yang sudah dibuat untuk satu order. */
export function usePembayaranOrder(orderCode: string, aktif = true, intervalMs?: number) {
  return useQuery<PaymentView>({
    queryKey: kunci.pembayaranOrder(orderCode),
    queryFn: () => api.pembayaranLangganan(orderCode),
    enabled: Boolean(orderCode) && aktif,
    refetchInterval: (query) => {
      if (!intervalMs) return false;
      const data = query.state.data;
      if (!data) return false;
      return data.is_paid || statusOrderFinal(data.order.status) ? false : intervalMs;
    },
  });
}

/** Riwayat transaksi langganan milik mitra. */
export function useDaftarTransaksiMitra(query: ListQuery = {}) {
  return useQuery<Paginated<OrderView>>({
    queryKey: kunci.transaksiMitra(kunciDari(query)),
    queryFn: () => api.daftarTransaksiMitra(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

/* =============================================================== Publik */

export function usePaketPublik() {
  return useQuery<PlanView[]>({
    queryKey: kunci.paketPublik(),
    queryFn: api.daftarPaketPublik,
  });
}

/** Detail satu paket publik berdasarkan slug (dipakai halaman checkout). */
export function useDetailPaket(slug: string) {
  return useQuery<PlanView>({
    queryKey: kunci.detailPaketPublik(slug),
    queryFn: () => api.detailPaket(slug),
    enabled: Boolean(slug),
  });
}

/**
 * Perjanjian kemitraan yang sedang aktif.
 *
 * Halaman checkout memakai sumber publik ini, bukan `/vendor/agreement`, karena
 * pengguna baru belum berperan mitra saat menyetujui perjanjian (dan endpoint
 * vendor mensyaratkan peran tersebut).
 */
export function usePerjanjianAktif() {
  return useQuery<AgreementView>({
    queryKey: kunci.perjanjianAktif(),
    queryFn: api.perjanjianAktif,
  });
}

/** Pengaturan tampilan publik untuk area masuk (nama situs, logo, gambar). */
export function usePengaturanPublik() {
  return useQuery<SiteSettingsView>({
    queryKey: kunci.pengaturanPublik(),
    queryFn: api.ambilPengaturanPublik,
    staleTime: 5 * 60_000,
  });
}

export function usePropertiPublik(query: PropertyFilterQuery = {}) {
  return useQuery<Paginated<PropertySummary>>({
    queryKey: kunci.propertiPublik(kunciDari(query)),
    queryFn: () => api.cariProperti(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

/** Kategori aktif untuk filter katalog publik. */
export function useKategoriPublik() {
  return useQuery<CategoryView[]>({
    queryKey: kunci.kategoriPublik(),
    queryFn: api.daftarKategoriPublik,
    staleTime: 5 * 60_000,
  });
}

/** Detail properti publik berdasarkan slug (halaman detail katalog). */
export function useDetailPropertiPublik(slug: string) {
  return useQuery<PropertyDetail>({
    queryKey: kunci.detailPropertiPublik(slug),
    queryFn: () => api.detailProperti(slug),
    enabled: Boolean(slug),
  });
}

/**
 * Mengambil nomor WhatsApp mitra untuk sebuah properti.
 *
 * Dijalankan sebagai mutasi (bukan query) karena backend mencatat satu lead
 * pada setiap permintaan; dengan begitu pencatatan hanya terjadi saat pengunjung
 * benar-benar menekan tombol hubungi.
 */
export function useKontakProperti() {
  return useMutasi<PropertyContactResponse, string>({
    mutasi: (slug) => api.kontakProperti(slug),
    pesanSukses: null,
    pesanGagal: "Gagal menghubungi mitra",
  });
}

/**
 * Mengirim form kontak publik pada detail properti.
 *
 * Tercatat sebagai lead kanal "form" di backend, sehingga mitra dapat melihat
 * daftar pengunjung yang mengisi form.
 */
export function useKirimKontakProperti() {
  return useMutasi<ContactFormResponse, { slug: string; body: ContactFormRequest }>({
    mutasi: ({ slug, body }) => api.kirimKontakProperti(slug, body),
    pesanSukses: "Pesan Anda terkirim ke pengelola",
    pesanGagal: "Gagal mengirim pesan",
  });
}

/** Profil pengelola (mitra) beserta katalog publiknya (halaman /pengelola/{id}). */
export function usePengelolaPublik(id: string) {
  return useQuery<PartnerPublicView>({
    queryKey: kunci.pengelolaPublik(id),
    queryFn: () => api.profilPengelola(id),
    enabled: Boolean(id),
  });
}

/* ================================================================ Owner */

export function useDashboardOwner(): UseQueryResult<OwnerDashboard> {
  return useQuery({
    queryKey: kunci.dashboardOwner(),
    queryFn: api.dashboardOwner,
  });
}

export function useLaporanMitraOwner(query: ReportFilterQuery = {}) {
  return useQuery<Paginated<PartnerReportRow>>({
    queryKey: kunci.laporanMitraOwner(kunciDari(query)),
    queryFn: () => api.laporanMitraOwner(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

export function useLaporanLanggananOwner(query: ReportFilterQuery = {}) {
  return useQuery<SubscriptionReport>({
    queryKey: kunci.laporanLanggananOwner(kunciDari(query)),
    queryFn: () => api.laporanLanggananOwner(query),
    placeholderData: (sebelumnya) => sebelumnya,
  });
}

/* =============================================================== Landing */

/** Konten landing page untuk editor CMS admin/superadmin. */
export function useLandingAdmin(): UseQueryResult<LandingContentView> {
  return useQuery({
    queryKey: kunci.landing(),
    queryFn: api.ambilLandingAdmin,
  });
}

/** Konten landing page versi baca-saja untuk owner. */
export function useLandingOwner(): UseQueryResult<LandingContentView> {
  return useQuery({
    queryKey: kunci.landingOwner(),
    queryFn: api.ambilLandingOwner,
  });
}

/** Konten landing page publik; dipakai bila antarmuka klien perlu membacanya. */
export function useLandingPublik(): UseQueryResult<LandingContentView> {
  return useQuery({
    queryKey: kunci.landingPublik(),
    queryFn: api.ambilLandingPublik,
    staleTime: 5 * 60_000,
  });
}

export function usePerbaruiLanding() {
  return useMutasi<LandingContentView, UpdateLandingRequest>({
    mutasi: api.perbaruiLanding,
    kunciInvalidasi: [awalan.landing, awalan.landingOwner, awalan.landingPublik],
    pesanSukses: "Konten landing page disimpan",
    pesanGagal: "Gagal menyimpan konten landing page",
  });
}

export function usePublikasikanLanding() {
  return useMutasi<LandingPublishResponse, void>({
    mutasi: () => api.publikasikanLanding(),
    kunciInvalidasi: [awalan.landingPublik],
    pesanSukses: (data) => data.message || "Landing page dipublikasikan",
    pesanGagal: "Gagal mempublikasikan landing page",
  });
}

export function useUnggahGambarLanding() {
  return useMutasi<LandingImageResponse, { kind: LandingImageKind; file: File }>({
    mutasi: ({ kind, file }) => api.unggahGambarLanding(kind, file),
    pesanSukses: "Gambar landing berhasil diunggah",
    pesanGagal: "Gagal mengunggah gambar landing",
  });
}
