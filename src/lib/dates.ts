/** Parse YYYY-MM-DD as a local calendar date (avoids UTC off-by-one). */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Display format from the product brief: Aug 19, 2026 */
export function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function compareISODate(a: string, b: string): number {
  return parseISODate(a).getTime() - parseISODate(b).getTime();
}

/** Inclusive calendar days. A one-day milestone is 1. */
export function inclusiveDays(start: string, end: string): number {
  const ms = parseISODate(end).getTime() - parseISODate(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

/** Fiscal year starts 1 April and ends 31 March. April 2026 is FY2026-27. */
export function fiscalYearStartYear(date: Date): number {
  return date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
}

export function fiscalYearLabel(startYear: number): string {
  return `FY${startYear}-${String(startYear + 1).slice(-2)}`;
}

export function fiscalQuarter(date: Date): 1 | 2 | 3 | 4 {
  const month = date.getMonth();
  if (month >= 3 && month <= 5) return 1;
  if (month >= 6 && month <= 8) return 2;
  if (month >= 9) return 3;
  return 4;
}

export function startOfFiscalQuarter(date: Date): Date {
  const year = fiscalYearStartYear(date);
  const quarter = fiscalQuarter(date);
  if (quarter === 1) return new Date(year, 3, 1);
  if (quarter === 2) return new Date(year, 6, 1);
  if (quarter === 3) return new Date(year, 9, 1);
  return new Date(year + 1, 0, 1);
}
