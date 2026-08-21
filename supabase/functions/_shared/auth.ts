import { createClient } from "npm:@supabase/supabase-js@2.57.0";

export async function authenticatedClient(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("INTERNAL_ERROR");
  const supabase = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("AUTH_REQUIRED");
  return { supabase, user };
}
