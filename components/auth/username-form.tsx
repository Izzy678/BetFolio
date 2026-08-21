"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { friendlyError } from "@/lib/errors";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { normalizeUsername, validateUsername } from "@/lib/username/validation";

export function UsernameForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const result = validateUsername(username);
    if (!result.success) return setError(result.error.issues[0]?.message ?? friendlyError("INVALID_USERNAME"));
    if (!isSupabaseConfigured()) { router.push("/dashboard"); return; }

    setPending(true);
    try {
      const supabase = createClient();
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const auth = await supabase.auth.signInAnonymously();
        if (auth.error || !auth.data.session) throw new Error("ANONYMOUS_AUTH_FAILED");
        session = auth.data.session;
      }
      const { data, error: functionError } = await supabase.functions.invoke("claim-username", { body: { username: result.data } });
      if (functionError) {
        const context = functionError.context as Response | undefined;
        const body = context ? await context.json().catch(() => null) as { code?: string } | null : null;
        throw new Error(body?.code ?? "INTERNAL_ERROR");
      }
      if (!data?.ok) throw new Error(data?.code ?? "INTERNAL_ERROR");
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(friendlyError(caught instanceof Error ? caught.message : undefined));
    } finally { setPending(false); }
  }

  return <form onSubmit={submit} className="grid gap-5">
    <label className="grid gap-2 text-sm font-medium text-zinc-300"><span>Username</span><div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">@</span><Input value={username} onChange={(event) => setUsername(normalizeUsername(event.target.value))} className="pl-8" placeholder="your_username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={24} aria-invalid={Boolean(error)} /></div><span className="text-xs font-normal text-zinc-600">3–24 characters · letters, numbers, underscores</span>{error && <span role="alert" className="text-xs font-normal text-red-300">{error}</span>}</label>
    <Button disabled={pending} className="w-full">{pending ? <><Loader2 className="size-4 animate-spin" />Creating tracker…</> : <>Continue <ArrowRight className="size-4" /></>}</Button>
  </form>;
}
