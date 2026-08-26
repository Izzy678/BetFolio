import { AppShell } from "@/components/app-shell";
import { ImportEntry } from "@/components/uploads/import-entry";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const profile = await getCurrentProfile({ required: true });
  return (
    <AppShell username={profile!.username}>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-zinc-500">New bet</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:mt-3 sm:text-3xl">Add a settled bet</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500 sm:mt-3">
          Upload a betslip screenshot for AI extraction, or enter the details yourself.
        </p>
        <div className="mt-6 sm:mt-8">
          <ImportEntry />
        </div>
      </div>
    </AppShell>
  );
}
