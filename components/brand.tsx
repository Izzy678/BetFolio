import Link from "next/link";

export function Brand({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="Betfolio home">
    <span className="grid size-8 place-items-center rounded-[9px] border border-violet-300/20 bg-violet-500 text-[13px] font-black text-white shadow-[0_0_28px_rgba(124,58,237,.2)] transition group-hover:bg-violet-400">B</span>
    {!compact && <span className="text-[15px] font-semibold tracking-[-.025em] text-zinc-100">betfolio</span>}
  </Link>;
}
