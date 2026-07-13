"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Search } from "lucide-react";
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
import { StatusBadge } from "@/components/status-badge";
import { apiErrorMessage } from "@/lib/auth-api";
import { listMenus, MENU_LINK_TYPES, type MenuRow } from "@/lib/admin-api";

const PAGE_SIZE = 10;

const STATUS_ITEMS = { all: "All statuses", active: "Active", inactive: "Inactive" };
const MENU_TYPE_ITEMS = { dashboard: "Dashboard", frontend: "Frontend" };
const LINK_TYPE_ITEMS = Object.fromEntries([["all", "All link types"], ...MENU_LINK_TYPES.map((t) => [t, t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())])]);


const humanize = (v?: string) =>
  v ? v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const columns: ColumnDef<MenuRow>[] = [
  {
    accessorKey: "name",
    header: "Menu",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          /{row.original.slug}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "menu_type",
    header: "Type",
    cell: ({ row }) => (
      <StatusBadge
        status={humanize(row.original.menu_type)}
        tone={row.original.menu_type === "dashboard" ? "info" : "neutral"}
      />
    ),
  },
  {
    accessorKey: "link_type",
    header: "Link type",
    cell: ({ row }) => humanize(row.original.link_type),
  },
  {
    accessorKey: "sort_order",
    header: () => <div className="text-right">Order</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.sort_order ?? "—"}</div>
    ),
  },
  {
    id: "visibility",
    header: "Visibility",
    cell: ({ row }) =>
      row.original.visibility === false ? (
        <StatusBadge status="Hidden" tone="neutral" />
      ) : (
        <StatusBadge status="Visible" tone="success" />
      ),
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

export function MenusSection() {
  const [rows, setRows] = React.useState<MenuRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [menuType, setMenuType] = React.useState("dashboard");
  const [linkType, setLinkType] = React.useState("all");
  const [status, setStatus] = React.useState("all");

  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, menuType, linkType, status]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listMenus({
      page: page + 1,
      limit: PAGE_SIZE,
      filters: {
        menu_type: menuType,
        name: debouncedSearch || undefined,
        link_type: linkType === "all" ? undefined : linkType,
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
        toast.error(apiErrorMessage(error, "Couldn't load menus."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, menuType, linkType, status]);

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
        <Select items={MENU_TYPE_ITEMS} value={menuType} onValueChange={(v) => setMenuType(v as string)}>
          <SelectTrigger className="min-w-32 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dashboard">Dashboard</SelectItem>
            <SelectItem value="frontend">Frontend</SelectItem>
          </SelectContent>
        </Select>
        <Select items={LINK_TYPE_ITEMS} value={linkType} onValueChange={(v) => setLinkType(v as string)}>
          <SelectTrigger className="min-w-36 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All link types</SelectItem>
            {MENU_LINK_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {humanize(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select items={STATUS_ITEMS} value={status} onValueChange={(v) => setStatus(v as string)}>
          <SelectTrigger className="min-w-32 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
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
