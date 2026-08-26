"use client";

import { LogOut } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const toast = useToast();

  async function signOut() {
    toast.info("Signing out…");
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    window.location.assign("/start");
  }

  return (
    <Button type="button" variant="outline" onClick={signOut} className="h-11 w-full sm:w-auto">
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
