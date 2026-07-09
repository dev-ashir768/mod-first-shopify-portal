"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download, Plus, Upload } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { currency, customers, type Customer } from "@/lib/mock-data";

const columns: ColumnDef<Customer>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <button
        className="flex cursor-pointer items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer
        <ArrowUpDown className="size-3" />
      </button>
    ),
    cell: ({ row }) => {
      const name = row.getValue<string>("name");
      const initials = name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-[#e0f0ff] text-xs font-semibold text-[#00527c]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "emailSubscription",
    header: "Email subscription",
    cell: ({ row }) => <StatusBadge status={row.getValue("emailSubscription")} />,
  },
  { accessorKey: "location", header: "Location" },
  {
    accessorKey: "orders",
    header: () => <div className="text-right">Orders</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("orders")} orders</div>
    ),
  },
  {
    accessorKey: "amountSpent",
    header: () => <div className="text-right">Amount spent</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {currency(row.getValue("amountSpent"))}
      </div>
    ),
  },
];

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="size-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="size-4" />
            Export
          </Button>
          <Button>
            <Plus className="size-4" />
            Add customer
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customers"
      />
    </div>
  );
}
