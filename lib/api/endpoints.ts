/**
 * Peta endpoint backend ENMProperty.
 *
 * Setiap fungsi di sini hanya menerjemahkan nama aksi bisnis menjadi
 * method + path + tipe kontrak. Hook TanStack Query memakai fungsi-fungsi
 * ini sehingga tidak ada string path yang tersebar di komponen.
 */

import {
  apiDelete,
  apiGet,
  apiGetPaginated,
  apiPatch,
  apiPost,
  apiPut,
  apiUnduh,
  buatQuery,
} from "@/lib/api/client";
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
  Paginated,
  PartnerPublicView,
  PartnerReportRow,
  PartnerView,
  PaymentView,
  PlanView,
  PropertyContactResponse,
  PropertyDetail,
  PropertyFilterQuery,
  PropertySummary,
  RegisterPartnerRequest,
  ReportFilterQuery,
  ResetPasswordResponse,
  SessionResponse,
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
  SubscriptionReportRow,
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
  PhotoView,
} from "@/types/api";

/* ------------------------------------------------------------------ Auth -- */

/** Sinkronisasi sesi Firebase dengan baris pengguna lokal. */
export function kirimSesi() {
  return apiPost<SessionResponse>("/auth/session");
}

/* -------------------------------------------------------------------- Me -- */

export function ambilProfilSaya() {
  return apiGet<UserView>("/me");
}

export function perbaruiProfilSaya(body: UpdateMeRequest) {
  return apiPut<UserView>("/me", body);
}

/* -------------------------------------------------------------- Katalog -- */

export function cariProperti(query: PropertyFilterQuery = {}) {
  return apiGetPaginated<PropertySummary>(`/properties${buatQuery(query)}`, { publik: true });
}

export function detailProperti(slug: string) {
  return apiGet<PropertyDetail>(`/properties/${slug}`, { publik: true });
}

/**
 * Mengambil nomor WhatsApp mitra untuk sebuah properti.
 *
 * Endpoint ini mensyaratkan login karena backend mencatat pengguna yang
 * menghubungi mitra; token dikirim otomatis oleh klien.
 */
export function kontakProperti(slug: string) {
  return apiGet<PropertyContactResponse>(`/properties/${slug}/contact`);
}

/** Mengirim form kontak publik pada detail properti (tercatat sebagai lead). */
export function kirimKontakProperti(slug: string, body: ContactFormRequest) {
  return apiPost<ContactFormResponse>(`/properties/${slug}/contact-form`, body);
}

/** Profil pengelola (mitra) beserta katalog publiknya. */
export function profilPengelola(id: string) {
  return apiGet<PartnerPublicView>(`/partners/${id}`, { publik: true });
}

/* ----------------------------------------------------------------- Paket -- */

export function daftarPaketPublik() {
  return apiGet<PlanView[]>("/packages", { publik: true });
}

export function detailPaket(slug: string) {
  return apiGet<PlanView>(`/packages/${slug}`, { publik: true });
}

export function daftarPaketAdmin(query: ListQuery = {}) {
  return apiGetPaginated<PlanView>(`/admin/packages${buatQuery(query)}`);
}

export function buatPaket(body: CreatePlanRequest) {
  return apiPost<PlanView>("/admin/packages", body);
}

export function perbaruiPaket(id: string, body: UpdatePlanRequest) {
  return apiPut<PlanView>(`/admin/packages/${id}`, body);
}

export function ubahStatusPaket(id: string, body: SetPlanStatusRequest) {
  return apiPatch<PlanView>(`/admin/packages/${id}/status`, body);
}

export function aturUlangPaket(planIds: string[]) {
  return apiPatch<PlanView[]>("/admin/packages/order", { plan_ids: planIds });
}

/* ------------------------------------------------------------- Kategori -- */

/** Kategori aktif untuk filter katalog publik. */
export function daftarKategoriPublik() {
  return apiGet<CategoryView[]>("/categories", { publik: true });
}

export function daftarKategoriAdmin(query: ListQuery = {}) {
  return apiGetPaginated<CategoryView>(`/admin/categories${buatQuery(query)}`);
}

export function buatKategori(body: CreateCategoryRequest) {
  return apiPost<CategoryView>("/admin/categories", body);
}

