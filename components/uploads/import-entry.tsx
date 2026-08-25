"use client";

import { useState } from "react";
import { FileUp, PenLine } from "lucide-react";
import { ManualBetForm } from "@/components/uploads/manual-bet-form";
import { UploadZone } from "@/components/uploads/upload-zone";
import { cn } from "@/lib/utils";

type Mode = "upload" | "manual";

export function ImportEntry() {
  const [mode, setMode] = useState<Mode>("upload");

  return (
    <div>
      <div className="mb-6 inline-grid w-full grid-cols-2 rounded-lg border border-white/[.08] bg-white/[.025] p-1 sm:w-auto" role="tablist" aria-label="How to add a bet">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "upload"}
          onClick={() => setMode("upload")}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition",
            mode === "upload" ? "bg-white/[.08] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <FileUp className="size-4" />
          Upload slip
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "manual"}
          onClick={() => setMode("manual")}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition",
            mode === "manual" ? "bg-white/[.08] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <PenLine className="size-4" />
          Log manually
        </button>
      </div>
      {mode === "upload" ? <UploadZone /> : <ManualBetForm />}
    </div>
  );
}
