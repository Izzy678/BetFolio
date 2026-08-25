import { redirect } from "next/navigation";
import { ArrowUpRight, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { Brand } from "@/components/brand";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  if (isSupabaseConfigured()) {
    const profile = await getCurrentProfile();
    if (profile) redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c0c10] text-white">
      <div className="noise pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute right-[-220px] top-[-260px] size-[620px] rounded-full bg-violet-500/[.1] blur-[120px]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.08fr_.92fr]">
        <section className="hidden flex-col justify-between border-r border-white/[.06] px-10 py-9 lg:flex xl:px-16 xl:py-12">
          <Brand />
          <div className="max-w-xl py-14">
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-violet-400">Your private betting portfolio</p>
            <h1 className="mt-5 text-5xl font-medium leading-[1.02] tracking-[-.06em] xl:text-6xl">Every settled bet.<br /><span className="text-zinc-500">One honest number.</span></h1>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-zinc-500">Track your real profit and loss across every bookmaker without connecting a betting account.</p>

            <div className="mt-12 max-w-lg rounded-2xl border border-white/[.075] bg-[#111116]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,.25)]">
              <div className="flex items-start justify-between">
                <div><p className="text-[10px] font-medium uppercase tracking-[.12em] text-zinc-600">Net P&amp;L · GBP</p><p className="mt-2 text-4xl font-semibold tracking-[-.05em] text-emerald-300">+£1,284.60</p></div>
                <span className="grid size-8 place-items-center rounded-full bg-emerald-400/10 text-emerald-300"><ArrowUpRight className="size-4" /></span>
              </div>
              <div className="mt-8 flex h-20 items-end gap-1" aria-hidden="true">
                {[20, 26, 24, 38, 35, 49, 44, 57, 52, 66, 61, 74, 69, 84, 80, 96].map((height, index) => <span key={index} className="flex-1 rounded-sm bg-gradient-to-t from-emerald-400/5 to-emerald-400/55" style={{ height: `${height}%` }} />)}
              </div>
              <div className="mt-5 grid grid-cols-3 border-t border-white/[.06] pt-4">
                {[['Cash staked', '£8,420'], ['ROI', '15.26%'], ['Win rate', '54.8%']].map(([label, value]) => <div key={label}><p className="text-[9px] text-zinc-600">{label}</p><p className="mt-1 text-xs font-semibold text-zinc-300">{value}</p></div>)}
              </div>
            </div>
          </div>
          <div className="flex gap-5 text-[11px] text-zinc-600"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Owner-only data</span><span className="inline-flex items-center gap-1.5"><Check className="size-3.5" /> No email required</span></div>
        </section>

        <section className="grid min-h-screen place-items-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex justify-center lg:hidden"><Brand /></div>
            <div className="rounded-2xl border border-white/[.08] bg-[#111116]/95 p-5 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur sm:p-8">
              <div className="mb-7">
                <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-violet-400">Welcome to Betfolio</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Build your portfolio</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-500">Use one globally unique username and password to access your history from any device.</p>
              </div>
              <CredentialsForm />
              <div className="mt-7 flex gap-2.5 border-t border-white/[.06] pt-5 text-[11px] leading-5 text-zinc-600">
                <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
                <p>Supabase Auth secures your password. Betfolio never stores it in its application tables.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
