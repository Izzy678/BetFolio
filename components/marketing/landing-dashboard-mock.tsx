import { ArrowDownRight, ArrowUpRight, ChevronRight, Plus } from "lucide-react";

/** Cumulative equity path for the landing mock — choppy with a real drawdown. */
const curve = [
  40, 55, 48, 72, 65, 58, 45, 38, 52, 30, 22, 35, 48, 62, 70, 58, 75, 82, 78, 88,
];

const recent = [
  { book: "Atlas Bet", type: "Accumulator", stake: "£25.00", status: "won" as const, pnl: "+£42.50" },
  { book: "Northstand", type: "Single", stake: "£35.00", status: "lost" as const, pnl: "−£35.00" },
  { book: "Atlas Bet", type: "Single", stake: "£20.00", status: "won" as const, pnl: "+£18.20" },
  { book: "Fieldbook", type: "Accumulator", stake: "£15.00", status: "lost" as const, pnl: "−£15.00" },
];

const books = [
  { name: "Atlas Bet", bets: 34, pnl: "+£124.80", pct: 72, loss: false },
  { name: "Northstand", bets: 28, pnl: "+£86.40", pct: 50, loss: false },
  { name: "Fieldbook", bets: 25, pnl: "−£24.80", pct: 18, loss: true },
];

