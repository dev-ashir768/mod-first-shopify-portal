"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { currency, orders } from "@/lib/mock-data";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const kpis = [
  { label: "Total sales", value: "$12,480.50", delta: 14, positive: true },
  { label: "Sessions", value: "4,912", delta: 8, positive: true },
  { label: "Orders", value: "186", delta: 5, positive: true },
  { label: "Conversion rate", value: "2.4%", delta: -3, positive: false },
];

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const recent = orders.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold capitalize">
          Good evening, {user?.name ?? "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <Card className="py-0">
        <CardContent className="grid grid-cols-2 p-0 lg:grid-cols-4 lg:divide-x">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="p-4">
              <p className="text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4">
                {kpi.label}
              </p>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-lg font-semibold">{kpi.value}</span>
                <span
                  className={cn(
                    "flex items-center text-xs font-medium",
                    kpi.positive ? "text-[#29845a]" : "text-[#e51c00]"
                  )}
                >
                  {kpi.positive ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  {Math.abs(kpi.delta)}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link
            href="/orders"
            className="flex items-center text-sm font-medium text-[#005bd3] hover:underline"
          >
            View all
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <Separator />
        <CardContent className="p-0">
          <ul className="divide-y">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href="/orders"
                  className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors duration-150 hover:bg-muted/60"
                >
                  <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
                    <p className="truncate text-sm font-medium">
                      {order.orderNumber} · {order.customer}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.date} · {order.items} item{order.items > 1 ? "s" : ""}
                    </p>
                  </div>
                  <StatusBadge status={order.paymentStatus} />
                  <StatusBadge status={order.fulfillmentStatus} />
                  <span className="ml-auto text-right text-sm font-medium sm:ml-0 sm:w-20">
                    {currency(order.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
