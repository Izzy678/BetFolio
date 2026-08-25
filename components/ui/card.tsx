import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-white/[.08] bg-[#131417] shadow-[0_18px_60px_rgba(0,0,0,.16)]", className)} {...props} />;
}
