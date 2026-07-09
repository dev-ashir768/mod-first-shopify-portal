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
  const total: number =
    p.total ?? p.count ?? p.totalRecords ?? p.pagination?.total ?? rows.length;
  const totalPages: number =
    p.totalPages ?? p.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));
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
