"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Home,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Users,
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

const searchTargets = [
  { label: "Home", href: "/", icon: Home },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Products", href: "/products", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const initials = (user?.name ?? "MF")
    .split(/[\s._-]+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 bg-[#1a1a1a] px-3">
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="text-neutral-300 hover:bg-white/10 hover:text-white md:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/branding/logo_white.png"
          alt="modeFirst"
          className="h-7 w-auto"
        />
      </div>

      <div className="flex w-full max-w-xl justify-center">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-9 w-full max-w-md cursor-pointer items-center gap-2 rounded-lg border border-neutral-600 bg-[#303030] px-3 text-sm text-neutral-400 transition-colors duration-200 hover:border-neutral-500 hover:bg-[#3a3a3a]"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="hidden rounded border border-neutral-600 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          aria-label="Notifications"
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <Bell className="size-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-lg p-1 transition-colors duration-200 hover:bg-white/10">
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
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <Command>
          <CommandInput placeholder="Search modeFirst…" />
          <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {searchTargets.map((t) => (
              <CommandItem
                key={t.href}
                onSelect={() => {
                  setSearchOpen(false);
                  router.push(t.href);
                }}
              >
                <t.icon className="size-4" />
                {t.label}
              </CommandItem>
            ))}
          </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  );
}
