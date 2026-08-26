"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";

export function PnlChart({ data, currency }: { data: Array<{ date: string; cumulative: number }>; currency: string }) {
  return (
    <div className="h-52 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -28 }}>
          <defs>
            <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bef264" stopOpacity={.32} />
              <stop offset="100%" stopColor="#bef264" stopOpacity={0} />
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
            cursor={{ stroke: "rgba(190,242,100,.25)" }}
            contentStyle={{ background: "#17181b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, fontSize: 12 }}
            labelFormatter={(value) => formatDisplayDate(String(value))}
            formatter={(value) => [formatMoney(Number(value), currency, true), "Cumulative P&L"]}
          />
          <Area type="monotone" dataKey="cumulative" stroke="#bef264" strokeWidth={2} fill="url(#pnlFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
