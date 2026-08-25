"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { friendlyError } from "@/lib/errors";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { credentialsSchema, usernameToAuthEmail } from "@/lib/username/credentials";
import { normalizeUsername } from "@/lib/username/validation";
import { useToast } from "@/components/ui/toast";

type Mode = "signup" | "login";

async function claimUsername(username: string) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("claim-username", { body: { username } });
  if (error) {
    const context = error.context as Response | undefined;
    const body = context ? await context.json().catch(() => null) as { code?: string } | null : null;
    throw new Error(body?.code ?? "INTERNAL_ERROR");
  }
  if (!data?.ok) throw new Error(data?.code ?? "INTERNAL_ERROR");
}

export function CredentialsForm() {
  const [mode, setMode] = useState<Mode>("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const toast = useToast();

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setPassword("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const result = credentialsSchema.safeParse({ username, password });
    if (!result.success) return setError(result.error.issues[0]?.message ?? "Check your username and password.");
    if (!isSupabaseConfigured()) { router.push("/dashboard"); return; }

    setPending(true);
    try {
      const supabase = createClient();
      const email = usernameToAuthEmail(result.data.username);

      if (mode === "signup") {
        const auth = await supabase.auth.signUp({
          email,
          password: result.data.password,
          options: { data: { username: result.data.username } },
        });
        if (auth.error) {
          if (/already|registered|exists/i.test(auth.error.message)) throw new Error("USERNAME_TAKEN");
          throw new Error("SIGNUP_FAILED");
        }
        if (!auth.data.session || !auth.data.user?.identities?.length) throw new Error("USERNAME_TAKEN");
        await claimUsername(result.data.username);
      } else {
        const auth = await supabase.auth.signInWithPassword({ email, password: result.data.password });
        if (auth.error || !auth.data.session) throw new Error("INVALID_CREDENTIALS");
        // Repairs a rare interrupted signup where Auth succeeded before the profile insert.
        await claimUsername(result.data.username);
      }

      router.replace("/dashboard");
      router.refresh();
      toast.success(mode === "signup" ? "Account created" : "Signed in");
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "INTERNAL_ERROR";
      const message = code === "INVALID_CREDENTIALS" ? "Incorrect username or password." : code === "SIGNUP_FAILED" ? "We couldn’t create this account. Please try again." : friendlyError(code);
      setError(message);
      toast.error(mode === "signup" ? "Couldn't create account" : "Couldn't sign in");
    } finally {
      setPending(false);
    }
  }

  return <div>
    <div className="mb-6 grid grid-cols-2 rounded-xl bg-black/25 p-1" role="tablist" aria-label="Account action">
      <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => switchMode("signup")} className={`h-9 rounded-lg text-sm font-semibold transition ${mode === "signup" ? "bg-white/[.09] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>Create account</button>
      <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => switchMode("login")} className={`h-9 rounded-lg text-sm font-semibold transition ${mode === "login" ? "bg-white/[.09] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>Sign in</button>
    </div>
    <form onSubmit={submit} className="grid gap-5">
      <label className="grid gap-2 text-sm font-medium text-zinc-300"><span>Username</span><div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">@</span><Input value={username} onChange={(event) => setUsername(normalizeUsername(event.target.value))} className="pl-8" placeholder="your_username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={24} /></div><span className="text-xs font-normal text-zinc-600">3–24 characters · letters, numbers, underscores</span></label>
      <label className="grid gap-2 text-sm font-medium text-zinc-300"><span>Password</span><div className="relative"><Input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} placeholder={mode === "signup" ? "Create a secure password" : "Enter your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="pr-11" maxLength={72} /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{mode === "signup" && <span className="text-xs font-normal text-zinc-600">At least 8 characters</span>}</label>
      {error && <span role="alert" className="text-sm text-red-300">{error}</span>}
      <Button disabled={pending} className="w-full">{pending ? <><Loader2 className="size-4 animate-spin" />{mode === "signup" ? "Creating account…" : "Signing in…"}</> : <>{mode === "signup" ? "Create account" : "Sign in"} <ArrowRight className="size-4" /></>}</Button>
    </form>
  </div>;
}
