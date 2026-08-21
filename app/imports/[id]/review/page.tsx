import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ReviewForm } from "@/components/uploads/review-form";
import { getCurrentProfile } from "@/lib/auth";
import { assessExtraction } from "@/lib/betting/validation";
import { mockExtractions } from "@/lib/gemini/fixtures";
import type { BetslipExtraction } from "@/lib/gemini/schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile({ required: true });
  const { id } = await params;
  let extraction: BetslipExtraction = mockExtractions.winning_accumulator;
  let sourceUrl: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [{ data: upload }, { data: extractionRow }] = await Promise.all([
      supabase.from("bet_uploads").select("storage_path").eq("id", id).single(),
      supabase.from("bet_extractions").select("normalized_data").eq("upload_id", id).order("created_at", { ascending: false }).limit(1).single(),
    ]);
    if (!upload || !extractionRow) notFound();
    extraction = extractionRow.normalized_data as BetslipExtraction;
    const { data } = await supabase.storage.from("betslips").createSignedUrl(upload.storage_path as string, 300);
    sourceUrl = data?.signedUrl ?? null;
  }
  const assessment = assessExtraction(extraction);
  return <AppShell username={profile!.username}><div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><ReviewForm uploadId={id} extraction={assessment.normalized} issues={assessment.issues} sourceUrl={sourceUrl} /></div></AppShell>;
}
