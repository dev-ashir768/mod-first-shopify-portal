import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { api } from "@/lib/api";

/**
 * Users & Branches list APIs from the ModFirst collection.
 * Request shape: { page, limit, startDate, endDate, filters: {...} }
 * Response envelope: { success, status, message, payload: {...} }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

export const USER_ROLES = [
  "super_admin",
  "admin",
  "manager",
  "designer",
  "sales",
  "support",
  "content_writer",
  "production",
  "accountant",
  "customer",
] as const;

export interface UserRow {
  id: number | string;
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
  branch_id?: number | null;
  is_active?: boolean;
  is_locked?: boolean;
  is_admin?: boolean;
  image?: string | null;
  created_at?: string;
}

export interface BranchRow {
  id: number | string;
  name: string;
  code: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  manager_email?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface ListResult<T> {
  rows: T[];
  total: number;
  totalPages: number;
}

interface ListParams {
  page: number;
  limit: number;
  dateRange?: DateRange;
  filters?: Json;
}

function buildBody({ page, limit, dateRange, filters }: ListParams): Json {
  const body: Json = { page, limit };
  if (dateRange?.from) body.startDate = format(dateRange.from, "yyyy-MM-dd");
  if (dateRange?.to) body.endDate = format(dateRange.to, "yyyy-MM-dd");
  const clean = Object.fromEntries(
    Object.entries(filters ?? {}).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
  if (Object.keys(clean).length) body.filters = clean;
  return body;
}

function parseList<T>(data: Json, limit: number): ListResult<T> {
  const p: Json = data?.payload ?? data?.data ?? data ?? {};
  const rows: T[] = Array.isArray(p)
    ? p
    : p.rows ?? p.items ?? p.list ?? p.users ?? p.branches ?? p.data ?? [];
  // API may put pagination at root level (data.pagination) or inside payload
  const pg: Json = data?.pagination ?? p.pagination ?? {};
  const total: number =
    pg.total ?? p.total ?? p.count ?? p.totalRecords ?? rows.length;
  const totalPages: number =
    pg.totalPages ?? p.totalPages ?? Math.max(1, Math.ceil(total / limit));
  return { rows, total, totalPages };
}

export async function listUsers(params: ListParams): Promise<ListResult<UserRow>> {
  const { data } = await api.post("users/list", buildBody(params));
  return parseList<UserRow>(data, params.limit);
}

export async function listBranches(
  params: ListParams
): Promise<ListResult<BranchRow>> {
  const { data } = await api.post("branches/list", buildBody(params));
  return parseList<BranchRow>(data, params.limit);
}

export interface SizeRow {
  id: number | string;
  name: string;
  display_name: string;
  is_active?: boolean;
  created_at?: string;
}

export interface ColorRow {
  id: number | string;
  name: string;
  hex_code: string;
  is_active?: boolean;
  created_at?: string;
}

export async function listSizes(params: ListParams): Promise<ListResult<SizeRow>> {
  const { data } = await api.post("sizes/list", buildBody(params));
  return parseList<SizeRow>(data, params.limit);
}

export async function listColors(
  params: ListParams
): Promise<ListResult<ColorRow>> {
  const { data } = await api.post("colors/list", buildBody(params));
  return parseList<ColorRow>(data, params.limit);
}

export const MENU_LINK_TYPES = [
  "category",
  "product",
  "page",
  "collection",
  "external_url",
  "custom",
] as const;

export interface MenuRow {
  id: number | string;
  name: string;
  slug: string;
  menu_type: "frontend" | "dashboard";
  parent_id?: number | null;
  sort_order?: number;
  icon?: string | null;
  link_type?: string;
  external_url?: string | null;
  open_in_new_tab?: boolean;
  visibility?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface MenuRightRow {
  id: number | string;
  menu_id: number;
  menu?: { name?: string; slug?: string } | null;
  role: string;
  can_view?: boolean;
  can_create?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  created_at?: string;
}

export async function listMenus(params: ListParams): Promise<ListResult<MenuRow>> {
  const { data } = await api.post("menus/list", buildBody(params));
  return parseList<MenuRow>(data, params.limit);
}

/** Create endpoints — return the API's success message. */
async function createRecord(path: string, body: Json, fallback: string) {
  const { data } = await api.post(path, body);
  return (data?.message as string) ?? fallback;
}

export const createUser = (body: Json) =>
  createRecord("users", body, "User created.");
