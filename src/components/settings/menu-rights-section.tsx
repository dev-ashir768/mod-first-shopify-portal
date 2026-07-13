"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, Minus } from "lucide-react";
import { toast } from "sonner";

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
import { listMenuRights, USER_ROLES, type MenuRightRow } from "@/lib/admin-api";

const PAGE_SIZE = 10;

const ROLE_ITEMS = Object.fromEntries([["all", "All roles"], ...USER_ROLES.map((r) => [r, r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())])]);


const humanizeRole = (role?: string) =>
  role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

function PermissionCell({ allowed }: { allowed?: boolean }) {
  return allowed ? (
    <Check className="size-4 text-[#29845a]" aria-label="Allowed" />
  ) : (
    <Minus className="size-4 text-muted-foreground/50" aria-label="Not allowed" />
  );
}

const columns: ColumnDef<MenuRightRow>[] = [
  {
    id: "menu",
    header: "Menu",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {r.menu?.name ?? `Menu #${r.menu_id}`}
          </p>
          {r.menu?.slug && (
            <p className="truncate font-mono text-xs text-muted-foreground">
              /{r.menu.slug}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <StatusBadge status={humanizeRole(row.original.role)} tone="info" />
    ),
  },
  {
    accessorKey: "can_view",
    header: "View",
    cell: ({ row }) => <PermissionCell allowed={row.original.can_view} />,
  },
  {
    accessorKey: "can_create",
    header: "Create",
    cell: ({ row }) => <PermissionCell allowed={row.original.can_create} />,
  },
  {
    accessorKey: "can_edit",
    header: "Edit",
    cell: ({ row }) => <PermissionCell allowed={row.original.can_edit} />,
  },
  {
    accessorKey: "can_delete",
    header: "Delete",
    cell: ({ row }) => <PermissionCell allowed={row.original.can_delete} />,
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

type Tri = "all" | "yes" | "no";
const triToBool = (v: Tri) => (v === "all" ? undefined : v === "yes");

export function MenuRightsSection() {
  const [rows, setRows] = React.useState<MenuRightRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const [role, setRole] = React.useState("all");
  const [canView, setCanView] = React.useState<Tri>("all");
  const [canEdit, setCanEdit] = React.useState<Tri>("all");
  const [canDelete, setCanDelete] = React.useState<Tri>("all");

  React.useEffect(() => {
    setPage(0);
  }, [role, canView, canEdit, canDelete]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listMenuRights({
      page: page + 1,
      limit: PAGE_SIZE,
      filters: {
        role: role === "all" ? undefined : role,
        can_view: triToBool(canView),
        can_edit: triToBool(canEdit),
        can_delete: triToBool(canDelete),
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
        toast.error(apiErrorMessage(error, "Couldn't load menu rights."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, role, canView, canEdit, canDelete]);

  const triSelect = (
    label: string,
    value: Tri,
    onChange: (v: Tri) => void
  ) => (
    <Select items={{ all: `${label}: All`, yes: `${label}: Yes`, no: `${label}: No` }} value={value} onValueChange={(v) => onChange(v as Tri)}>
      <SelectTrigger className="min-w-32 bg-card">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: All</SelectItem>
        <SelectItem value="yes">{label}: Yes</SelectItem>
        <SelectItem value="no">{label}: No</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select items={ROLE_ITEMS} value={role} onValueChange={(v) => setRole(v as string)}>
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
        {triSelect("View", canView, setCanView)}
        {triSelect("Edit", canEdit, setCanEdit)}
        {triSelect("Delete", canDelete, setCanDelete)}
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
