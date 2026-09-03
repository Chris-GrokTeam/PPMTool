import {
  fiscalQuarter,
  fiscalYearLabel,
  fiscalYearStartYear,
  parseISODate,
  startOfFiscalQuarter,
  todayISO,
  toISODate,
} from "./dates";

export type TimelineRange = {
  start: Date;
  end: Date;
};

export function buildRange(isoDates: string[]): TimelineRange {
  const dates = isoDates.map(parseISODate);
  dates.push(parseISODate(todayISO()));
  const start = new Date(Math.min(...dates.map((d) => d.getTime())));
  const end = new Date(Math.max(...dates.map((d) => d.getTime())));
  start.setDate(start.getDate() - 3);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

export function pct(date: Date, range: TimelineRange): number {
  const total = range.end.getTime() - range.start.getTime();
  if (total <= 0) return 0;
  const value = ((date.getTime() - range.start.getTime()) / total) * 100;
  return Math.min(100, Math.max(0, value));
}

export type TimelineRangeISO = { start: string; end: string };

export function toISORange(range: TimelineRange): TimelineRangeISO {
  return { start: toISODate(range.start), end: toISODate(range.end) };
}

export function fromISORange(range: TimelineRangeISO): TimelineRange {
  return { start: parseISODate(range.start), end: parseISODate(range.end) };
}

export type AxisSegment = { label: string; left: number; width: number };

function clipSegment(
  start: Date,
  end: Date,
  range: TimelineRange,
  label: string
): AxisSegment | null {
  const clippedStart = new Date(Math.max(start.getTime(), range.start.getTime()));
  const clippedEnd = new Date(Math.min(end.getTime(), range.end.getTime()));
  if (clippedEnd.getTime() <= clippedStart.getTime()) return null;
  const left = pct(clippedStart, range);
  const right = pct(clippedEnd, range);
  return { label, left, width: Math.max(right - left, 0) };
}

export function monthSegments(range: TimelineRange): AxisSegment[] {
  const segments: AxisSegment[] = [];
  const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  while (cursor <= range.end) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const segment = clipSegment(
      cursor,
      monthEnd,
      range,
      cursor.toLocaleDateString("en-US", { month: "short" })
    );
    if (segment) segments.push(segment);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return segments;
}

export function fiscalYearSegments(range: TimelineRange): AxisSegment[] {
  const segments: AxisSegment[] = [];
  const lastYear = fiscalYearStartYear(range.end);
  for (let year = fiscalYearStartYear(range.start); year <= lastYear; year++) {
    const segment = clipSegment(
      new Date(year, 3, 1),
      new Date(year + 1, 3, 1),
      range,
      fiscalYearLabel(year)
    );
    if (segment) segments.push(segment);
  }
  return segments;
}

export function quarterSegments(range: TimelineRange): AxisSegment[] {
  const segments: AxisSegment[] = [];
  const cursor = startOfFiscalQuarter(range.start);
  while (cursor.getTime() < range.end.getTime()) {
    const start = new Date(cursor);
    const end = new Date(cursor);
    end.setMonth(end.getMonth() + 3);
    const segment = clipSegment(start, end, range, `Q${fiscalQuarter(start)}`);
    if (segment) segments.push(segment);
    cursor.setTime(end.getTime());
  }
  return segments;
}
