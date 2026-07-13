"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Loader2, Plus, Search, Star } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DateRange } from "react-day-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data-table";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatusBadge } from "@/components/status-badge";
import { apiErrorMessage } from "@/lib/auth-api";
import {
  REVIEW_STATUSES,
  createReview,
  listReviews,
  updateReview,
  type ReviewRow,
} from "@/lib/admin-api";

const PAGE_SIZE = 10;

const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: "All statuses",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_FORM_ITEMS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const statusTone = (s?: string) =>
  s === "approved" ? "success" : s === "rejected" ? "critical" : "warning";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}/5</span>
    </span>
  );
}

const columns: ColumnDef<ReviewRow>[] = [
  {
    id: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const r = row.original;
      const name =
        r.reviewer_name ?? r.user?.full_name ?? "Anonymous";
      const email = r.reviewer_email ?? r.user?.email;
      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{name}</p>
          {email && (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          )}
        </div>
      );
    },
  },
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <span className="truncate text-sm">
          {r.product?.name ?? (r.product_id ? `#${r.product_id}` : "—")}
        </span>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => <StarRating rating={row.original.rating} />,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="block max-w-48 truncate">{row.original.title || "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status ?? "pending";
      return (
        <StatusBadge
          status={s.charAt(0).toUpperCase() + s.slice(1)}
          tone={statusTone(s)}
        />
      );
    },
  },
  {
    accessorKey: "is_verified",
    header: "Verified",
    cell: ({ row }) =>
      row.original.is_verified ? (
        <StatusBadge status="Verified" tone="success" />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const d = row.original.created_at;
      if (!d) return "—";
      const date = new Date(d);
      return isNaN(date.getTime()) ? "—" : format(date, "MMM d, yyyy");
    },
  },
];

export default function ReviewsPage() {
  const [rows, setRows] = React.useState<ReviewRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ReviewRow | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const [debounced, setDebounced] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    setPage(0);
  }, [debounced, status, dateRange]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listReviews({
      page: page + 1,
      limit: PAGE_SIZE,
      dateRange,
      filters: {
        search: debounced || undefined,
        status: status === "all" ? undefined : status,
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
        toast.error(apiErrorMessage(error, "Couldn't load reviews."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, debounced, status, dateRange, refreshKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Reviews</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add review
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1 sm:max-w-56">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviewer or product"
            className="bg-card pl-8"
          />
        </div>
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status}
          onValueChange={(v) => setStatus(v as string)}
        >
          <SelectTrigger className="min-w-36 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_FILTER_ITEMS).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <ReviewDialog
        editing={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        onRowClick={(row) => {
          setEditing(row);
          setDialogOpen(true);
        }}
        serverPagination={{ pageIndex: page, pageCount, total, onPageChange: setPage }}
      />
    </div>
  );
}

const reviewSchema = z.object({
  product_id: z.number({ error: "Product ID must be a number" }).int().positive("Required").optional(),
  reviewer_name: z.string().min(1, "Name is required"),
  reviewer_email: z.string().email("Invalid email").optional().or(z.literal("")),
  rating: z.number({ error: "Rating required" }).int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(REVIEW_STATUSES),
  is_verified: z.boolean(),
});
type ReviewValues = z.infer<typeof reviewSchema>;

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = React.useState(0);
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="cursor-pointer"
        >
          <Star
            className={`size-6 transition-colors ${
              i <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </span>
  );
}

function ReviewDialog({
  editing,
  open,
  onOpenChange,
  onSaved,
}: {
  editing: ReviewRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      product_id: undefined,
      reviewer_name: "",
      reviewer_email: "",
      rating: 5,
      title: "",
      body: "",
      status: "pending",
      is_verified: false,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        product_id: editing?.product_id ?? undefined,
        reviewer_name:
          editing?.reviewer_name ?? editing?.user?.full_name ?? "",
        reviewer_email:
          editing?.reviewer_email ?? editing?.user?.email ?? "",
        rating: editing?.rating ?? 5,
        title: editing?.title ?? "",
        body: editing?.body ?? "",
        status: editing?.status ?? "pending",
        is_verified: editing?.is_verified ?? false,
      });
    }
  }, [open, editing, reset]);

  const onSubmit = async (values: ReviewValues) => {
    try {
      const body = {
        ...values,
        reviewer_email: values.reviewer_email || undefined,
        title: values.title || undefined,
        body: values.body || undefined,
        product_id: values.product_id || undefined,
        is_active: true,
      };
      const message = editing
        ? await updateReview(editing.id, body)
        : await createReview(body);
      toast.success(message);
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(
        apiErrorMessage(error, `Couldn't ${editing ? "update" : "create"} the review.`)
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit review" : "Add review"}</DialogTitle>
          <DialogDescription>
            {editing
              ? `Update review by ${editing.reviewer_name ?? "reviewer"}.`
              : "Manually add a product review."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rv-name">Reviewer name</Label>
              <Input
                id="rv-name"
                placeholder="Jane Doe"
                aria-invalid={!!errors.reviewer_name}
                {...register("reviewer_name")}
              />
              {errors.reviewer_name && (
                <p className="text-sm text-destructive">{errors.reviewer_name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rv-email">Email</Label>
              <Input
                id="rv-email"
                type="email"
                placeholder="jane@example.com"
                aria-invalid={!!errors.reviewer_email}
                {...register("reviewer_email")}
              />
              {errors.reviewer_email && (
                <p className="text-sm text-destructive">{errors.reviewer_email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rv-product">Product ID</Label>
            <Input
              id="rv-product"
              type="number"
              placeholder="42"
              disabled={!!editing}
              {...register("product_id", { valueAsNumber: true })}
            />
            {errors.product_id && (
              <p className="text-sm text-destructive">{errors.product_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Rating</Label>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <StarPicker value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rv-title">Title</Label>
            <Input id="rv-title" placeholder="Great quality!" {...register("title")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rv-body">Review</Label>
            <Textarea
              id="rv-body"
              rows={3}
              placeholder="Write the review content…"
              {...register("body")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    items={STATUS_FORM_ITEMS}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REVIEW_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_FORM_ITEMS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Verified purchase</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm">
                <input type="checkbox" className="accent-primary" {...register("is_verified")} />
                Mark as verified
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Save review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