export function perbaruiKategori(id: string, body: UpdateCategoryRequest) {
  return apiPut<CategoryView>(`/admin/categories/${id}`, body);
}

export function ubahStatusKategori(id: string, body: SetPlanStatusRequest) {
  return apiPatch<CategoryView>(`/admin/categories/${id}/status`, body);
}

export function hapusKategori(id: string) {
  return apiDelete(`/admin/categories/${id}`);
}

/* ------------------------------------------------------------- Perjanjian -- */

export function perjanjianAktif() {
  return apiGet<AgreementView>("/agreements/active", { publik: true });
}

export function perjanjianMitra() {
  return apiGet<VendorAgreementResponse>("/vendor/agreement");
}

export function daftarPerjanjian(query: ListQuery = {}) {
  return apiGetPaginated<AgreementView>(`/admin/agreements${buatQuery(query)}`);
}

export function buatPerjanjian(body: CreateAgreementRequest) {
  return apiPost<AgreementView>("/admin/agreements", body);
}

export function aktifkanPerjanjian(id: string) {
  return apiPatch<AgreementView>(`/admin/agreements/${id}/activate`);
}

/* ---------------------------------------------------------------- Mitra -- */

export function daftarMitraAdmin(query: ListQuery = {}) {
  return apiGetPaginated<PartnerView>(`/admin/partners${buatQuery(query)}`);
}

export function detailMitraAdmin(id: string) {
  return apiGet<PartnerView>(`/admin/partners/${id}`);
}

export function ubahStatusMitra(id: string, body: SuspendPartnerRequest) {
  return apiPatch<PartnerView>(`/admin/partners/${id}/status`, body);
}

export function daftarkanMitra(body: RegisterPartnerRequest) {
  return apiPost<PartnerView>("/partners/register", body);
}

export function profilMitra() {
  return apiGet<PartnerView>("/vendor/profile");
}

export function perbaruiProfilMitra(body: UpdatePartnerRequest) {
  return apiPut<PartnerView>("/vendor/profile", body);
}

/* ------------------------------------------------------------ Langganan -- */

export function checkoutLangganan(body: CheckoutRequest) {
  return apiPost<CheckoutResponse>("/subscriptions/checkout", body);
}

export function statusOrder(orderCode: string) {
  return apiGet<OrderStatusView>(`/subscriptions/orders/${orderCode}/status`);
}

export function langgananMitra() {
  return apiGet<SubscriptionView>("/vendor/subscription");
}

/** Memulai pembayaran QRIS/VA untuk satu order langganan. */
export function chargeLangganan(orderCode: string, body: ChargeRequest) {
  return apiPost<PaymentView>(`/subscriptions/orders/${orderCode}/charge`, body);
}

/** Mengambil instruksi pembayaran yang sudah dibuat untuk satu order. */
export function pembayaranLangganan(orderCode: string) {
  return apiGet<PaymentView>(`/subscriptions/orders/${orderCode}/payment`);
}

/** Riwayat transaksi langganan milik mitra yang sedang masuk. */
export function daftarTransaksiMitra(query: ListQuery = {}) {
  return apiGetPaginated<OrderView>(`/vendor/orders${buatQuery(query)}`);
}

/* -------------------------------------------------------------- Invoice -- */

export function ambilInvoice(orderCode: string) {
  return apiGet<InvoiceView>(`/invoices/${orderCode}`);
}

export function unduhInvoicePdf(orderCode: string) {
  return apiUnduh(`/invoices/${orderCode}/pdf`);
}

/* ------------------------------------------------------- Dashboard Mitra -- */

export function dashboardMitra() {
  return apiGet<VendorDashboard>("/vendor/dashboard");
}

export function daftarPropertiMitra(query: PropertyFilterQuery = {}) {
  return apiGetPaginated<PropertySummary>(`/vendor/properties${buatQuery(query)}`);
}

export function detailPropertiMitra(id: string) {
  return apiGet<PropertyDetail>(`/vendor/properties/${id}`);
}

export function buatProperti(body: CreatePropertyRequest) {
  return apiPost<PropertyDetail>("/vendor/properties", body);
}

export function perbaruiProperti(id: string, body: CreatePropertyRequest) {
  return apiPut<PropertyDetail>(`/vendor/properties/${id}`, body);
}

export function hapusProperti(id: string) {
  return apiDelete(`/vendor/properties/${id}`);
}

