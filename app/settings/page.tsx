import { Database, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCurrentProfile({ required: true });
  return (
    <AppShell username={profile!.username}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
        <p className="text-xs text-zinc-600">Account and preferences</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Settings</h1>
        <div className="mt-7 grid gap-4">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[.06] px-5 py-4"><span className="grid size-8 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><UserRound className="size-4" /></span><div><h2 className="text-sm font-semibold">Profile</h2><p className="mt-0.5 text-[11px] text-zinc-600">Your Betfolio identity</p></div></div>
            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6"><div><p className="text-[10px] font-medium uppercase tracking-[.1em] text-zinc-600">Username</p><p className="mt-2 text-sm font-semibold text-zinc-200">@{profile!.username}</p></div><div><p className="text-[10px] font-medium uppercase tracking-[.1em] text-zinc-600">Base currency</p><p className="mt-2 text-sm font-semibold text-zinc-200">{profile!.base_currency ?? 'GBP'}</p></div></div>
          </Card>
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[.06] px-5 py-4"><span className="grid size-8 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><ShieldCheck className="size-4" /></span><div><h2 className="text-sm font-semibold">Security and privacy</h2><p className="mt-0.5 text-[11px] text-zinc-600">How your account and records are protected</p></div></div>
            <div className="divide-y divide-white/[.055] px-5 sm:px-6">{[[KeyRound, 'Password-protected account', 'Supabase Auth verifies your password and Betfolio never stores it in application tables.'], [Database, 'Owner-only portfolio', 'Database policies restrict bets, uploads, and analytics to your authenticated user ID.']].map(([Icon, title, copy]) => { const RowIcon = Icon as typeof KeyRound; return <div key={String(title)} className="flex gap-4 py-5"><RowIcon className="mt-0.5 size-4 shrink-0 text-zinc-600" /><div><p className="text-sm font-medium text-zinc-300">{String(title)}</p><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-600">{String(copy)}</p></div></div>; })}</div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
