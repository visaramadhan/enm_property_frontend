/**
 * Kontrak data API backend ENMProperty.
 *
 * Seluruh tipe di bawah disalin langsung dari DTO Go pada `backend/dto/*.go`
 * dan `backend/models/enums.go` agar tidak ada field yang dikarang. Setiap
 * penambahan field baru di backend wajib diselaraskan di berkas ini.
 */

/* ---------------------------------------------------------------- Amplop -- */

export interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface SuccessBody<T> {
  success: true;
  data: T;
  meta?: Meta;
}

export interface ErrorBody {
  success: false;
  error: ErrorPayload;
}

/** Hasil daftar berpaginasi: data + meta. */
export interface Paginated<T> {
  items: T[];
  meta: Meta;
}

/* ----------------------------------------------------------------- Enum -- */

export type Role = "customer" | "mitra" | "admin" | "superadmin" | "owner";
export type UserStatus = "active" | "disabled";
export type PartnerStatus = "pending" | "active" | "suspended" | "expired";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type OrderStatus = "pending" | "paid" | "failed" | "expired" | "cancelled";
export type OrderKind = "new" | "renewal" | "upgrade" | "free";
export type PaymentProvider = "midtrans" | "free" | "simulated";
export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "inactive"
  | "expired";
export type ListingType = "dijual" | "disewa";
export type PricePeriod = "hari" | "bulan" | "tahun";
export type PropertyType =
  | "rumah"
  | "apartemen"
  | "ruko"
  | "tanah"
  | "villa"
  | "kantor"
  | "gudang"
  | "lainnya";
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "activate"
  | "deactivate"
  | "reset_password"
  | "export"
  | "login";

/* ----------------------------------------------------------- Auth & Akun -- */

export interface UserView {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  role: Role;
  role_label: string;
  status: UserStatus;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  partner?: PartnerView;
}

export interface SessionResponse {
  user: UserView;
  role: string;
}

export interface UpdateMeRequest {
  name: string;
  phone?: string;
}

export interface AdminCreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: Role;
}

export interface AdminUpdateUserRequest {
  name?: string;
  phone?: string;
  role?: Role;
}

export interface SetUserStatusRequest {
  active: boolean;
  reason?: string;
}

export interface ResetPasswordResponse {
  reset_link: string;
}

/* --------------------------------------------------------------- Mitra --- */

