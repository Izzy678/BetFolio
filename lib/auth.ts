import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = { id: string; username: string; base_currency: string | null };

export async function getCurrentProfile(options: { required?: boolean } = {}): Promise<CurrentProfile | null> {
  if (!isSupabaseConfigured()) return { id: "preview", username: "izzy", base_currency: "GBP" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (options.required) redirect("/start");
    return null;
  }
  const { data } = await supabase.from("profiles").select("id, username, base_currency").eq("id", user.id).maybeSingle();
  if (!data) {
    if (options.required) redirect("/start");
    return null;
  }
  return data as CurrentProfile;
}
