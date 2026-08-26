"use client";

import { useEffect, useId, useRef, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputClass } from "@/components/ui/field";

function parseValue(value: string) {
  if (!value) return null;
  try {
    const date = parseISO(value.length === 10 ? `${value}T12:00:00` : value);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Select date",
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
}) {
  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => selected ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (selected) setMonth(selected);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        className={cn(inputClass, "flex items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50")}
      >
        <span className={selected ? "text-white" : "text-zinc-600"}>
          {selected ? format(selected, "dd MMM yyyy") : placeholder}
        </span>
        <CalendarDays className="size-4 shrink-0 text-zinc-500" />
      </button>

      {open && !disabled && (
        <div
          id={listId}
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-2xl border border-white/10 bg-[#121316] p-3 shadow-2xl shadow-black/50"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <button type="button" className="grid size-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/[.06] hover:text-white" onClick={() => setMonth((current) => addMonths(current, -1))} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-semibold text-zinc-100">{format(month, "MMMM yyyy")}</p>
            <button type="button" className="grid size-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/[.06] hover:text-white" onClick={() => setMonth((current) => addMonths(current, 1))} aria-label="Next month">
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 px-1 text-center text-[10px] font-semibold uppercase tracking-[.08em] text-zinc-600">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = isSameMonth(day, month);
              const isSelected = selected ? isSameDay(day, selected) : false;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    onChange(format(day, "yyyy-MM-dd"));
                    setOpen(false);
                  }}
                  className={cn(
                    "grid h-9 place-items-center rounded-lg text-sm transition",
                    !inMonth && "text-zinc-700",
                    inMonth && !isSelected && "text-zinc-200 hover:bg-white/[.07]",
                    isSelected && "bg-white font-semibold text-zinc-950 hover:bg-white",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/[.06] pt-3">
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-white/[.05] hover:text-zinc-300"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-300 transition hover:bg-white/[.06] hover:text-white"
              onClick={() => {
                onChange(format(new Date(), "yyyy-MM-dd"));
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
