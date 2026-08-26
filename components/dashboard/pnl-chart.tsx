"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";

const POSITIVE = "#34d399"; // emerald-400
const NEGATIVE = "#fca5a5"; // red-300

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
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -28 }}>
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
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickFormatter={(value) => `${value >= 0 ? "+" : ""}${Math.round(value)}`}
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
