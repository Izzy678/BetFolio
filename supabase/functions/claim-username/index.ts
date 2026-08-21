import { authenticatedClient } from "../_shared/auth.ts";
import { codeFromError, handleOptions, json } from "../_shared/http.ts";

const RESERVED = new Set(["admin","administrator","support","api","root","system","null","undefined"]);

Deno.serve(async (request) => {
  const options = handleOptions(request); if (options) return options;
  if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const { supabase, user } = await authenticatedClient(request);
    const body = await request.json().catch(() => null) as { username?: unknown } | null;
    const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
    if (!/^[a-z0-9_]{3,24}$/.test(username) || RESERVED.has(username)) throw new Error("INVALID_USERNAME");
    const { data: existing } = await supabase.from("profiles").select("id,username").eq("id", user.id).maybeSingle();
    if (existing) return json({ ok: true, username: existing.username });
    const { error } = await supabase.from("profiles").insert({ id: user.id, username });
    if (error?.code === "23505") throw new Error("USERNAME_TAKEN");
    if (error) throw error;
    return json({ ok: true, username }, 201);
  } catch (error) {
    const code = codeFromError(error);
    return json({ ok: false, code }, code === "USERNAME_TAKEN" ? 409 : code === "INVALID_USERNAME" ? 400 : code === "AUTH_REQUIRED" ? 401 : 500);
  }
});
