"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Loader2, LogOut, Package, Search,
  Settings, ShoppingCart, Store, Tag, Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import {
  globalAdminSearch,
  type AdminSearchResults,
  type AdminSearchItem,
  type AdminSearchType,
} from "@/lib/admin-api";

// ─── Result-type config ───────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AdminSearchType,
  {
    label: string;
    icon: React.ElementType;
    href: (item: AdminSearchItem) => string;
    display: (item: AdminSearchItem) => string;
    sub: (item: AdminSearchItem) => string | undefined;
  }
> = {
  products: {
    label: "Products",
    icon: Package,
    href: (item) => `/products/${item.id}`,
    display: (item) => String(item.title ?? item.name ?? `Product #${item.id}`),
    sub: (item) =>
      item.status
        ? String(item.status)
        : item.base_price != null
        ? `$${item.base_price}`
        : item.price != null
        ? `$${item.price}`
        : undefined,
  },
  orders: {
    label: "Orders",
    icon: ShoppingCart,
    href: () => `/orders`,
    display: (item) => String(item.order_number ?? `#${item.id}`),
    sub: (item) =>
      item.status
        ? String(item.status)
        : item.total != null
        ? `$${item.total}`
        : undefined,
  },
  users: {
    label: "Customers",
    icon: Users,
    href: () => `/customers`,
    display: (item) =>
      String(item.full_name ?? item.name ?? item.email ?? `User #${item.id}`),
    sub: (item) => (item.email ? String(item.email) : undefined),
  },
  vendors: {
    label: "Vendors",
    icon: Store,
    href: () => `/settings`,
    display: (item) =>
      String(item.name ?? item.full_name ?? `Vendor #${item.id}`),
    sub: (item) => (item.email ? String(item.email) : undefined),
  },
  coupons: {
    label: "Coupons",
    icon: Tag,
    href: () => `/discounts`,
    display: (item) => String(item.code ?? item.name ?? `Coupon #${item.id}`),
    sub: (item) => (item.status ? String(item.status) : undefined),
  },
};

const ALL_TYPES = Object.keys(TYPE_CONFIG) as AdminSearchType[];

// ─── Debounce ─────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<AdminSearchResults>({});
  const [loading, setLoading] = React.useState(false);

  const debounced = useDebounce(query.trim(), 300);

  // ⌘K / Ctrl+K shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Clear state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults({});
      setLoading(false);
    }
  }, [open]);

  // Call POST /search/admin when debounced query >= 2 chars
  React.useEffect(() => {
    if (debounced.length < 2) {
      setResults({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    globalAdminSearch(debounced, undefined, 5)
      .then((r) => {
        if (!cancelled) { setResults(r); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debounced]);

  const totalHits = ALL_TYPES.reduce((n, t) => n + (results[t]?.length ?? 0), 0);

  const initials = (user?.name ?? "MF")
    .split(/[\s._-]+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 bg-[#1a1a1a] px-3">
      {/* Left — logo + sidebar trigger */}
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="text-neutral-300 hover:bg-white/10 hover:text-white md:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/branding/logo_white.png" alt="modeFirst" className="h-7 w-auto" />
      </div>

      {/* Center — search trigger button */}
      <div className="flex w-full max-w-xl justify-center">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-full max-w-md cursor-pointer items-center gap-2 rounded-lg border border-neutral-600 bg-[#303030] px-3 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:bg-[#3a3a3a]"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="hidden rounded border border-neutral-600 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right — notifications + user menu */}
      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          aria-label="Notifications"
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Bell className="size-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-lg p-1 transition-colors hover:bg-white/10">
            <Avatar className="size-7 rounded-md">
              <AvatarFallback className="rounded-md bg-brand text-xs font-bold text-brand-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium text-white lg:inline">
              {user?.name ?? "My Store"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium capitalize">{user?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => { logout(); router.replace("/login"); }}
            >
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Search Dialog — POST /search/admin */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
            <CommandInput
              placeholder="Search products, orders, customers…"
              value={query}
              onValueChange={setQuery}
              className="border-0 focus:ring-0"
            />
            {loading && (
              <Loader2 className="ml-2 size-4 shrink-0 animate-spin text-muted-foreground" />
            )}
          </div>

          <CommandList className="max-h-[420px]">
            {/* Hint before typing */}
            {debounced.length < 2 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search across products, orders, customers, vendors and coupons.
              </div>
            )}

            {/* No results */}
            {!loading && debounced.length >= 2 && totalHits === 0 && (
              <CommandEmpty>No results for &ldquo;{debounced}&rdquo;</CommandEmpty>
            )}

            {/* Grouped results by type */}
            {ALL_TYPES.map((type) => {
              const items = results[type];
              if (!items?.length) return null;
              const cfg = TYPE_CONFIG[type];
              const Icon = cfg.icon;
              return (
                <CommandGroup key={type} heading={cfg.label}>
                  {items.map((item) => {
                    const sub = cfg.sub(item);
                    return (
                      <CommandItem
                        key={`${type}-${item.id}`}
                        value={`${type}-${item.id}`}
                        onSelect={() => navigate(cfg.href(item))}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2"
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{cfg.display(item)}</p>
                          {sub && (
                            <p className="truncate text-xs capitalize text-muted-foreground">{sub}</p>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>

          {/* Footer keyboard hints */}
          {totalHits > 0 && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {totalHits} result{totalHits > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">↑↓</kbd>{" "}
                  navigate
                </span>
                <span>
                  <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">↵</kbd>{" "}
                  open
                </span>
                <span>
                  <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">Esc</kbd>{" "}
                  close
                </span>
              </div>
            </div>
          )}
        </Command>
      </CommandDialog>
    </header>
  );
}
