"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileClock,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/bets", label: "History", icon: FileClock },
  { href: "/settings", label: "Settings", icon: Settings },
];

const COLLAPSE_KEY = "betfolio-sidebar-collapsed";

export function AppShell({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function signOut() {
    toast.info("Signing out…");
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    window.location.assign("/start");
  }

  function NavContent({ compact }: { compact: boolean }) {
    return (
      <>
        <div
          className={cn(
            "flex gap-2",
            compact ? "h-auto flex-col items-center px-2 py-4" : "h-20 items-center justify-between px-5",
          )}
        >
          {compact ? <Brand compact href="/dashboard" /> : <Brand href="/dashboard" />}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[.06] hover:text-zinc-200 lg:grid"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
            {!compact && (
              <button
                type="button"
                className="grid size-10 place-items-center rounded-lg text-zinc-400 lg:hidden"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>
        <div className={cn(compact ? "px-2" : "px-3")}>
          <Link
            href="/upload"
            onClick={() => setMenuOpen(false)}
            title="Import bet"
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-xl bg-lime-300 text-sm font-bold text-zinc-950 transition hover:bg-lime-200",
              compact && "px-0",
            )}
          >
            <Plus className="size-4" />
            {!compact && "Import bet"}
          </Link>
        </div>
        <nav className={cn("mt-6 grid gap-1", compact ? "px-2" : "px-3")}>
          {navigation.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label === "History" ? "Bet history" : item.label}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl text-sm font-medium transition",
                  compact ? "justify-center px-0" : "px-3",
                  active ? "bg-white/[.07] text-white" : "text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200",
                )}
              >
                <item.icon className="size-[18px]" />
                {!compact && (item.label === "History" ? "Bet history" : item.label)}
              </Link>
            );
          })}
        </nav>
        <div className={cn("mt-auto border-t border-white/[.07]", compact ? "p-2" : "p-4")}>
          {compact ? (
            <div className="grid gap-2">
              <div
                className="mx-auto grid size-9 place-items-center rounded-full bg-indigo-400/15 text-sm font-bold text-indigo-300"
                title={`@${username}`}
              >
                {username.slice(0, 1).toUpperCase()}
              </div>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="mx-auto grid size-10 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.06] hover:text-zinc-200"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-white/[.035] p-3">
              <div className="grid size-9 place-items-center rounded-full bg-indigo-400/15 text-sm font-bold text-indigo-300">
                {username.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-200">@{username}</p>
              </div>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="grid size-10 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.06] hover:text-zinc-200"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  const uploadActive = pathname.startsWith("/upload") || pathname.includes("/review");

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-zinc-100">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/[.07] bg-[#0e0f11] transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        <NavContent compact={collapsed} />
      </aside>

      {/* Mobile account drawer (sign out / full labels) */}
      {menuOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(84vw,280px)] flex-col border-r border-white/10 bg-[#0e0f11] shadow-2xl lg:hidden">
          <NavContent compact={false} />
        </aside>
      )}
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile top bar */}
      <header
        className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-white/[.07] bg-[#0b0c0e]/92 px-4 backdrop-blur safe-top lg:hidden"
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 text-zinc-300"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <Brand compact href="/dashboard" />
        </div>
        <Link
          href="/upload"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-lime-300 px-3 text-sm font-bold text-zinc-950"
        >
          <Plus className="size-4" />
          Import
        </Link>
      </header>

      <main
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          "pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0",
          collapsed ? "lg:pl-[72px]" : "lg:pl-60",
        )}
      >
        {children}
      </main>

      {/* Mobile bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[.08] bg-[#0e0f11]/95 backdrop-blur-lg safe-bottom lg:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-4 px-2">
          {navigation.slice(0, 2).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide",
                  active ? "text-white" : "text-zinc-500",
                )}
              >
                <item.icon className={cn("size-5", active && "text-lime-300")} strokeWidth={active ? 2.25 : 2} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/upload"
            className="relative flex flex-col items-center justify-center"
            aria-label="Import bet"
          >
            <span
              className={cn(
                "grid size-12 -translate-y-3 place-items-center rounded-2xl bg-lime-300 text-zinc-950 shadow-lg shadow-lime-300/20",
                uploadActive && "ring-2 ring-lime-200 ring-offset-2 ring-offset-[#0e0f11]",
              )}
            >
              <Plus className="size-6" strokeWidth={2.5} />
            </span>
            <span className={cn("text-[10px] font-semibold", uploadActive ? "text-lime-300" : "text-zinc-500")}>
              Import
            </span>
          </Link>
          {navigation.slice(2).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide",
                  active ? "text-white" : "text-zinc-500",
                )}
              >
                <item.icon className={cn("size-5", active && "text-lime-300")} strokeWidth={active ? 2.25 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
