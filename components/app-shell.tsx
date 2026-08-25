"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  FileUp,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

const primaryNavigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/bets", label: "Bets", icon: History },
  { href: "/upload", label: "Import", icon: FileUp, accent: true },
  { href: "/platforms", label: "Platforms", icon: Building2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const COLLAPSE_KEY = "betfolio-sidebar-collapsed";

function NavigationLink({
  item,
  compact,
  pathname,
  onNavigate,
}: {
  item: (typeof primaryNavigation)[number];
  compact: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
  return (
    <Link
      href={item.href}
      title={item.label}
      onClick={onNavigate}
      className={cn(
        "group flex h-10 items-center gap-3 rounded-lg text-[13px] font-medium transition",
        compact ? "justify-center px-0" : "px-3",
        active
          ? "bg-white/[.07] text-zinc-100"
          : item.accent
            ? "text-violet-300 hover:bg-violet-400/[.09] hover:text-violet-200"
            : "text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200",
      )}
    >
      <item.icon className={cn("size-[17px] shrink-0", item.accent && !active && "text-violet-400")} strokeWidth={1.8} />
      {!compact && <span>{item.label}</span>}
      {!compact && item.accent && <span className="ml-auto text-[10px] text-violet-400/70">⌘ I</span>}
    </Link>
  );
}

function NavContent({
  compact,
  username,
  pathname,
  onToggleCollapsed,
  onClose,
  onSignOut,
}: {
  compact: boolean;
  username: string;
  pathname: string;
  onToggleCollapsed: () => void;
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className={cn("flex h-[68px] items-center border-b border-white/[.055]", compact ? "justify-center px-2" : "justify-between px-4")}>
        <Brand compact={compact} href="/dashboard" />
        {!compact && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden size-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.05] hover:text-zinc-300 lg:grid"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
        <button type="button" className="grid size-8 place-items-center text-zinc-500 lg:hidden" onClick={onClose} aria-label="Close navigation">
          <X className="size-5" />
        </button>
      </div>

      {compact && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="mx-auto mt-3 grid size-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.05] hover:text-zinc-300"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <PanelLeft className="size-4" />
        </button>
      )}

      <nav className={cn("mt-4 grid gap-1", compact ? "px-2" : "px-3")} aria-label="Primary navigation">
        {!compact && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-700">Workspace</p>}
        {primaryNavigation.map((item) => <NavigationLink key={item.href} item={item} compact={compact} pathname={pathname} onNavigate={onClose} />)}
      </nav>

      <div className={cn("mt-auto border-t border-white/[.055]", compact ? "p-2" : "p-3")}>
        <Link
          href="/settings"
          title="Settings"
          onClick={onClose}
          className={cn(
            "mb-2 flex h-10 items-center gap-3 rounded-lg text-[13px] font-medium transition",
            compact ? "justify-center" : "px-3",
            pathname.startsWith("/settings") ? "bg-white/[.07] text-zinc-100" : "text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200",
          )}
        >
          <Settings className="size-[17px]" strokeWidth={1.8} />
          {!compact && "Settings"}
        </Link>
        <div className={cn("flex items-center rounded-lg", compact ? "justify-center py-2" : "gap-3 border border-white/[.055] bg-white/[.02] p-2.5")}>
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-400/15 text-xs font-semibold text-violet-300">{username.slice(0, 1).toUpperCase()}</div>
          {!compact && <p className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-300">@{username}</p>}
          <button onClick={onSignOut} aria-label="Sign out" title="Sign out" className="grid size-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.06] hover:text-zinc-200">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function AppShell({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
      } catch {
        /* Device-only preference is optional. */
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* Device-only preference is optional. */
      }
      return next;
    });
  }

  async function signOut() {
    toast.info("Signing out…");
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    window.location.assign("/start");
  }

  const navProps = {
    username,
    pathname,
    onToggleCollapsed: toggleCollapsed,
    onClose: () => setMenuOpen(false),
    onSignOut: signOut,
  };

  return (
    <div className="min-h-screen bg-[#0c0c10] text-zinc-100">
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/[.065] bg-[#0b0b0e] transition-[width] duration-200 lg:flex", collapsed ? "w-[72px]" : "w-[232px]")}>
        <NavContent compact={collapsed} {...navProps} />
      </aside>

      {menuOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,290px)] flex-col border-r border-white/10 bg-[#0b0b0e] shadow-2xl lg:hidden">
          <NavContent compact={false} {...navProps} />
        </aside>
      )}
      {menuOpen && <button className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[.065] bg-[#0c0c10]/90 px-4 backdrop-blur-xl lg:hidden">
        <Brand compact href="/dashboard" />
        <button onClick={() => setMenuOpen(true)} className="grid size-9 place-items-center rounded-lg border border-white/10 text-zinc-300" aria-label="Open navigation">
          <Menu className="size-4" />
        </button>
      </header>

      <main className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-[232px]")}>{children}</main>
    </div>
  );
}