export function ubahStatusProperti(id: string, body: SetPropertyStatusRequest) {
  return apiPatch<PropertyDetail>(`/vendor/properties/${id}/status`, body);
}

export function ubahKetersediaanProperti(id: string, body: SetAvailabilityRequest) {
  return apiPatch<PropertyDetail>(`/vendor/properties/${id}/availability`, body);
}

/** Mengaktifkan/menonaktifkan boost listing (kuota mengikuti paket mitra). */
export function ubahBoostProperti(id: string, body: SetBoostRequest) {
  return apiPatch<PropertyDetail>(`/vendor/properties/${id}/boost`, body);
}

/** Daftar lead (klik WA / isi form) pada satu properti mitra. */
export function daftarLeadProperti(id: string, channel?: string) {
  return apiGet<LeadView[]>(`/vendor/properties/${id}/leads${buatQuery({ channel })}`);
}

/* ------------------------------------------------------- Media Properti -- */

function formDataFoto(files: File[]) {
  const data = new FormData();
  for (const file of files) data.append("files", file);
  return data;
}

export function unggahFotoMitra(propertyId: string, files: File[]) {
  return apiPost<UploadPhotoResponse>(
    `/vendor/properties/${propertyId}/photos`,
    formDataFoto(files),
  );
}

export function hapusFotoMitra(propertyId: string, photoId: string) {
  return apiDelete(`/vendor/properties/${propertyId}/photos/${photoId}`);
}

export function aturUrutanFotoMitra(propertyId: string, photoIds: string[]) {
  return apiPatch<PhotoView[]>(`/vendor/properties/${propertyId}/photos/order`, {
    photo_ids: photoIds,
  });
}

export function tetapkanFotoUtamaMitra(propertyId: string, photoId: string) {
  return apiPatch<PhotoView[]>(
    `/vendor/properties/${propertyId}/photos/${photoId}/primary`,
  );
}

export function unggahFotoAdmin(propertyId: string, files: File[]) {
  return apiPost<UploadPhotoResponse>(
    `/admin/properties/${propertyId}/photos`,
    formDataFoto(files),
  );
}

export function hapusFotoAdmin(propertyId: string, photoId: string) {
  return apiDelete(`/admin/properties/${propertyId}/photos/${photoId}`);
}

/* ------------------------------------------------------- Dashboard Admin -- */

export function dashboardAdmin() {
  return apiGet<AdminDashboard>("/admin/dashboard");
}

export function daftarPropertiAdmin(query: PropertyFilterQuery = {}) {
  return apiGetPaginated<PropertySummary>(`/admin/properties${buatQuery(query)}`);
}

export function buatPropertiAdmin(body: CreatePropertyRequest & { partner_id: string; publish?: boolean }) {
  return apiPost<PropertyDetail>("/admin/properties", body);
}

export function perbaruiPropertiAdmin(id: string, body: AdminUpdatePropertyRequest) {
  return apiPut<PropertyDetail>(`/admin/properties/${id}`, body);
}

export function ubahStatusPropertiAdmin(id: string, body: AdminPropertyStatusRequest) {
  return apiPatch<PropertyDetail>(`/admin/properties/${id}/status`, body);
}

/* ---------------------------------------------------------- Laporan Admin -- */

export function laporanLanggananAdmin(query: ReportFilterQuery = {}) {
  return apiGet<SubscriptionReport>(`/admin/reports/subscriptions${buatQuery(query)}`);
}

export function detailLaporanLangganan(orderCode: string) {
  return apiGet<SubscriptionReportRow>(`/admin/reports/subscriptions/${orderCode}`);
}

export function unduhLaporanLangganan(query: ReportFilterQuery = {}) {
  return apiUnduh(`/admin/reports/subscriptions/export${buatQuery(query)}`);
}

/* ------------------------------------------------------------- Pengguna -- */

export function daftarPengguna(query: ListQuery = {}) {
  return apiGetPaginated<UserView>(`/admin/users${buatQuery(query)}`);
}

export function detailPengguna(id: string) {
  return apiGet<UserView>(`/admin/users/${id}`);
}

export function buatPengguna(body: AdminCreateUserRequest) {
  return apiPost<UserView>("/admin/users", body);
}

