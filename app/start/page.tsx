import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Brand } from "@/components/brand";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  if (isSupabaseConfigured()) {
    const profile = await getCurrentProfile();
    if (profile) redirect("/dashboard");
  }
  return <main className="noise grid min-h-screen place-items-center bg-[#0b0c0e] px-5 py-12 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(190,242,100,.07),transparent_35%)]" /><div className="relative w-full max-w-md"><div className="mb-8 flex justify-center"><Brand /></div><div className="rounded-3xl border border-white/10 bg-[#121315]/95 p-6 shadow-[0_30px_100px_rgba(0,0,0,.45)] sm:p-8"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-lime-300">Your private tracker</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Track every settled bet</h1><p className="mt-3 text-sm leading-6 text-zinc-500">Create one unique username, protect it with a password, and access your history from any device.</p></div><CredentialsForm /><div className="mt-7 flex gap-2.5 border-t border-white/[.07] pt-5 text-xs leading-5 text-zinc-600"><LockKeyhole className="mt-0.5 size-4 shrink-0" /><p>Your password is handled by Supabase Auth and is never stored in Ledgerline’s application tables.</p></div></div></div></main>;
}
