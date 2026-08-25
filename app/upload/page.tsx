import { AppShell } from "@/components/app-shell";
import { ImportEntry } from "@/components/uploads/import-entry";
import { getCurrentProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const profile = await getCurrentProfile({ required: true });
  return (
    <AppShell username={profile!.username}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
        <p className="text-xs text-zinc-600">Add to your portfolio</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Import a settled bet</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
          Upload a betslip for structured extraction, or record the settlement manually.
        </p>
        <div className="mt-7">
          <ImportEntry />
        </div>
      </div>
    </AppShell>
  );
}