export interface PartnerView {
  id: string;
  user_id: string;
  business_name: string;
  pic_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  status: PartnerStatus;
  status_label: string;
  suspended_reason?: string;
  agreement_accepted_at?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerDetail {
  id: string;
  business_name: string;
  pic_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
}

export interface PartnerSummary {
  id: string;
  business_name: string;
  pic_name: string;
  phone: string;
  email: string;
  city: string;
  province: string;
}

export interface RegisterPartnerRequest {
  business_name: string;
  pic_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  province: string;
}

export type UpdatePartnerRequest = RegisterPartnerRequest;

export interface SuspendPartnerRequest {
  status: "active" | "suspended" | "expired";
  reason: string;
}

/* ------------------------------------------------------------ Properti -- */

export interface PhotoView {
  id: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  width: number;
  height: number;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface PropertySummary {
  id: string;
  slug: string;
  title: string;
  listing_type: ListingType;
  listing_type_label: string;
  property_type: PropertyType;
  property_type_label: string;
  city: string;
  province: string;
  price: number;
  price_label: string;
  price_period?: PricePeriod;
  land_area: number;
  building_area: number;
  bedrooms: number;
  bathrooms: number;
  units_available: number;
  cover_url: string;
  status: PropertyStatus;
  status_label: string;
  views: number;
  is_favorite: boolean;
  /** Kategori properti dari master data (opsional). */
  category_id: string;
  category_name: string;
  /** Jumlah klik WhatsApp/lead yang dipakai algoritma pengurutan. */
  contact_count: number;
  /** Jumlah lead kanal "klik WhatsApp"; hanya terisi pada tabel properti mitra. */
  wa_contact_count: number;
  /** Jumlah lead kanal "isi form"; hanya terisi pada tabel properti mitra. */
  form_contact_count: number;
  /** Menandakan listing sedang di-boost oleh mitra berpaket. */
  boost_active: boolean;
  /** Batas waktu boost; boost hanya berlaku sampai waktu ini. */
  boost_until?: string;
  /** Statistik reputasi untuk pengurutan katalog. */
  rating_count: number;
  rating_avg: number;
  favorite_count: number;
  published_at?: string;
  created_at: string;
}

export interface PropertyDetail extends PropertySummary {
  description: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  facilities: string[];
  units_total: number;
  partner_id: string;
  partner_name: string;
  partner?: PartnerSummary;
  photos: PhotoView[];
  deleted_at?: string;
  updated_at: string;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  listing_type: ListingType;
  property_type: PropertyType;
  address: string;
  city: string;
  province: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  price: number;
  price_period?: PricePeriod;
  land_area?: number;
  building_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  facilities?: string[];
  units_total?: number;
  category_id?: string;
  status?: "draft" | "active";
}

export interface AdminUpdatePropertyRequest
  extends Omit<Partial<CreatePropertyRequest>, "status"> {
  units_available?: number;
  status?: PropertyStatus;
}

export interface SetPropertyStatusRequest {
  status: "draft" | "active" | "inactive";
}

export interface SetAvailabilityRequest {
  units_available: number;
}

/** Body `PATCH /vendor/properties/{id}/boost`. */
export interface SetBoostRequest {
  active: boolean;
}

export interface AdminPropertyStatusRequest {
  status: PropertyStatus;
  reason?: string;
}

export interface PropertyFilterQuery {
  page?: number;
  per_page?: number;
  search?: string;
  city?: string;
  province?: string;
  listing_type?: ListingType;
  property_type?: PropertyType;
  category_id?: string;
  status?: PropertyStatus;
  price_min?: number;
  price_max?: number;
  sort_by?: "price" | "views" | "title" | "created_at";
  sort_desc?: boolean;
}

export interface PropertyContactResponse {
  property_id: string;
  property_title: string;
  partner_name: string;
  phone: string;
  whatsapp_url: string;
  message: string;
  is_fallback: boolean;
}

/** Body `POST /properties/{slug}/contact-form` (form kontak publik). */
export interface ContactFormRequest {
  name: string;
  phone: string;
  message: string;
}

/** Respons setelah form kontak publik tersimpan. */
export interface ContactFormResponse {
  recorded: boolean;
}

/** Satu catatan lead properti pada tabel mitra (kanal "whatsapp" atau "form"). */
export interface LeadView {
  id: string;
  channel: "whatsapp" | "form" | string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  name?: string;
  phone?: string;
  message?: string;
  created_at: string;
}

/**
 * Profil pengelola (mitra) beserta katalog publiknya untuk halaman
 * `/pengelola/{id}`. Selaras `backend/dto.PartnerPublicView`.
 */
export interface PartnerPublicView {
  id: string;
  business_name: string;
  pic_name: string;
  city: string;
  province: string;
  joined_at?: string;
  total_listings: number;
  properties: PropertySummary[];
}

export interface PhotoOrderRequest {
  photo_ids: string[];
}

export interface UploadPhotoResponse {
  property_id: string;
  uploaded: PhotoView[];
  total: number;
  limit: number;
}

/* ---------------------------------------------------------------- Paket -- */

export interface PlanView {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  price_label: string;
  duration_days: number;
  listing_quota: number;
  is_unlimited: boolean;
  features: string[];
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  /** Level paket (1,2,3,...): makin tinggi makin diprioritaskan di katalog. */
  level: number;
  /** Boost hanya berlaku bila paket mengizinkan dan listing menyalakannya. */
  boost_enabled: boolean;
  /** Jumlah listing yang boleh di-boost bersamaan (0 = tanpa boost). */
  boost_quota: number;
  /** Akses pengaturan keyword di sisi mitra (paket gratis selalu false). */
  keyword_access: boolean;
  /** Akses pengaturan katalog di sisi mitra (paket gratis selalu false). */
  catalog_access: boolean;
  /** Akses pengaturan nomor WhatsApp di sisi mitra (paket gratis selalu false). */
  whatsapp_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  slug?: string;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  listing_quota: number;
  features?: string[];
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  level?: number;
  boost_enabled?: boolean;
  boost_quota?: number;
  keyword_access?: boolean;
  catalog_access?: boolean;
  whatsapp_access?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  duration_days?: number;
  listing_quota?: number;
  features?: string[];
  is_free?: boolean;
  is_active?: boolean;
  sort_order?: number;
  level?: number;
  boost_enabled?: boolean;
  boost_quota?: number;
  keyword_access?: boolean;
  catalog_access?: boolean;
  whatsapp_access?: boolean;
}

/* ------------------------------------------------------------- Kategori -- */

export interface CategoryView {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  slug?: string;
  name: string;
  description?: string;
  sort_order?: number;
  is_active: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface FacilityView {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFacilityRequest {
  slug?: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  is_active: boolean;
}

export interface UpdateFacilityRequest {
  name?: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface SetPlanStatusRequest {
  active: boolean;
}

/* -------------------------------------------------- Langganan & Checkout -- */

export interface SubscriptionView {
  id: string;
  partner_id: string;
  plan_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  status_label: string;
  starts_at: string;
  ends_at: string;
  days_remaining: number;
  is_active: boolean;
  show_alert: boolean;
  alert_threshold_days: number;
  listings_used: number;
  listing_quota: number;
  listing_remaining: number;
  /** Kuota boost listing paket aktif (0 = tanpa boost). */
  boost_quota: number;
  /** Jumlah listing yang sedang di-boost bersamaan. */
  boost_used: number;
  /** Mitra boleh mengisi nomor WhatsApp sendiri (paket Gratis selalu false). */
  whatsapp_access: boolean;
  updated_at: string;
  last_order_code?: string;
}

export interface OrderView {
  id: string;
  code: string;
  user_id: string;
  partner_id: string;
  partner_name: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  plan_price_label: string;
  plan_duration_days: number;
  amount: number;
  amount_label: string;
  kind: OrderKind;
  kind_label: string;
  status: OrderStatus;
  status_label: string;
  provider: PaymentProvider;
  paid_at?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutRequest {
  package_slug: string;
  mode?: OrderKind;
  partner?: RegisterPartnerRequest;
  agreement_id?: string;
  agree_agreement: boolean;
}

export interface CheckoutResponse {
  order: OrderView;
  snap_token?: string;
  snap_redirect_url?: string;
  client_key?: string;
  simulated: boolean;
  free_active: boolean;
}

export interface OrderStatusView {
  order: OrderView;
  can_retry: boolean;
  subscription?: SubscriptionView;
}

export type PaymentMethod = "qris" | "va";

/** Kanal pembayaran: QRIS atau bank virtual account. */
export type PaymentChannel = "qris" | "bca" | "bni" | "bri" | "permata";

export interface ChargeRequest {
  method: PaymentChannel;
}

/** Instruksi pembayaran QRIS/VA untuk halaman pembayaran mitra. */
export interface PaymentView {
  order: OrderView;
  method: PaymentMethod | "";
  method_label: string;
  channel: PaymentChannel | "";
  channel_label: string;
  number?: string;
  qr_url?: string;
  qr_string?: string;
  expires_at?: string;
  is_paid: boolean;
  can_retry: boolean;
}

export interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  total_label: string;
}

export interface InvoiceView {
  invoice_number: string;
  order: OrderView;
  partner: PartnerDetail;
  items: InvoiceItem[];
  subtotal: number;
  subtotal_label: string;
  total: number;
  total_label: string;
  issued_at: string;
  paid_at?: string;
  is_paid: boolean;
}

/* ------------------------------------------------------------ Dashboard -- */

export interface PropertyStats {
  total: number;
  active: number;
  draft: number;
  pending_review: number;
  inactive: number;
  expired: number;
}

export interface PartnerStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  expired: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  paid: number;
  failed: number;
  expired: number;
  cancelled: number;
  revenue: number;
  revenue_label: string;
  revenue_this_month: number;
  revenue_this_month_label: string;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
  cancelled: number;
}

export interface AdminDashboard {
  partners: PartnerStats;
  properties: PropertyStats;
  subscriptions: SubscriptionStats;
  orders: OrderStats;
  property_views: number;
  property_contacts: number;
  generated_at: string;
}

export interface VendorDashboard {
  partner_id: string;
  partner_name: string;
  partner_status: PartnerStatus;
  properties: PropertyStats;
  property_views: number;
  property_contacts: number;
  favorites: number;
  listing_quota: number;
  listing_used: number;
  listing_remaining: number;
  subscription?: SubscriptionView;
  recent_properties: PropertySummary[];
  generated_at: string;
}

export interface OwnerDashboard {
  partners: PartnerStats;
  properties: PropertyStats;
  subscriptions: SubscriptionStats;
  orders: OrderStats;
  top_partners: PartnerReportRow[];
  generated_at: string;
}

/* -------------------------------------------------------------- Laporan -- */

export interface SubscriptionReportRow {
  order_code: string;
  partner_id: string;
  partner_name: string;
  plan_id: string;
  plan_name: string;
  kind: OrderKind;
  status: OrderStatus;
  status_label: string;
  provider: PaymentProvider;
  amount: number;
  amount_label: string;
  created_at: string;
  paid_at?: string;
  expires_at: string;
}

export interface SubscriptionReport {
  rows: SubscriptionReportRow[];
  total: number;
  total_amount: number;
  total_amount_label: string;
}

export interface PartnerReportRow {
  partner_id: string;
  business_name: string;
  pic_name: string;
  phone: string;
  city: string;
  province: string;
  status: PartnerStatus;
  status_label: string;
  plan_name: string;
  subscription_ends_at?: string;
  properties_total: number;
  properties_active: number;
  property_views: number;
  property_contacts: number;
  joined_at?: string;
}

export interface ReportFilterQuery {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  plan_id?: string;
  partner_id?: string;
  city?: string;
  province?: string;
  from?: string;
  to?: string;
  format?: "xlsx" | "pdf";
}

/* ---------------------------------------------------------- Perjanjian -- */

export interface AgreementView {
  id: string;
  version: string;
  title: string;
  content: string;
  checklist: string[];
  is_active: boolean;
  effective_at: string;
  created_by: string;
  created_at: string;
}

export interface CreateAgreementRequest {
  version: string;
  title: string;
  content: string;
  checklist?: string[];
  effective_at?: string;
  activate: boolean;
}

/** Body POST /vendor/agreement. */
export interface AcceptAgreementRequest {
  agreement_id?: string;
}

export interface AgreementAcceptanceView {
  id: string;
  agreement_id: string;
  agreement_version: string;
  partner_id: string;
  user_id: string;
  accepted_at: string;
  ip_address: string;
}

/** Respons GET /vendor/agreement. */
export interface VendorAgreementResponse {
  agreement: AgreementView;
  accepted: boolean;
  acceptance?: AgreementAcceptanceView;
}

/* ---------------------------------------------------------- Pengaturan -- */

export interface SettingView {
  key: string;
  label: string;
  value: string;
  description: string;
  is_secret: boolean;
  updated_at: string;
}

export interface SettingUpdate {
  key: string;
  value: string;
}

export interface UpdateSettingsRequest {
  settings: SettingUpdate[];
}

/**
 * Pengaturan tampilan yang dibaca halaman publik (mis. area masuk) tanpa
 * autentikasi. Nilai kosong berarti antarmuka memakai tampilan bawaan.
 */
export interface SiteSettingsView {
  site_name: string;
  nav_title: string;
  logo_url: string;
  brand_color: string;
  login_image_url: string;
  /** Nomor kontak cadangan sistem saat mitra tidak mengisi nomor WhatsApp. */
  contact_whatsapp: string;
}

/** Jenis gambar pengaturan yang dapat diunggah (backend mengonversi ke WebP). */
export type SettingImageKind = "logo" | "login";

/** Hasil unggah gambar pengaturan setelah dikonversi otomatis ke WebP. */
export interface SettingImageResponse {
  key: string;
  url: string;
  width: number;
  height: number;
  size_bytes: number;
}

/* --------------------------------------------------------------- Audit -- */

export interface AuditView {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  actor_role: Role;
  action: AuditAction;
  entity: string;
  entity_id: string;
  before?: string;
  after?: string;
  note?: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AuditFilterQuery {
  page?: number;
  per_page?: number;
  search?: string;
  entity?: string;
  entity_id?: string;
  actor_id?: string;
  actor_role?: Role;
  action?: AuditAction;
  from?: string;
  to?: string;
  format?: "xlsx" | "pdf";
}

/* ------------------------------------------------------------- Favorit -- */

export interface FavoriteView {
  id: string;
  property_id: string;
  created_at: string;
  property?: PropertySummary;
}

export interface FavoriteToggleResponse {
  property_id: string;
  is_favorite: boolean;
}

/* ----------------------------------------------------- Query generik ---- */

/**
 * Parameter daftar standar yang dipakai seluruh endpoint berpaginasi.
 *
 * Sengaja tidak memakai index signature agar DTO filter konkret (mis.
 * `FilterMitra`, `FilterAkun`) dapat diteruskan langsung sebagai argumen.
 */
export interface ListQuery {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_desc?: boolean;
}

/* ---------------------------------------------------------------- Landing -- */

/**
 * Konten landing page siap pakai (CMS editor maupun halaman publik).
 * Selaras `backend/dto/landing.go`.
 */
export interface LandingContentView {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_image_url: string;
  meta_title: string;
  meta_description: string;
  meta_og_image: string;
  highlight_areas: string[];
  cta_title: string;
  cta_description: string;
  keunggulan_title: string;
  keunggulan_subtitle: string;
  properti_title: string;
  properti_subtitle: string;
  paket_title: string;
  paket_subtitle: string;
  panduan_title: string;
  panduan_subtitle: string;
  faq_title: string;
  faq_subtitle: string;
  /** Varian bahasa Inggris (khusus halaman landing `/en`). */
  hero_title_en: string;
  hero_subtitle_en: string;
  hero_cta_text_en: string;
  meta_title_en: string;
  meta_description_en: string;
  cta_title_en: string;
  cta_description_en: string;
  keunggulan_title_en: string;
  keunggulan_subtitle_en: string;
  properti_title_en: string;
  properti_subtitle_en: string;
  paket_title_en: string;
  paket_subtitle_en: string;
  panduan_title_en: string;
  panduan_subtitle_en: string;
  faq_title_en: string;
  faq_subtitle_en: string;
  updated_at: string;
}

/** Body `PUT /admin/landing`; batas panjang mengikuti aturan SEO. */
export interface UpdateLandingRequest {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_image_url: string;
  meta_title: string;
  meta_description: string;
  meta_og_image: string;
  highlight_areas: string[];
  cta_title: string;
  cta_description: string;
  keunggulan_title: string;
  keunggulan_subtitle: string;
  properti_title: string;
  properti_subtitle: string;
  paket_title: string;
  paket_subtitle: string;
  panduan_title: string;
  panduan_subtitle: string;
  faq_title: string;
  faq_subtitle: string;
  /** Varian bahasa Inggris; opsional (boleh kosong). */
  hero_title_en: string;
  hero_subtitle_en: string;
  hero_cta_text_en: string;
  meta_title_en: string;
  meta_description_en: string;
  cta_title_en: string;
  cta_description_en: string;
  keunggulan_title_en: string;
  keunggulan_subtitle_en: string;
  properti_title_en: string;
  properti_subtitle_en: string;
  paket_title_en: string;
  paket_subtitle_en: string;
  panduan_title_en: string;
  panduan_subtitle_en: string;
  faq_title_en: string;
  faq_subtitle_en: string;
}

/** Jenis gambar landing yang dapat diunggah melalui CMS. */
export type LandingImageKind = "hero" | "og";

/** Hasil unggah gambar landing setelah dikonversi otomatis ke WebP. */
export interface LandingImageResponse {
  url: string;
  kind: string;
  mime_type: string;
  width: number;
  height: number;
  size_bytes: number;
}

/** Hasil tombol "Publish Perubahan Landing Page" (revalidasi ISR). */
export interface LandingPublishResponse {
  message: string;
  revalidated: boolean;
}
