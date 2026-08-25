import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const styles = {
  primary: "border border-violet-400/20 bg-violet-500 text-white shadow-[0_10px_32px_rgba(124,58,237,.22)] hover:bg-violet-400",
  secondary: "border border-white/10 bg-white/[.055] text-zinc-100 hover:bg-white/[.09]",
  ghost: "text-zinc-400 hover:bg-white/[.055] hover:text-white",
  danger: "bg-red-400/10 text-red-300 border border-red-400/20 hover:bg-red-400/15",
};

export function buttonClass(variant: keyof typeof styles = "primary", className?: string) {
  return cn("inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c10] disabled:pointer-events-none disabled:opacity-50", styles[variant], className);
}

export function Button({ variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof styles }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ href, variant = "primary", className, children }: { href: string; variant?: keyof typeof styles; className?: string; children: React.ReactNode }) {
  return <Link href={href} className={buttonClass(variant, className)}>{children}</Link>;
}
