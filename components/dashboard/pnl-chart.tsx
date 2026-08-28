"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";

const POSITIVE = "#34d399"; // emerald-400
const NEGATIVE = "#fca5a5"; // red-300

/** Compact axis labels so NGN / large values don't clip on narrow charts. */
function formatYAxisTick(value: number) {
  if (value === 0) return "0";
  const sign = value < 0 ? "−" : "+";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}m`;
  if (abs >= 10_000) return `${sign}${Math.round(abs / 1_000)}k`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${Math.round(abs)}`;
}

export function PnlChart({
  data,
  currency,
}: {
  data: Array<{ date: string; cumulative: number }>;
  currency: string;
}) {
  const latest = data.length ? data[data.length - 1]!.cumulative : 0;
  const positive = latest >= 0;
  const color = positive ? POSITIVE : NEGATIVE;
  const gradientId = positive ? "pnlFillUp" : "pnlFillDown";

  return (
    <div className="h-52 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickFormatter={(value) => formatDisplayDate(String(value), "d MMM")}
            minTickGap={24}
          />
          <YAxis
            width={44}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip
            cursor={{ stroke: positive ? "rgba(52,211,153,.28)" : "rgba(252,165,165,.28)" }}
            contentStyle={{
              background: "#17181b",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(value) => formatDisplayDate(String(value))}
            formatter={(value) => [formatMoney(Number(value), currency, true), "Cumulative P&L"]}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
