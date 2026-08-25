"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Pencil, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import type { BetListItem } from "@/lib/bets";
import { formatDisplayDate } from "@/lib/dates";
import { friendlyError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatMoney, titleCase } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

function RowActions({ betId, onDeleted }: { betId: string; onDeleted: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirming(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function remove() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      if (!isSupabaseConfigured()) {
        onDeleted(betId);
        toast.success("Bet deleted");
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.from("bets").delete().eq("id", betId);
      if (error) throw new Error("INTERNAL_ERROR");
      onDeleted(betId);
      toast.success("Bet deleted");
      router.refresh();
    } catch (caught) {
      toast.error("Couldn't delete bet");
      friendlyError(caught instanceof Error ? caught.message : undefined);
      setConfirming(false);
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <div ref={menuRef} className="relative" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label="Bet actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          setConfirming(false);
        }}
        className="grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-white/[.06] hover:text-zinc-200"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-40 min-w-[160px] rounded-xl border border-white/10 bg-[#121316] p-1.5 shadow-2xl shadow-black/50">
          <Link
            href={`/bets/${betId}`}
            role="menuitem"
            className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-zinc-200 transition hover:bg-white/[.06]"
            onClick={() => setOpen(false)}
          >
            <Pencil className="size-3.5 text-zinc-500" />
            Edit
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={deleting}
            onClick={remove}
            className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            {confirming ? "Confirm delete" : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}

export function BetsTable({ bets }: { bets: BetListItem[] }) {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [currency, setCurrency] = useState("all");

  const filtered = useMemo(
    () =>
      bets.filter(
        (bet) =>
          !deletedIds.has(bet.id) &&
          (!search || `${bet.bookmaker} ${bet.externalBetId}`.toLowerCase().includes(search.toLowerCase())) &&
          (status === "all" || bet.status === status) &&
          (type === "all" || bet.betType === type) &&
          (currency === "all" || bet.currency === currency),
      ),
    [bets, deletedIds, search, status, type, currency],
  );

  return (
    <>
      <Card className="mt-6 p-2.5">
        <div className="grid gap-2 md:grid-cols-[1fr_repeat(3,150px)]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookmaker or Bet ID" className="pl-10" />
          </div>
          <Select aria-label="Status filter" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {["won", "lost", "void", "cashout"].map((item) => (
              <option key={item} value={item}>{titleCase(item)}</option>
            ))}
          </Select>
          <Select aria-label="Bet type filter" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All bet types</option>
            {["single", "accumulator", "bet_builder"].map((item) => (
              <option key={item} value={item}>{titleCase(item)}</option>
            ))}
          </Select>
          <Select aria-label="Currency filter" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="all">All currencies</option>
            {[...new Set(bets.map((bet) => bet.currency))].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </div>
      </Card>
      <Card className="mt-4 overflow-hidden">
        <div className="hidden grid-cols-[1.2fr_1fr_.7fr_.7fr_.7fr_.7fr_.8fr_48px] gap-3 border-b border-white/[.07] px-5 py-3 text-[10px] font-bold uppercase tracking-[.11em] text-zinc-600 md:grid">
          <span>Bookmaker</span>
          <span>Bet</span>
          <span>Stake</span>
          <span>Odds</span>
          <span>Status</span>
          <span>P&amp;L</span>
          <span>Placed</span>
          <span className="text-right">Actions</span>
        </div>
        {filtered.length ? (
          <div className="divide-y divide-white/[.06]">
            {filtered.map((bet) => (
              <div
                key={bet.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 transition hover:bg-white/[.025] md:grid-cols-[1.2fr_1fr_.7fr_.7fr_.7fr_.7fr_.8fr_48px]"
              >
                <Link href={`/bets/${bet.id}`} className="min-w-0">
                  <p className="text-sm font-semibold">{bet.bookmaker}</p>
                  <p className="mt-1 text-[11px] text-zinc-600">{bet.externalBetId ?? "No Bet ID"}</p>
                </Link>
                <Link href={`/bets/${bet.id}`} className="hidden text-xs text-zinc-400 md:block">{titleCase(bet.betType)}</Link>
                <Link href={`/bets/${bet.id}`} className="hidden text-xs text-zinc-400 md:block">{formatMoney(bet.cashStake, bet.currency)}</Link>
                <Link href={`/bets/${bet.id}`} className="hidden text-xs text-zinc-400 md:block">{bet.odds?.toFixed(2) ?? "—"}</Link>
                <Link href={`/bets/${bet.id}`} className="hidden text-xs md:block">
                  <span className={`rounded-full px-2 py-1 ${bet.status === "won" ? "bg-emerald-400/10 text-emerald-300" : bet.status === "lost" ? "bg-rose-400/10 text-rose-300" : "bg-white/[.05] text-zinc-400"}`}>
                    {titleCase(bet.status)}
                  </span>
                </Link>
                <Link href={`/bets/${bet.id}`} className={`text-sm font-semibold md:text-xs ${bet.pnl > 0 ? "text-emerald-300" : bet.pnl < 0 ? "text-rose-300" : "text-zinc-400"}`}>
                  {formatMoney(bet.pnl, bet.currency, true)}
                </Link>
                <Link href={`/bets/${bet.id}`} className="hidden text-xs text-zinc-500 md:block">{formatDisplayDate(bet.placedAt)}</Link>
                <div className="flex justify-end">
                  <RowActions betId={bet.id} onDeleted={(id) => setDeletedIds((current) => new Set(current).add(id))} />
                </div>
                <Link href={`/bets/${bet.id}`} className="col-span-2 flex gap-2 text-[11px] text-zinc-600 md:hidden">
                  <span>{titleCase(bet.betType)}</span>
                  <span>·</span>
                  <span>{formatMoney(bet.cashStake, bet.currency)}</span>
                  <span>·</span>
                  <span>{titleCase(bet.status)}</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-20 text-center">
            <SlidersHorizontal className="mx-auto size-6 text-zinc-700" />
            <p className="mt-4 font-semibold">No bets match these filters.</p>
            <p className="mt-2 text-sm text-zinc-600">Try widening your search.</p>
          </div>
        )}
      </Card>
    </>
  );
}
