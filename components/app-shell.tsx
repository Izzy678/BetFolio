"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileClock, LogOut, PanelLeft, PanelLeftClose, Plus, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/bets", label: "Bet history", icon: FileClock },
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
              <button className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
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
                title={item.label}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl text-sm font-medium transition",
                  compact ? "justify-center px-0" : "px-3",
                  active ? "bg-white/[.07] text-white" : "text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200",
                )}
              >
                <item.icon className="size-[18px]" />
                {!compact && item.label}
              </Link>
            );
          })}
        </nav>
        <div className={cn("mt-auto border-t border-white/[.07]", compact ? "p-2" : "p-4")}>
          {compact ? (
            <div className="grid gap-2">
              <div className="mx-auto grid size-9 place-items-center rounded-full bg-indigo-400/15 text-sm font-bold text-indigo-300" title={`@${username}`}>
                {username.slice(0, 1).toUpperCase()}
              </div>
              <button onClick={signOut} aria-label="Sign out" title="Sign out" className="mx-auto grid size-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.06] hover:text-zinc-200">
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-white/[.035] p-3">
              <div className="grid size-9 place-items-center rounded-full bg-indigo-400/15 text-sm font-bold text-indigo-300">{username.slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-200">@{username}</p>
              </div>
              <button onClick={signOut} aria-label="Sign out" title="Sign out" className="grid size-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.06] hover:text-zinc-200">
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-zinc-100">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/[.07] bg-[#0e0f11] transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        <NavContent compact={collapsed} />
      </aside>
      {menuOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(84vw,280px)] flex-col border-r border-white/10 bg-[#0e0f11] shadow-2xl lg:hidden">
          <NavContent compact={false} />
        </aside>
      )}
      {menuOpen && <button className="fixed inset-0 z-40 bg-black/70 lg:hidden" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[.07] bg-[#0b0c0e]/90 px-5 backdrop-blur lg:hidden">
        <Brand compact href="/dashboard" />
        <button onClick={() => setMenuOpen(true)} className="rounded-lg border border-white/10 px-3 py-2 text-sm">Menu</button>
      </header>
      <main className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-60")}>{children}</main>
    </div>
  );
}
