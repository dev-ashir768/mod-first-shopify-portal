"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

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
import { listBranches, type BranchRow } from "@/lib/admin-api";

const PAGE_SIZE = 10;

const columns: ColumnDef<BranchRow>[] = [
  {
    accessorKey: "name",
    header: "Branch",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const b = row.original;
      const parts = [b.city, b.state, b.country].filter(Boolean);
      return parts.length ? parts.join(", ") : "—";
    },
  },
  {
    accessorKey: "manager_name",
    header: "Manager",
    cell: ({ row }) => {
      const b = row.original;
      if (!b.manager_name && !b.manager_email) return "—";
      return (
        <div className="min-w-0">
          <p className="truncate">{b.manager_name ?? "—"}</p>
          {b.manager_email && (
            <p className="truncate text-xs text-muted-foreground">
              {b.manager_email}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => {
      const b = row.original;
      if (!b.phone && !b.email) return "—";
      return (
        <div className="min-w-0">
          <p className="truncate">{b.phone ?? "—"}</p>
          {b.email && (
            <p className="truncate text-xs text-muted-foreground">{b.email}</p>
          )}
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_active === false ? (
        <StatusBadge status="Inactive" tone="neutral" />
      ) : (
        <StatusBadge status="Active" tone="success" />
      ),
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

export function BranchesSection() {
  const [rows, setRows] = React.useState<BranchRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [city, setCity] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const [debounced, setDebounced] = React.useState({ search: "", city: "" });
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced({ search, city }), 400);
    return () => clearTimeout(t);
  }, [search, city]);

  React.useEffect(() => {
    setPage(0);
  }, [debounced, status, dateRange]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listBranches({
      page: page + 1,
      limit: PAGE_SIZE,
      dateRange,
      filters: {
        name: debounced.search || undefined,
        city: debounced.city || undefined,
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
        toast.error(apiErrorMessage(error, "Couldn't load branches."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, debounced, status, dateRange]);

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
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-32 bg-card"
        />
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
