"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Loader2, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { apiErrorMessage } from "@/lib/auth-api";
import {
  createProductCategory,
  listProductCategories,
  updateProductCategory,
  type ProductCategoryRow,
} from "@/lib/admin-api";

const PAGE_SIZE = 20;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const columns: ColumnDef<ProductCategoryRow>[] = [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="min-w-0">
          <p className="font-medium">{r.name}</p>
          <p className="font-mono text-xs text-muted-foreground">/{r.slug}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) => row.original.parent?.name ?? "—",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="block max-w-56 truncate text-sm text-muted-foreground">
        {row.original.description ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_active !== false ? (
        <StatusBadge status="Active" tone="success" />
      ) : (
        <StatusBadge status="Inactive" tone="neutral" />
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

export default function ProductCategoriesPage() {
  const [rows, setRows] = React.useState<ProductCategoryRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductCategoryRow | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => { setPage(0); }, [debounced]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listProductCategories({
      page: page + 1,
      limit: PAGE_SIZE,
      filters: { name: debounced || undefined },
    })
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setTotal(res.total);
        setPageCount(res.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setRows([]);
        toast.error(apiErrorMessage(err, "Couldn't load categories."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [page, debounced, refreshKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Product Categories</h1>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="size-4" />
          Add category
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative min-w-44 flex-1 sm:max-w-64">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories"
            className="bg-card pl-8"
          />
        </div>
      </div>

      <CategoryDialog
        editing={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        onRowClick={(row) => { setEditing(row); setDialogOpen(true); }}
        serverPagination={{ pageIndex: page, pageCount, total, onPageChange: setPage }}
      />
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

const catSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, dashes only"),
  description: z.string().optional(),
  is_active: z.boolean(),
});
type CatValues = z.infer<typeof catSchema>;

function CategoryDialog({
  editing,
  open,
  onOpenChange,
  onSaved,
}: {
  editing: ProductCategoryRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<CatValues>({
    resolver: zodResolver(catSchema),
    defaultValues: { name: "", slug: "", description: "", is_active: true },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: editing?.name ?? "",
        slug: editing?.slug ?? "",
        description: editing?.description ?? "",
        is_active: editing?.is_active ?? true,
      });
    }
  }, [open, editing, reset]);

  // Auto-slug from name while creating
  const name = watch("name");
  React.useEffect(() => {
    if (!editing && !getFieldState("slug").isDirty) {
      setValue("slug", slugify(name));
    }
  }, [name, editing, getFieldState, setValue]);

  const onSubmit = async (values: CatValues) => {
    try {
      const msg = editing
        ? await updateProductCategory(editing.id, values)
        : await createProductCategory(values);
      toast.success(msg);
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, `Couldn't ${editing ? "update" : "create"} category.`));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            {editing ? `Update "${editing.name}".` : "Create a new product category."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" placeholder="T-Shirts" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input id="cat-slug" placeholder="t-shirts" className="font-mono" aria-invalid={!!errors.slug} {...register("slug")} />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea id="cat-desc" rows={2} placeholder="Optional description…" {...register("description")} />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="accent-primary" {...register("is_active")} />
            Active
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Save category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
