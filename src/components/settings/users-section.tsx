"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatusBadge } from "@/components/status-badge";
import { apiErrorMessage } from "@/lib/auth-api";
import { listUsers, USER_ROLES, type UserRow } from "@/lib/admin-api";

const PAGE_SIZE = 10;

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const humanizeRole = (role?: string) =>
  role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "full_name",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarFallback className="bg-[#e0f0ff] text-xs font-semibold text-[#00527c]">
            {initialsOf(row.original.full_name ?? "?")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <StatusBadge status={humanizeRole(row.original.role)} tone="info" />
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone ?? "—",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const u = row.original;
      if (u.is_locked) return <StatusBadge status="Locked" tone="critical" />;
      return u.is_active === false ? (
        <StatusBadge status="Inactive" tone="neutral" />
      ) : (
        <StatusBadge status="Active" tone="success" />
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const d = row.original.created_at;
      if (!d) return "—";
      const date = new Date(d);
      return isNaN(date.getTime()) ? "—" : format(date, "MMM d, yyyy");
    },
  },
];

export function UsersSection() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Debounce the text search
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, role, status, dateRange]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listUsers({
      page: page + 1,
      limit: PAGE_SIZE,
      dateRange,
      filters: {
        full_name: debouncedSearch || undefined,
        role: role === "all" ? undefined : role,
        is_active: status === "all" ? undefined : status === "active",
      },
    })
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setTotal(res.total);
        setPageCount(res.totalPages);
      })
      .catch((error) => {
        if (cancelled) return;
        setRows([]);
        toast.error(apiErrorMessage(error, "Couldn't load users."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, role, status, dateRange]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1 sm:max-w-56">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="bg-card pl-8"
          />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as string)}>
          <SelectTrigger className="min-w-36 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {USER_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {humanizeRole(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as string)}>
          <SelectTrigger className="min-w-32 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        serverPagination={{
          pageIndex: page,
          pageCount,
          total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
