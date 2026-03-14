import type { DateRange } from "../types";

type DatePreset =
  | "today"
  | "yesterday"
  | "last7d"
  | "last30d"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}

function endOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q + 3, 0);
}

export function getDateRange(preset: DatePreset): DateRange {
  const now = new Date();
  const today = startOfDay(now);

  switch (preset) {
    case "today":
      return { from: toISODate(today), to: toISODate(today) };

    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { from: toISODate(y), to: toISODate(y) };
    }

    case "last7d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { from: toISODate(start), to: toISODate(today) };
    }

    case "last30d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { from: toISODate(start), to: toISODate(today) };
    }

    case "thisMonth":
      return { from: toISODate(startOfMonth(today)), to: toISODate(today) };

    case "lastMonth": {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return { from: toISODate(startOfMonth(prev)), to: toISODate(endOfMonth(prev)) };
    }

    case "thisQuarter":
      return { from: toISODate(startOfQuarter(today)), to: toISODate(today) };

    case "lastQuarter": {
      const prev = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      return { from: toISODate(startOfQuarter(prev)), to: toISODate(endOfQuarter(prev)) };
    }
  }
}

export function getPreviousPeriod(range: DateRange): DateRange {
  const from = new Date(range.from);
  const to = new Date(range.to);
  const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - days + 1);
  return { from: toISODate(prevFrom), to: toISODate(prevTo) };
}

export function formatDate(date: string | Date, format: "short" | "medium" | "long" = "medium"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "short":
      return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "2-digit" }).format(d);
    case "medium":
      return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(d);
    case "long":
      return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(d);
  }
}

export function formatDateRange(range: DateRange): string {
  const from = new Date(range.from);
  const to = new Date(range.to);
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();

  if (sameMonth) {
    const fromDay = from.getDate();
    const toFormatted = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(to);
    return `${fromDay} - ${toFormatted}`;
  }

  if (sameYear) {
    const fromFormatted = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(from);
    const toFormatted = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(to);
    return `${fromFormatted} - ${toFormatted}`;
  }

  const fromFormatted = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(from);
  const toFormatted = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(to);
  return `${fromFormatted} - ${toFormatted}`;
}

export function daysInRange(range: DateRange): number {
  const from = new Date(range.from);
  const to = new Date(range.to);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
