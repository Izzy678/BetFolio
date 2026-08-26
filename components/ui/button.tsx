import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const styles = {
  primary:
    "bg-white text-zinc-950 hover:bg-zinc-100 shadow-none",
  secondary: "bg-white/6 text-zinc-100 border border-white/10 hover:bg-white/10",
  outline:
    "border border-white/20 bg-transparent text-zinc-200 shadow-none hover:border-white/35 hover:bg-white/[.04] hover:text-white",
  ghost: "text-zinc-300 hover:bg-white/6 hover:text-white",
  danger: "bg-red-400/10 text-red-300 border border-red-400/20 hover:bg-red-400/15",
};

export function buttonClass(variant: keyof typeof styles = "primary", className?: string) {
  return cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-50",
    styles[variant],
    className,
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof styles }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof styles;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