export const createBranch = (body: Json) =>
  createRecord("branches", body, "Branch created.");
export const createSize = (body: Json) =>
  createRecord("sizes", body, "Size created.");
export const createColor = (body: Json) =>
  createRecord("colors", body, "Color created.");

/** Update endpoints — PUT :id, return the API's success message. */
async function updateRecord(path: string, body: Json, fallback: string) {
  const { data } = await api.put(path, body);
  return (data?.message as string) ?? fallback;
}

export const updateUser = (id: number | string, body: Json) =>
  updateRecord(`users/${id}`, body, "User updated.");
export const unlockUser = async (id: number | string) => {
  const { data } = await api.put(`users/${id}/unlock`);
  return (data?.message as string) ?? "User unlocked.";
};
export const updateBranch = (id: number | string, body: Json) =>
  updateRecord(`branches/${id}`, body, "Branch updated.");
export const updateSize = (id: number | string, body: Json) =>
  updateRecord(`sizes/${id}`, body, "Size updated.");
export const updateColor = (id: number | string, body: Json) =>
  updateRecord(`colors/${id}`, body, "Color updated.");

export const BLOG_STATUSES = ["draft", "published", "archived"] as const;

export interface BlogRow {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  featured_image?: string | null;
  category?: string | null;
  tags?: string | null;
  status?: "draft" | "published" | "archived";
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export async function listBlogs(params: ListParams): Promise<ListResult<BlogRow>> {
  const { data } = await api.post("blogs/list", buildBody(params));
  return parseList<BlogRow>(data, params.limit);
}

export const createBlog = (body: Json) =>
  createRecord("blogs", body, "Blog created.");
export const updateBlog = (id: number | string, body: Json) =>
  updateRecord(`blogs/${id}`, body, "Blog updated.");

export const CAMPAIGN_STATUSES = [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
] as const;
export const SUBSCRIBER_STATUSES = ["subscribed", "unsubscribed", "pending"] as const;
export const SUBSCRIBER_SOURCES = [
  "footer",
  "popup",
  "checkout",
  "account",
  "manual",
] as const;

export interface CampaignRow {
  id: number | string;
  subject: string;
  preview_text?: string | null;
  content?: string;
  featured_image?: string | null;
  status?: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface SubscriberRow {
  id: number | string;
  email: string;
  full_name?: string | null;
  status?: string;
  source?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export async function listCampaigns(
  params: ListParams
): Promise<ListResult<CampaignRow>> {
  const { data } = await api.post("newsletters/list", buildBody(params));
  return parseList<CampaignRow>(data, params.limit);
}

export const createCampaign = (body: Json) =>
  createRecord("newsletters", body, "Campaign created.");
export const updateCampaign = (id: number | string, body: Json) =>
  updateRecord(`newsletters/${id}`, body, "Campaign updated.");
export const sendCampaign = async (id: number | string) => {
  const { data } = await api.post(`newsletters/${id}/send`);
  return (data?.message as string) ?? "Campaign is being sent.";
};

export async function listSubscribers(
  params: ListParams
): Promise<ListResult<SubscriberRow>> {
  const { data } = await api.post("newsletters/subscribers/list", buildBody(params));
  return parseList<SubscriberRow>(data, params.limit);
}

export const createSubscriber = (body: Json) =>
  createRecord("newsletters/subscribers", body, "Subscriber added.");
export const updateSubscriber = (id: number | string, body: Json) =>
  updateRecord(`newsletters/subscribers/${id}`, body, "Subscriber updated.");

export const createMenu = (body: Json) =>
  createRecord("menus", body, "Menu created.");
export const updateMenu = (id: number | string, body: Json) =>
  updateRecord(`menus/${id}`, body, "Menu updated.");

export const createMenuRight = (body: Json) =>
  createRecord("menu-rights", body, "Menu right created.");
export const updateMenuRight = (id: number | string, body: Json) =>
  updateRecord(`menu-rights/${id}`, body, "Menu right updated.");

export async function listMenuRights(
  params: ListParams
): Promise<ListResult<MenuRightRow>> {
  const { data } = await api.post("menu-rights/list", buildBody(params));
  return parseList<MenuRightRow>(data, params.limit);
}

// ─── Products ────────────────────────────────────────────────────────────────

export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;
export const WEIGHT_UNITS = ["kg", "g", "lb", "oz"] as const;

export interface ProductImageRow {
  id?: number | string;
  url: string;
  alt?: string | null;
  sort_order?: number;
  is_featured?: boolean;
}

export interface ProductVariantRow {
  id?: number | string;
  title: string;
  sku?: string | null;
  barcode?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  quantity?: number;
  is_active?: boolean;
}

export interface ProductFaqRow {
  id?: number | string;
  question: string;
  answer: string;
  sort_order?: number;
}

export interface ProductRow {
  id: number | string;
  title: string;
  slug?: string;
  status?: "active" | "draft" | "archived";
  vendor?: string | null;
  category?: string | null;
  price?: number | null;
  quantity?: number;
  variants_count?: number;
  featured_image?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface ProductDetailRow extends ProductRow {
  description?: string | null;
  compare_at_price?: number | null;
  cost_per_item?: number | null;
  sku?: string | null;
  barcode?: string | null;
  track_quantity?: boolean;
  weight?: number | null;
  weight_unit?: string;
  requires_shipping?: boolean;
  tags?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  category_id?: number | null;
  images?: ProductImageRow[];
  variants?: ProductVariantRow[];
  faqs?: ProductFaqRow[];
}

export async function listProducts(
  params: ListParams
): Promise<ListResult<ProductRow>> {
  const { data } = await api.post("products/list", buildBody(params));
  const payload = data?.payload ?? data?.data ?? data ?? {};
  const rawRows: Json[] = Array.isArray(payload)
    ? payload
    : payload.rows ?? payload.items ?? payload.products ?? payload.list ?? payload.data ?? [];
  // Normalize API field name differences (name→title, base_price→price, etc.)
  const rows = rawRows.map((r): ProductRow => ({
    ...r as ProductRow,
    title: (r.title ?? r.name ?? "") as string,
    price: r.price != null ? (r.price as number) : r.base_price != null ? parseFloat(r.base_price as string) : null,
    featured_image: (r.featured_image ?? r.image ?? r.thumbnail ?? null) as string | null,
  }));
  const pagination = data?.pagination ?? {};
  const total: number =
    pagination.total ?? payload.total ?? payload.count ?? payload.totalRecords ?? rows.length;
  const totalPages: number =
    pagination.totalPages ?? payload.totalPages ?? Math.max(1, Math.ceil(total / params.limit));
  return { rows, total, totalPages };
}

export async function getProduct(id: number | string): Promise<ProductDetailRow> {
  const { data } = await api.get(`products/get/${id}`);
  return data?.payload ?? data?.data ?? data;
}

export async function createProduct(
  body: Json
): Promise<{ id: number | string; message: string }> {
  const { data } = await api.post("products", body);
  const p: Json = data?.payload ?? data?.data ?? {};
  const id = p.id ?? p._id ?? data?.id;
  return { id, message: (data?.message as string) ?? "Product created." };
}

export const updateProduct = (id: number | string, body: Json) =>
  updateRecord(`products/${id}`, body, "Product updated.");

// ─── Vendors ─────────────────────────────────────────────────────────────────

export interface VendorRow {
  id: number | string;
  name: string;
  slug?: string;
  is_active?: boolean;
  created_at?: string;
}

export async function fetchAllVendors(): Promise<VendorRow[]> {
  const { data } = await api.post("vendors/list", { page: 1, limit: 200 });
  const result = parseList<VendorRow>(data, 200);
  return result.rows;
}

// ─── Product Categories ───────────────────────────────────────────────────────

export interface ProductCategoryRow {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  parent?: { name?: string } | null;
  is_active?: boolean;
  created_at?: string;
}

export async function listProductCategories(
  params: ListParams
): Promise<ListResult<ProductCategoryRow>> {
  const { data } = await api.post("product-categories/list", buildBody(params));
  return parseList<ProductCategoryRow>(data, params.limit);
}

export async function fetchAllProductCategories(): Promise<ProductCategoryRow[]> {
  const { data } = await api.post("product-categories/list", { page: 1, limit: 200 });
  const result = parseList<ProductCategoryRow>(data, 200);
  return result.rows;
}

export const createProductCategory = (body: Json) =>
  createRecord("product-categories", body, "Category created.");

export const updateProductCategory = (id: number | string, body: Json) =>
  updateRecord(`product-categories/${id}`, body, "Category updated.");

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;

export interface ReviewRow {
  id: number | string;
  product_id?: number | null;
  product?: { name?: string; id?: number } | null;
  user_id?: number | null;
  user?: { full_name?: string; email?: string } | null;
  reviewer_name?: string | null;
  reviewer_email?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  status?: "pending" | "approved" | "rejected";
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export async function listReviews(
  params: ListParams
): Promise<ListResult<ReviewRow>> {
  const { data } = await api.post("reviews/list", buildBody(params));
  return parseList<ReviewRow>(data, params.limit);
}

export const createReview = (body: Json) =>
  createRecord("reviews", body, "Review created.");
export const updateReview = (id: number | string, body: Json) =>
  updateRecord(`reviews/${id}`, body, "Review updated.");

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const DASHBOARD_PERIODS = [
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_month",
  "this_year",
  "custom",
] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

interface DashboardBody {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  branch_id?: number;
  limit?: number;
  threshold?: number;
}

export interface OverviewMetric {
  value: number;
  change_pct?: number | null;
  change_direction?: "up" | "down" | "neutral" | null;
}

export interface DashboardOverview {
  revenue?: OverviewMetric;
  orders?: OverviewMetric;
  new_customers?: OverviewMetric;
  aov?: OverviewMetric; // average order value
  pending_orders?: number;
  low_stock_count?: number;
  active_customers?: number;
  active_products?: number;
  [key: string]: unknown;
}

export interface TrendPoint {
  date?: string;
  label?: string;
  revenue?: number;
  orders?: number;
  customers?: number;
  count?: number;
  [key: string]: unknown;
}

export interface BreakdownItem {
  label?: string;
  name?: string;
  status?: string;
  channel?: string;
  method?: string;
  count?: number;
  orders?: number;
  revenue?: number;
  percentage?: number;
  [key: string]: unknown;
}

export interface TopProduct {
  id?: number | string;
  name?: string;
  title?: string;
  units_sold?: number;
  quantity_sold?: number;
  revenue?: number;
  image?: string | null;
  [key: string]: unknown;
}

export interface RecentOrder {
  id: number | string;
  order_number?: string;
  customer?: string | { full_name?: string; name?: string } | null;
  total?: number;
  status?: string;
  payment_status?: string;
  created_at?: string;
  items_count?: number;
  [key: string]: unknown;
}

export interface LowStockItem {
  id: number | string;
  name?: string;
  title?: string;
  sku?: string | null;
  quantity?: number;
  threshold?: number;
  image?: string | null;
  [key: string]: unknown;
}

export interface PendingActions {
  pending_reviews?: number;
  pending_refunds?: number;
  design_review_orders?: number;
  booked_orders?: number;
  unresolved_messages?: number;
  locked_users?: number;
  [key: string]: unknown;
}

function dashParse<T>(data: Json): T {
  return (data?.payload ?? data?.data ?? data) as T;
}

export async function getDashboardOverview(body: DashboardBody = {}): Promise<DashboardOverview> {
  const { data } = await api.post("dashboard/overview", body);
  return dashParse<DashboardOverview>(data);
}

export async function getRevenueTrend(body: DashboardBody = {}): Promise<TrendPoint[]> {
  const { data } = await api.post("dashboard/revenue-trend", body);
  const p = dashParse<Json>(data);
  return (Array.isArray(p) ? p : p?.trend ?? p?.data ?? p?.rows ?? []) as TrendPoint[];
}

export async function getCustomerGrowthTrend(body: DashboardBody = {}): Promise<TrendPoint[]> {
  const { data } = await api.post("dashboard/customer-growth-trend", body);
  const p = dashParse<Json>(data);
  return (Array.isArray(p) ? p : p?.trend ?? p?.data ?? p?.rows ?? []) as TrendPoint[];
}

export async function getOrderStatusBreakdown(body: DashboardBody = {}): Promise<BreakdownItem[]> {
  const { data } = await api.post("dashboard/order-status-breakdown", body);
  const p = dashParse<Json>(data);
  return (Array.isArray(p) ? p : p?.breakdown ?? p?.data ?? p?.rows ?? []) as BreakdownItem[];
}

export async function getOrderChannelBreakdown(body: DashboardBody = {}): Promise<BreakdownItem[]> {
  const { data } = await api.post("dashboard/order-channel-breakdown", body);
  const p = dashParse<Json>(data);
  return (Array.isArray(p) ? p : p?.breakdown ?? p?.data ?? p?.rows ?? []) as BreakdownItem[];
}

export async function getPaymentMethodBreakdown(body: DashboardBody = {}): Promise<BreakdownItem[]> {
  const { data } = await api.post("dashboard/payment-method-breakdown", body);
  const p = dashParse<Json>(data);
  return (Array.isArray(p) ? p : p?.breakdown ?? p?.data ?? p?.rows ?? []) as BreakdownItem[];
}

export async function getTopProducts(body: DashboardBody = {}): Promise<TopProduct[]> {
  const { data } = await api.post("dashboard/top-products", body);
  const p = dashParse<Json>(data);
  return (Array.isArray(p) ? p : p?.products ?? p?.data ?? p?.rows ?? []) as TopProduct[];
}

export async function getRecentOrders(limit = 10): Promise<RecentOrder[]> {
  const { data } = await api.post("dashboard/recent-orders", { limit });
  const p = dashParse<Json>(data);
  return (Array.isArray(p) ? p : p?.orders ?? p?.data ?? p?.rows ?? []) as RecentOrder[];
}

export async function getLowStockAlerts(limit = 10, threshold = 10): Promise<LowStockItem[]> {
  const { data } = await api.post("dashboard/low-stock-alerts", { limit, threshold });
  const p = dashParse<Json>(data);
  return (Array.isArray(p) ? p : p?.products ?? p?.items ?? p?.data ?? p?.rows ?? []) as LowStockItem[];
}

export async function getPendingActions(): Promise<PendingActions> {
  const { data } = await api.get("dashboard/pending-actions");
  return dashParse<PendingActions>(data);
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export const SALES_GROUP_BY = ["day", "week", "month", "product", "category"] as const;
export type SalesGroupBy = (typeof SALES_GROUP_BY)[number];

export const ORDER_STATUSES_REPORT = [
  "booked","accepted","design_review","preparing",
  "label_create","shipped","ready_for_pickup","completed","cancelled",
] as const;

export const PAYMENT_STATUSES_REPORT = ["pending","paid","partially_paid","refunded","failed"] as const;

// Sales
export interface SalesDataRow {
  date?: string; label?: string; period?: string;
  orders?: number; subtotal?: number; discount?: number;
  tax?: number; shipping?: number; revenue?: number;
  units_sold?: number; [k: string]: unknown;
}
export interface SalesSummary {
  orders?: number; subtotal?: number; discount?: number;
  tax?: number; shipping?: number; revenue?: number; [k: string]: unknown;
}
export interface SalesReport { data: SalesDataRow[]; summary?: SalesSummary }

export async function getSalesReport(body: {
  startDate: string; endDate: string; groupBy?: SalesGroupBy; branch_id?: number;
}): Promise<SalesReport> {
  const { data } = await api.post("reports/sales", body);
  const p: Json = data?.payload ?? data?.data ?? data ?? {};
  const rows: SalesDataRow[] = Array.isArray(p) ? p : p.data ?? p.rows ?? p.items ?? [];
  const summary: SalesSummary = Array.isArray(p) ? {} : p.summary ?? p.totals ?? {};
  return { data: rows, summary };
}

// Orders
export interface OrderReportRow {
  id: number | string; order_number?: string;
  customer?: string | { full_name?: string; name?: string } | null;
  status?: string; payment_status?: string;
  subtotal?: number; discount?: number; tax?: number;
  shipping?: number; total?: number; items_count?: number;
  created_at?: string; [k: string]: unknown;
}
export interface OrderReportSummary {
  total_orders?: number; total_revenue?: number;
  total_discount?: number; total_tax?: number; total_shipping?: number; [k: string]: unknown;
}
export interface OrderReport {
  rows: OrderReportRow[]; summary?: OrderReportSummary;
  total: number; totalPages: number;
}
export async function getOrderReport(body: {
  startDate: string; endDate: string; page?: number; limit?: number;
  status?: string; payment_status?: string;
}): Promise<OrderReport> {
  const { data } = await api.post("reports/orders", body);
  const p: Json = data?.payload ?? data?.data ?? data ?? {};
  const rows: OrderReportRow[] = Array.isArray(p) ? p : p.rows ?? p.orders ?? p.data ?? [];
  const summary = (Array.isArray(p) ? {} : p.summary ?? p.totals ?? {}) as OrderReportSummary;
  const pag: Json = data?.pagination ?? p.pagination ?? {};
  const total = pag.total ?? p.total ?? rows.length;
  const limit = body.limit ?? 20;
  const totalPages = pag.totalPages ?? Math.max(1, Math.ceil(total / limit));
  return { rows, summary, total, totalPages };
}

// Inventory
export interface InventoryReportRow {
  id: number | string; name?: string; title?: string; sku?: string | null;
  category?: string | null; quantity?: number; cost_price?: number | null;
  stock_value?: number | null; status?: "in_stock" | "low_stock" | "out_of_stock";
  [k: string]: unknown;
}
export interface InventoryReportSummary {
  total_skus?: number; total_units?: number; total_stock_value?: number;
  out_of_stock_count?: number; low_stock_count?: number; [k: string]: unknown;
}
export interface InventoryReport { rows: InventoryReportRow[]; summary?: InventoryReportSummary }
export async function getInventoryReport(body?: {
  category_id?: number; low_stock_only?: boolean; threshold?: number;
}): Promise<InventoryReport> {
  const { data } = await api.post("reports/inventory", body ?? {});
  const p: Json = data?.payload ?? data?.data ?? data ?? {};
  const rows: InventoryReportRow[] = Array.isArray(p) ? p : p.items ?? p.rows ?? p.data ?? [];
  const summary = (Array.isArray(p) ? {} : p.summary ?? p.totals ?? {}) as InventoryReportSummary;
  return { rows, summary };
}

// Customers
export interface CustomerReportRow {
  id: number | string; full_name?: string; name?: string; email?: string;
  total_orders?: number; total_spent?: number; avg_order_value?: number;
  last_order_at?: string; [k: string]: unknown;
}
export async function getCustomerReport(body?: {
  startDate?: string; endDate?: string; limit?: number;
}): Promise<CustomerReportRow[]> {
  const { data } = await api.post("reports/customers", body ?? {});
  const p: Json = data?.payload ?? data?.data ?? data ?? {};
  return (Array.isArray(p) ? p : p.customers ?? p.rows ?? p.data ?? []) as CustomerReportRow[];
}

// Product Performance
export interface ProductPerfRow {
  id: number | string; name?: string; title?: string; category?: string | null;
  units_sold?: number; revenue?: number; cost?: number;
  profit?: number; margin?: number; [k: string]: unknown;
}
export async function getProductPerformanceReport(body: {
  startDate: string; endDate: string; category_id?: number;
  sortBy?: "revenue" | "units_sold"; limit?: number;
}): Promise<ProductPerfRow[]> {
  const { data } = await api.post("reports/product-performance", body);
  const p: Json = data?.payload ?? data?.data ?? data ?? {};
  return (Array.isArray(p) ? p : p.products ?? p.rows ?? p.data ?? []) as ProductPerfRow[];
}

// Financial
export interface FinancialBreakdownRow {
  method?: string; payment_method?: string;
  revenue?: number; discounts?: number; tax?: number;
  shipping?: number; fees?: number; refunds?: number; net_revenue?: number;
  [k: string]: unknown;
}
export interface FinancialReport {
  breakdown: FinancialBreakdownRow[];
  totals?: FinancialBreakdownRow;
}
export async function getFinancialReport(body: {
  startDate: string; endDate: string;
}): Promise<FinancialReport> {
  const { data } = await api.post("reports/financial", body);
  const p: Json = data?.payload ?? data?.data ?? data ?? {};
  const breakdown = (Array.isArray(p) ? p : p.breakdown ?? p.rows ?? p.data ?? []) as FinancialBreakdownRow[];
  const totals = (Array.isArray(p) ? undefined : p.totals ?? p.summary) as FinancialBreakdownRow | undefined;
  return { breakdown, totals };
}

// Coupon Usage
export interface CouponUsageRow {
  coupon_id?: number | string; id?: number | string;
  code?: string; name?: string;
  times_used?: number; total_discount?: number; [k: string]: unknown;
}
export async function getCouponUsageReport(body?: {
  startDate?: string; endDate?: string; coupon_id?: number;
}): Promise<CouponUsageRow[]> {
  const { data } = await api.post("reports/coupon-usage", body ?? {});
  const p: Json = data?.payload ?? data?.data ?? data ?? {};
  return (Array.isArray(p) ? p : p.coupons ?? p.rows ?? p.data ?? []) as CouponUsageRow[];
}
