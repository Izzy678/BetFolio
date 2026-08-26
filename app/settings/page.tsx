import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCurrentProfile({ required: true });
  return (
    <AppShell username={profile!.username}>
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-9">
        <p className="text-sm text-zinc-500">Account and preferences</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Settings</h1>
        <div className="mt-5 grid gap-3 sm:mt-7 sm:gap-4">
          <Card className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold">Profile</h2>
            <div className="mt-4 grid gap-5 sm:mt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-600">Username</p>
                <p className="mt-2 text-sm font-semibold">@{profile!.username}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600">Account status</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-zinc-400" />
                  Password-protected account
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold">Session</h2>
            <p className="mt-2 text-sm text-zinc-500">Sign out on this device.</p>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
