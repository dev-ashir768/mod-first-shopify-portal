"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpDown, Loader2, Package, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { currency, type Product } from "@/lib/mock-data";
import {
  productSchema,
  type ProductInput,
  type ProductValues,
} from "@/lib/validations";
import { useProductStore } from "@/stores/product-store";
import { cn } from "@/lib/utils";

const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <button
        className="flex cursor-pointer items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Product
        <ArrowUpDown className="size-3" />
      </button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
          <Package className="size-4 text-muted-foreground" />
        </span>
        <span className="font-medium">{row.getValue("title")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "inventory",
    header: "Inventory",
    cell: ({ row }) => {
      const inventory = row.original.inventory;
      return (
        <span className={cn(inventory === 0 && "text-destructive")}>
          {inventory === 0
            ? "0 in stock"
            : `${inventory} in stock for ${row.original.variants} variant${
                row.original.variants > 1 ? "s" : ""
              }`}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{currency(row.getValue("price"))}</div>
    ),
  },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "vendor", header: "Vendor" },
];

function AddProductDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addProduct = useProductStore((s) => s.addProduct);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput, unknown, ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      price: undefined,
      inventory: undefined,
      status: "Active",
      category: "",
      vendor: "",
    },
  });

  const onSubmit = async (values: ProductValues) => {
    // Swap for: await api.post("/products", values)
    await new Promise((r) => setTimeout(r, 500));
    addProduct(values);
    toast.success(`Product "${values.title}" created`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
          <DialogDescription>
            Create a new product for your store.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Short sleeve t-shirt"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                aria-invalid={!!errors.price}
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inventory">Quantity</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                placeholder="0"
                aria-invalid={!!errors.inventory}
                {...register("inventory")}
              />
              {errors.inventory && (
                <p className="text-sm text-destructive">
                  {errors.inventory.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Apparel"
                aria-invalid={!!errors.category}
                {...register("category")}
              />
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                placeholder="modeFirst"
                aria-invalid={!!errors.vendor}
                {...register("vendor")}
              />
              {errors.vendor && (
                <p className="text-sm text-destructive">{errors.vendor.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Save product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductsPage() {
  const products = useProductStore((s) => s.products);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            Export
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Add product
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKey="title"
        searchPlaceholder="Search products"
      />

      <AddProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
