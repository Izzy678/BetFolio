"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { friendlyError } from "@/lib/errors";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;
type Stage = "idle" | "uploading" | "reading" | "checking";

function sanitizeFilename(name: string) {
  const pieces = name.split(".");
  const extension = pieces.length > 1 ? `.${pieces.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "";
  return `${pieces.join("-").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "betslip"}${extension}`;
}

export function UploadZone() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const choose = useCallback((candidate?: File) => {
    setError("");
    if (!candidate) return;
    if (!ALLOWED.includes(candidate.type)) return setError(friendlyError("UNSUPPORTED_FILE_TYPE"));
    if (candidate.size > MAX_SIZE) return setError(friendlyError("FILE_TOO_LARGE"));
    if (preview) URL.revokeObjectURL(preview);
    setFile(candidate);
    setPreview(candidate.type.startsWith("image/") ? URL.createObjectURL(candidate) : null);
  }, [preview]);

  async function upload() {
    if (!file) return;
    if (!isSupabaseConfigured()) { router.push("/imports/preview/review"); return; }
    setError(""); setStage("uploading");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("INTERNAL_ERROR");
      const uploadId = crypto.randomUUID();
      const storagePath = `${user.id}/${uploadId}/${sanitizeFilename(file.name)}`;
      const { error: recordError } = await supabase.from("bet_uploads").insert({ id: uploadId, user_id: user.id, storage_path: storagePath, original_filename: file.name, mime_type: file.type, file_size_bytes: file.size, status: "uploaded" });
      if (recordError) throw new Error("INTERNAL_ERROR");
      const { error: storageError } = await supabase.storage.from("betslips").upload(storagePath, file, { contentType: file.type, upsert: false });
      if (storageError) throw new Error("INVALID_FILE");
      setStage("reading");
      const { data, error: processError } = await supabase.functions.invoke("process-betslip", { body: { uploadId } });
      if (processError) {
        const context = processError.context as Response | undefined;
        const body = context ? await context.json().catch(() => null) as { code?: string; duplicateOf?: string } | null : null;
        if (body?.code === "DUPLICATE_UPLOAD" && body.duplicateOf) {
          const { data: retryData, error: retryError } = await supabase.functions.invoke("process-betslip", { body: { uploadId: body.duplicateOf } });
          if (!retryError && retryData?.ok) {
            setStage("checking");
            await new Promise((resolve) => setTimeout(resolve, 350));
            router.push(`/imports/${retryData.uploadId ?? body.duplicateOf}/review`);
            return;
          }
        }
        throw new Error(body?.code ?? "INTERNAL_ERROR");
      }
      if (!data?.ok) throw new Error(data?.code ?? "INTERNAL_ERROR");
      setStage("checking");
      await new Promise((resolve) => setTimeout(resolve, 350));
      router.push(`/imports/${data.uploadId ?? uploadId}/review`);
    } catch (caught) {
      setError(friendlyError(caught instanceof Error ? caught.message : undefined));
      setStage("idle");
    }
  }

  const stageIndex = stage === "uploading" ? 0 : stage === "reading" ? 1 : stage === "checking" ? 2 : -1;
  return <div className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
    <Card className="p-3 sm:p-5"><button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }} className={`group relative grid min-h-[400px] w-full place-items-center overflow-hidden rounded-xl border border-dashed transition ${dragging ? "border-violet-400 bg-violet-400/[.06]" : file ? "border-white/10 bg-[#0d0d12]" : "border-white/[.12] bg-[#0d0d12] hover:border-violet-400/40 hover:bg-violet-400/[.025]"}`}>
      <input ref={inputRef} type="file" className="sr-only" accept={ALLOWED.join(",")} onChange={(event) => choose(event.target.files?.[0])} />
      {file ? <>{preview ? <Image src={preview} alt="Selected betslip preview" fill unoptimized className="object-contain p-4" /> : <div className="text-center"><div className="mx-auto grid size-16 place-items-center rounded-xl bg-red-400/10"><FileText className="size-7 text-red-300" /></div><p className="mt-4 text-sm font-semibold">{file.name}</p><p className="mt-1 text-xs text-zinc-600">PDF · {(file.size / 1024 / 1024).toFixed(2)} MB</p></div>}<span role="button" aria-label="Remove file" onClick={(event) => { event.stopPropagation(); setFile(null); setPreview(null); }} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/10 bg-black/70 text-zinc-300 backdrop-blur hover:text-white"><X className="size-4" /></span></> : <div className="max-w-sm px-6 text-center"><div className="mx-auto grid size-14 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-zinc-500 transition group-hover:border-violet-400/25 group-hover:text-violet-300"><UploadCloud className="size-6" /></div><h2 className="mt-5 text-base font-semibold">Drop your settled betslip here</h2><p className="mt-2 text-sm leading-6 text-zinc-500">or click to select a screenshot or PDF</p><div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[.08em] text-zinc-700"><span className="flex items-center gap-1"><ImageIcon className="size-3.5" />JPEG, PNG, WEBP</span><span>PDF</span><span>MAX 10 MB</span></div></div>}
    </button>{error && <div role="alert" className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[.06] px-4 py-3 text-sm text-red-200">{error} <button onClick={() => setError("")} className="ml-1 underline">Try again</button></div>}<Button onClick={upload} disabled={!file || stage !== "idle"} className="mt-4 w-full">{stage !== "idle" ? <><Loader2 className="size-4 animate-spin" />Processing…</> : "Upload and read betslip"}</Button></Card>
    <div className="grid content-start gap-4"><Card className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-600">Import progress</p><div className="mt-5 grid gap-5">{["Slip uploaded", "Reading bet details", "Checking settlement", "Ready to review"].map((label, index) => <div key={label} className="flex items-center gap-3"><span className={`grid size-7 place-items-center rounded-full border text-xs font-semibold ${stageIndex > index || (stageIndex === 2 && index === 3) ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : stageIndex === index ? "border-violet-400 bg-violet-400/10 text-violet-300" : "border-white/10 text-zinc-700"}`}>{stageIndex > index ? <Check className="size-3.5" /> : index + 1}</span><span className={`text-sm ${stageIndex === index ? "text-white" : "text-zinc-500"}`}>{label}</span></div>)}</div></Card><Card className="p-5"><div className="flex gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><FileText className="size-4" /></div><div><p className="text-sm font-semibold">Your slip stays private</p><p className="mt-1 text-xs leading-5 text-zinc-600">Files are stored in an owner-only bucket and never exposed through public links.</p></div></div></Card></div>
  </div>;
}
