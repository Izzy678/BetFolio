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
      <div className="mb-6 inline-grid grid-cols-2 rounded-xl border border-white/10 bg-white/[.03] p-1" role="tablist" aria-label="How to add a bet">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "upload"}
          onClick={() => setMode("upload")}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
            mode === "upload" ? "bg-white/[.09] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300",
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
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
            mode === "manual" ? "bg-white/[.09] text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300",
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
