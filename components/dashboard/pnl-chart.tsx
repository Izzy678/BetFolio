"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PnlChart({
  data,
  currency,
  compact = false,
  className,
}: {
  data: Array<{ date: string; cumulative: number }>;
  currency: string;
  compact?: boolean;
  className?: string;
}) {
  const gradientId = `pnl-${useId().replace(/:/g, "")}`;
  const positive = (data.at(-1)?.cumulative ?? 0) >= 0;
  const stroke = positive ? "#34d399" : "#fb7185";

  return (
    <div className={cn(compact ? "h-full w-full" : "h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: compact ? 0 : 8, bottom: 0, left: compact ? 0 : -18 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.24} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.045)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#5f5f69", fontSize: compact ? 9 : 10 }}
            tickFormatter={(value) => formatDisplayDate(String(value), compact ? "d MMM" : "d MMM")}
            minTickGap={compact ? 42 : 30}
          />
          {!compact && (
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#5f5f69", fontSize: 10 }}
              tickFormatter={(value) => `${value >= 0 ? "+" : ""}${Math.round(value)}`}
            />
          )}
          <Tooltip
            cursor={{ stroke: "rgba(167,139,250,.28)", strokeDasharray: "3 3" }}
            contentStyle={{ background: "#15151b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 11, boxShadow: "0 16px 40px rgba(0,0,0,.35)" }}
            labelStyle={{ color: "#8b8b96", marginBottom: 4 }}
            labelFormatter={(value) => formatDisplayDate(String(value))}
            formatter={(value) => [formatMoney(Number(value), currency, true), "Cumulative P&L"]}
          />
          <Area type="monotone" dataKey="cumulative" stroke={stroke} strokeWidth={2} fill={`url(#${gradientId})`} activeDot={{ r: 3, fill: stroke, stroke: "#0c0c10", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