function CurveChart() {
  const w = 320;
  const h = 120;
  const max = Math.max(...curve);
  const min = Math.min(...curve);
  const positive = curve[curve.length - 1]! >= curve[0]!;
  const color = positive ? "#34d399" : "#fca5a5";
  const points = curve
    .map((v, i) => {
      const x = (i / (curve.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;

  return (
    <div className="mt-1 min-w-0 overflow-hidden" aria-hidden="true">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full max-w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="landingPnlFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#landingPnlFill)" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-500">
        <span>12 Jan</span>
        <span>11 Apr</span>
      </div>
    </div>
  );
}

/** Always desktop Overview layout — never reflow. Cropped + faded by the wrapper on small screens. */
function DashboardFrame() {
  return (
    <div className="isolate overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c0e] text-left shadow-[0_40px_100px_rgba(0,0,0,.45)]">
      <div className="flex items-end justify-between gap-3 border-b border-white/[.07] px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">Welcome back, @izzy</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-[-0.04em] text-white">Overview</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-[#131417] px-3 text-xs font-semibold text-zinc-300">
            GBP
          </span>
          <span className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-[#131417] px-3 text-xs font-semibold text-zinc-300">
            90 days
          </span>
          <span className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-bold text-zinc-950">
            <Plus className="size-3.5" />
            Import
          </span>
        </div>
      </div>

      <div className="min-w-0 space-y-3 p-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="relative col-span-2 overflow-hidden rounded-2xl border border-white/[.07] bg-[#121315] p-4">
            <p className="text-xs font-medium text-zinc-500">Net P&amp;L</p>
            <div className="mt-3 flex items-end gap-2">
              <p className="text-4xl font-semibold tracking-[-0.045em] text-emerald-400">+£186.40</p>
              <ArrowUpRight className="mb-1 size-5 text-emerald-400" />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Across 87 settled bets</p>
          </div>
          {(
            [
              ["Cash staked", "£5,820.00", "Cash stake only"],
              ["Total returned", "£6,006.40", "Settlements + refunds"],
              ["ROI", "3.20%", "Net P&L / cash staked"],
              ["Win rate", "48.6%", "Won / won + lost"],
            ] as const
          ).map(([label, value, hint]) => (
            <div key={label} className="min-w-0 overflow-hidden rounded-2xl border border-white/[.07] bg-[#121315] p-4">
              <p className="text-xs font-medium text-zinc-500">{label}</p>
              <p className="mt-3 truncate text-xl font-semibold tracking-[-0.03em] text-white tabular-nums">
                {value}
              </p>
              <p className="mt-2 text-[11px] text-zinc-500">{hint}</p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 grid-cols-[1.7fr_1fr] gap-3">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[.07] bg-[#121315] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">P&amp;L over time</p>
                <p className="mt-0.5 text-xs text-zinc-500">Cumulative settlement ledger</p>
              </div>
              <span className="shrink-0 rounded-lg bg-white/[.04] px-2 py-1 text-[11px] text-zinc-500">GBP</span>
            </div>
            <CurveChart />
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[.07] bg-[#121315] p-5">
            <p className="text-sm font-semibold text-white">By bookmaker</p>
            <p className="mt-0.5 text-xs text-zinc-500">Net P&amp;L, selected period</p>
            <ul className="mt-5 grid gap-4">
              {books.map((row) => (
                <li key={row.name} className="min-w-0">
                  <div className="mb-1.5 flex min-w-0 items-center justify-between gap-3 text-xs">
                    <span className="min-w-0 truncate font-medium text-zinc-300">
                      {row.name} <span className="font-normal text-zinc-500">· {row.bets}</span>
                    </span>
                    <span className={`shrink-0 tabular-nums ${row.loss ? "text-red-300" : "text-emerald-400"}`}>
                      {row.pnl}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[.05]">
                    <div
                      className={`h-full rounded-full ${row.loss ? "bg-red-300/70" : "bg-emerald-400/70"}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[.07] bg-[#121315]">
          <div className="flex items-center justify-between gap-3 border-b border-white/[.07] px-5 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Recent bets</p>
              <p className="mt-0.5 text-xs text-zinc-500">Latest confirmed settlements</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-zinc-500">
              View all <ChevronRight className="size-3.5" />
            </span>
          </div>
          <div className="divide-y divide-white/[.06]">
            {recent.map((bet) => (
              <div
                key={`${bet.book}-${bet.pnl}-${bet.type}`}
                className="grid grid-cols-[minmax(0,1.4fr)_7rem_6.5rem_5.5rem_minmax(6rem,auto)] items-center gap-x-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{bet.book}</p>
                </div>
                <span className="text-xs text-zinc-400">{bet.type}</span>
                <span className="tabular-nums text-xs text-zinc-400">{bet.stake}</span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                  {bet.status === "won" ? (
                    <ArrowUpRight className="size-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="size-3.5 shrink-0 text-red-300" />
                  )}
                  {bet.status === "won" ? "Won" : "Lost"}
                </span>
                <span
                  className={`shrink-0 text-right text-sm font-semibold tabular-nums ${
                    bet.pnl.startsWith("+") ? "text-emerald-400" : "text-red-300"
                  }`}
                >
                  {bet.pnl}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Linear-style product shot: keep a desktop layout at all sizes.
 * On small screens, anchor to the left so Net P&L + chart start stay in view,
 * then fade out to the right and bottom — not a centered crop.
 */
export function LandingDashboardMock() {
  return (
    <div className="relative -mx-4 sm:-mx-8 lg:mx-0">
      <div className="relative h-[min(52vh,440px)] overflow-hidden sm:h-[min(58vh,540px)] lg:h-auto lg:overflow-visible">
        {/* Left-anchored desktop frame; light scale so more of the overview fits */}
        <div className="ml-3 w-[920px] origin-top-left scale-[0.72] sm:ml-4 sm:w-[980px] sm:scale-[0.82] lg:ml-0 lg:w-full lg:scale-100">
          <DashboardFrame />
        </div>

        {/* Soft left edge only — keep the chart start readable */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-[#0b0c0e] to-transparent sm:w-6 lg:w-8 lg:from-[#0b0c0e]/70"
          aria-hidden="true"
        />
        {/* Strong right dissolve — this is the crop Linear leans on */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0b0c0e] via-[#0b0c0e]/85 to-transparent sm:w-28 lg:w-12 lg:via-[#0b0c0e]/50"
          aria-hidden="true"
        />
        {/* Bottom dissolve into the page */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/80 to-transparent sm:h-40 lg:h-20"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
