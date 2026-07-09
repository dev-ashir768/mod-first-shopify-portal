"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AppWindow,
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  Landmark,
  Languages,
  MapPin,
  Package,
  Percent,
  Search,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const settingsNav = [
  { label: "General", icon: Store, active: true },
  { label: "Plan", icon: Package },
  { label: "Payments", icon: CreditCard },
  { label: "Checkout", icon: ShoppingCart },
  { label: "Customer accounts", icon: UserRound },
  { label: "Shipping and delivery", icon: Truck },
  { label: "Taxes and duties", icon: Percent },
  { label: "Locations", icon: MapPin },
  { label: "Apps", icon: AppWindow },
  { label: "Sales channels", icon: Share2 },
  { label: "Domains", icon: Globe },
  { label: "Notifications", icon: Bell },
  { label: "Languages", icon: Languages },
  { label: "Customer privacy", icon: ShieldCheck },
  { label: "Policies", icon: FileText },
  { label: "Users", icon: Users },
  { label: "Billing", icon: Landmark },
];

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  const visibleNav = settingsNav.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const initials = (user?.name ?? "MF").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 z-40 bg-[#1a1a1a]">
      <div className="size-full overflow-y-auto rounded-t-xl bg-background">
        <button
          onClick={() => router.push("/")}
          aria-label="Close settings"
          className="fixed top-[4.25rem] right-4 z-50 flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-black/5 hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="mx-auto flex max-w-6xl items-start gap-8 px-4 py-8 md:px-8">
          {/* Settings navigation */}
          <aside className="sticky top-8 hidden w-72 shrink-0 flex-col rounded-xl bg-card ring-1 ring-black/8 md:flex">
            <div className="px-4 pt-4 pb-2">
              <p className="text-sm font-semibold">modeFirst</p>
              <p className="text-xs text-muted-foreground">1 store</p>
            </div>
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="h-8 pl-8"
                />
              </div>
            </div>
            <nav className="max-h-[52vh] overflow-y-auto px-2 pb-2">
              {visibleNav.map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium transition-colors duration-150",
                    item.active
                      ? "bg-[#f1f1f1] text-foreground"
                      : "text-foreground/80 hover:bg-[#f1f1f1]/70"
                  )}
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                </button>
              ))}
              {visibleNav.length === 0 && (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No settings found
                </p>
              )}
            </nav>
            <Separator />
            <div className="flex items-center gap-2.5 px-4 py-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-brand text-xs font-bold text-brand-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium capitalize">
                  {user?.name ?? "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
          </aside>

          {/* General settings content */}
          <div className="min-w-0 flex-1 pb-16">
            <div className="mb-4 flex items-center gap-2">
              <Store className="size-5" />
              <h1 className="text-xl font-bold">General</h1>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="gap-0 py-0">
                <div className="px-4 py-3">
                  <h2 className="text-sm font-semibold">Store contact details</h2>
                </div>
                <Separator />
                <CardContent className="p-0">
                  <button className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-muted/60">
                    <Store className="size-4 text-muted-foreground" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">modeFirst</span>
                      <span className="block text-xs text-muted-foreground">
                        {user?.email ?? "info@modefirst.com"}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                  <Separator />
                  <button className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-muted/60">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">
                        Store address
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        MODFIRST LLC, 4751 Lydell Road, Hyattsville Maryland
                        20781-1326, United States
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0">
                <div className="px-4 py-3">
                  <h2 className="text-sm font-semibold">Store defaults</h2>
                </div>
                <Separator />
                <CardContent className="flex flex-col gap-5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Currency display</p>
                      <p className="text-xs text-muted-foreground">
                        To manage the currencies customers see, go to Markets
                      </p>
                    </div>
                    <span className="rounded-lg bg-muted px-2.5 py-1 text-sm font-medium whitespace-nowrap">
                      US Dollar (USD $)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Backup region</Label>
                    <Select defaultValue="us">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="pk">Pakistan</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Determines settings for customers outside of your markets
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Unit system</Label>
                      <Select defaultValue="imperial">
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imperial">Imperial system</SelectItem>
                          <SelectItem value="metric">Metric system</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Default weight unit</Label>
                      <Select defaultValue="lb">
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lb">Pound (lb)</SelectItem>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="oz">Ounce (oz)</SelectItem>
                          <SelectItem value="g">Gram (g)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Time zone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">
                          (GMT-05:00) Eastern Time (US &amp; Canada)
                        </SelectItem>
                        <SelectItem value="cst">
                          (GMT-06:00) Central Time (US &amp; Canada)
                        </SelectItem>
                        <SelectItem value="pst">
                          (GMT-08:00) Pacific Time (US &amp; Canada)
                        </SelectItem>
                        <SelectItem value="pkt">
                          (GMT+05:00) Pakistan Standard Time
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Sets the time for when orders and analytics are recorded
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0">
                <div className="px-4 py-3">
                  <h2 className="text-sm font-semibold">Order ID format</h2>
                  <p className="text-xs text-muted-foreground">
                    Shown on the order page, customer pages, and customer order
                    notifications to identify orders
                  </p>
                </div>
                <Separator />
                <CardContent className="p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="prefix">Prefix</Label>
                      <Input id="prefix" defaultValue="#MF" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="suffix">Suffix</Label>
                      <Input id="suffix" placeholder="" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Your order ID will appear as #MF1001, #MF1002, #MF1003, …
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
