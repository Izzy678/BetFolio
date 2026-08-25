import Link from "next/link";

export function Brand({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="Betfolio home">
    <span className="grid size-8 place-items-center rounded-[10px] bg-lime-300 text-[13px] font-black text-zinc-950 shadow-[0_0_28px_rgba(190,242,100,.15)]">B</span>
    {!compact && <span className="text-[15px] font-bold tracking-[-.02em] text-white">betfolio</span>}
  </Link>;
}
