import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-[#0d0e10] px-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10";

export function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return <label className={cn("grid gap-2 text-sm font-medium text-zinc-300", className)}><span>{label}</span>{children}{error ? <span className="text-xs font-normal text-red-300">{error}</span> : hint ? <span className="text-xs font-normal text-zinc-500">{hint}</span> : null}</label>;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn(inputClass, className)} {...props} />);
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => <select ref={ref} className={cn(inputClass, "appearance-none", className)} {...props}>{children}</select>);
Select.displayName = "Select";
