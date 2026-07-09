"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { currency, orders, type Order } from "@/lib/mock-data";

const columns: ColumnDef<Order>[] = [
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
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("orderNumber")}</span>
    ),
  },
  { accessorKey: "date", header: "Date" },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <button
        className="flex cursor-pointer items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer
        <ArrowUpDown className="size-3" />
      </button>
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {currency(row.getValue("total"))}
      </div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment status",
    cell: ({ row }) => <StatusBadge status={row.getValue("paymentStatus")} />,
  },
  {
    accessorKey: "fulfillmentStatus",
    header: "Fulfillment status",
    cell: ({ row }) => <StatusBadge status={row.getValue("fulfillmentStatus")} />,
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => `${row.getValue("items")} items`,
  },
  { accessorKey: "deliveryMethod", header: "Delivery method" },
];

const tabs = [
  { value: "all", label: "All" },
  { value: "unfulfilled", label: "Unfulfilled" },
  { value: "unpaid", label: "Unpaid" },
  { value: "refunded", label: "Refunded" },
] as const;

export default function OrdersPage() {
  const [tab, setTab] = React.useState<string>("all");

  const filtered = React.useMemo(() => {
    switch (tab) {
      case "unfulfilled":
        return orders.filter((o) => o.fulfillmentStatus !== "Fulfilled");
      case "unpaid":
        return orders.filter((o) => o.paymentStatus === "Pending");
      case "refunded":
        return orders.filter((o) => o.paymentStatus === "Refunded");
      default:
        return orders;
    }
  }, [tab]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="size-4" />
            Export
          </Button>
          <Button>Create order</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList className="bg-transparent p-0">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="cursor-pointer rounded-lg px-3 data-active:bg-[#e3e3e3] data-active:shadow-none"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="customer"
        searchPlaceholder="Search by customer"
      />
    </div>
  );
}