export function perbaruiPengguna(id: string, body: AdminUpdateUserRequest) {
  return apiPut<UserView>(`/admin/users/${id}`, body);
}

export function ubahStatusPengguna(id: string, body: SetUserStatusRequest) {
  return apiPatch<UserView>(`/admin/users/${id}/status`, body);
}

export function resetSandiPengguna(id: string) {
  return apiPost<ResetPasswordResponse>(`/admin/users/${id}/reset-password`);
}

/* ---------------------------------------------------------- Pengaturan -- */

export function ambilPengaturan() {
  return apiGet<SettingView[]>("/admin/settings");
}

export function perbaruiPengaturan(body: UpdateSettingsRequest) {
  return apiPut<SettingView[]>("/admin/settings", body);
}

/** Pengaturan tampilan publik: nama situs, logo, dan gambar area masuk. */
export function ambilPengaturanPublik() {
  return apiGet<SiteSettingsView>("/settings", { publik: true });
}

/**
 * Mengunggah berkas gambar pengaturan (logo/gambar login). Backend mengonversi
 * berkas ke WebP otomatis; pemanggil cukup mengirim satu berkas mentah.
 */
export function unggahGambarPengaturan(kind: SettingImageKind, file: File) {
  const data = new FormData();
  data.append("files", file);
  return apiPost<SettingImageResponse>(`/admin/settings/images/${kind}`, data);
}

/* --------------------------------------------------------------- Audit -- */

export function daftarAudit(query: AuditFilterQuery = {}) {
  return apiGetPaginated<AuditView>(`/admin/audit-logs${buatQuery(query)}`);
}

export function unduhAudit(query: AuditFilterQuery = {}) {
  return apiUnduh(`/admin/audit-logs/export${buatQuery(query)}`);
}

/* ---------------------------------------------------------------- Owner -- */

export function dashboardOwner() {
  return apiGet<OwnerDashboard>("/owner/dashboard");
}

export function laporanLanggananOwner(query: ReportFilterQuery = {}) {
  return apiGet<SubscriptionReport>(`/owner/reports/subscriptions${buatQuery(query)}`);
}

export function laporanMitraOwner(query: ReportFilterQuery = {}) {
  return apiGetPaginated<PartnerReportRow>(`/owner/reports/partners${buatQuery(query)}`);
}

/* ------------------------------------------------------------ Landing -- */

/** Konten landing page publik (dipakai halaman ISR dan pembaruan cache). */
export function ambilLandingPublik() {
  return apiGet<LandingContentView>("/landing", { publik: true });
}

/** Konten landing page untuk editor CMS (admin dan superadmin). */
export function ambilLandingAdmin() {
  return apiGet<LandingContentView>("/admin/landing");
}

/** Konten landing page versi baca-saja untuk owner. */
export function ambilLandingOwner() {
  return apiGet<LandingContentView>("/owner/landing");
}

/** Menyimpan perubahan konten landing page dari CMS. */
export function perbaruiLanding(body: UpdateLandingRequest) {
  return apiPut<LandingContentView>("/admin/landing", body);
}

/** Memicu revalidasi ISR halaman landing page di frontend. */
export function publikasikanLanding() {
  return apiPost<LandingPublishResponse>("/admin/landing/publish");
}

/**
 * Mengunggah gambar landing (hero/og). Backend mengonversi berkas ke WebP
 * secara otomatis; pemanggil cukup mengirim satu berkas mentah.
 */
export function unggahGambarLanding(kind: LandingImageKind, file: File) {
  const data = new FormData();
  data.append("files", file);
  return apiPost<LandingImageResponse>(`/admin/landing/images/${kind}`, data);
}

/* -------------------------------------------------------------- Favorit -- */

export function daftarFavorit(query: ListQuery = {}) {
  return apiGetPaginated<FavoriteView>(`/me/favorites${buatQuery(query)}`);
}

export function tambahFavorit(propertyId: string) {
  return apiPost<FavoriteToggleResponse>(`/me/favorites/${propertyId}`);
}

export function hapusFavorit(propertyId: string) {
  return apiDelete<FavoriteToggleResponse>(`/me/favorites/${propertyId}`);
}

/* Ekspor tipe agar pemanggil tidak perlu mengimpor dua berkas. */
export type { Paginated, PropertyFilterQuery, ListQuery, ReportFilterQuery };
