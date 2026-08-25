import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-white/[.075] bg-[#121217] shadow-[0_16px_48px_rgba(0,0,0,.14)]", className)} {...props} />;
}
