"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileClock, LogOut, Plus, Settings, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/bets", label: "Bet history", icon: FileClock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  async function signOut() {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    window.location.assign("/start");
  }
  const nav = <>
    <div className="flex h-20 items-center justify-between px-5"><Brand /><button className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X className="size-5" /></button></div>
    <div className="px-3"><Link href="/upload" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-lime-300 text-sm font-bold text-zinc-950 transition hover:bg-lime-200"><Plus className="size-4" />Import bet</Link></div>
    <nav className="mt-6 grid gap-1 px-3">{navigation.map((item) => { const active = pathname.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition", active ? "bg-white/[.07] text-white" : "text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200")}><item.icon className="size-[18px]" />{item.label}</Link>; })}</nav>
    <div className="mt-auto border-t border-white/[.07] p-4"><div className="flex items-center gap-3 rounded-xl bg-white/[.035] p-3"><div className="grid size-9 place-items-center rounded-full bg-indigo-400/15 text-sm font-bold text-indigo-300">{username.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-zinc-200">@{username}</p><p className="text-xs text-zinc-600">Password protected</p></div><button onClick={signOut} aria-label="Sign out" title="Sign out" className="grid size-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-white/[.06] hover:text-zinc-200"><LogOut className="size-4" /></button></div></div>
  </>;
  return <div className="min-h-screen bg-[#0b0c0e] text-zinc-100">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/[.07] bg-[#0e0f11] lg:flex">{nav}</aside>
    {menuOpen && <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(84vw,280px)] flex-col border-r border-white/10 bg-[#0e0f11] shadow-2xl lg:hidden">{nav}</aside>}
    {menuOpen && <button className="fixed inset-0 z-40 bg-black/70 lg:hidden" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[.07] bg-[#0b0c0e]/90 px-5 backdrop-blur lg:hidden"><Brand compact /><button onClick={() => setMenuOpen(true)} className="rounded-lg border border-white/10 px-3 py-2 text-sm">Menu</button></header>
    <main className="min-h-screen lg:pl-60">{children}</main>
  </div>;
}
