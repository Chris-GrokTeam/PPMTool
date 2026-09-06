import { formatDate, parseISODate, todayISO } from "@/lib/dates";
import {
  buildRange,
  fiscalYearSegments,
  monthSegments,
  pct,
  quarterSegments,
  type AxisSegment,
  type TimelineRange,
} from "@/lib/timeline";

export type GanttMilestone = { date: string; title: string };

export type GanttBar = {
  start: string;
  end: string;
  className: string;
  percentComplete?: number;
  isMilestone?: boolean;
  milestones?: GanttMilestone[];
};

export function ganttRangeFrom(dates: string[]): TimelineRange {
  return buildRange(dates);
}

export function GanttHeader({
  range,
  bands = "months",
}: {
  range: TimelineRange;
  bands?: "months" | "fiscal";
}) {
  const months = monthSegments(range);
  const todayLeft = pct(parseISODate(todayISO()), range);

  if (bands === "fiscal") {
    const years = fiscalYearSegments(range);
    const quarters = quarterSegments(range);
    return (
      <div className="pointer-events-none relative bg-slate-50 text-xs font-normal tracking-normal text-slate-600 normal-case">
        <AxisRow
          segments={years}
          className="h-5"
          textClass="text-[11px] font-medium text-slate-700"
          minWidth={6}
        />
        <AxisRow
          segments={quarters}
          className="h-5 border-t border-slate-200"
          textClass="text-[10px] text-slate-600"
          minWidth={4.5}
        />
        <AxisRow
          segments={months}
          className="h-6 border-t border-slate-200 bg-white"
          textClass="text-[11px] text-slate-600"
          minWidth={2}
        />
        <TodayMarker left={todayLeft} withLabel />
      </div>
    );
  }

  return (
    <div className="pointer-events-none relative h-8 bg-slate-50 text-xs text-slate-600">
      {months.map((month) => (
        <div
          key={`${month.label}-${month.left}`}
          className="absolute top-0 flex h-full items-center overflow-hidden border-l border-slate-200 px-1.5"
          style={{ left: `${month.left}%`, width: `${month.width}%` }}
        >
          {month.label}
        </div>
      ))}
      <TodayMarker left={todayLeft} withLabel />
    </div>
  );
}

function AxisRow({
  segments,
  className,
  textClass,
  minWidth,
}: {
  segments: AxisSegment[];
  className: string;
  textClass: string;
  minWidth: number;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {segments.map((segment) => (
        <div
          key={`${segment.label}-${segment.left}`}
          className={`absolute top-0 flex h-full items-center overflow-hidden border-l border-slate-200 px-1 ${textClass}`}
          style={{ left: `${segment.left}%`, width: `${segment.width}%` }}
        >
          {segment.width >= minWidth ? segment.label : ""}
        </div>
      ))}
    </div>
  );
}

export function GanttTrack({ range, bar }: { range: TimelineRange; bar: GanttBar }) {
  const todayLeft = pct(parseISODate(todayISO()), range);
  const start = pct(parseISODate(bar.start), range);
  const end = pct(parseISODate(bar.end), range);
  const width = Math.max(end - start, 0.8);
  const barTitle =
    bar.percentComplete != null
      ? `${formatDate(bar.start)} – ${formatDate(bar.end)} · ${bar.percentComplete}%`
      : `${formatDate(bar.start)} – ${formatDate(bar.end)}`;

  return (
    <div className="relative h-full min-h-11 border-b border-slate-100 bg-white">
      <TodayMarker left={todayLeft} />
      {bar.isMilestone ? (
        <Diamond left={start} title={barTitle} className={bar.className} />
      ) : (
        <div
          className={`absolute top-1/2 z-[1] h-5 -translate-y-1/2 rounded-sm ${bar.className}`}
          style={{ left: `${start}%`, width: `${width}%` }}
          title={barTitle}
        >
          {bar.percentComplete != null && bar.percentComplete > 0 ? (
            <div
              className="h-full rounded-sm bg-black/20"
              style={{ width: `${bar.percentComplete}%` }}
            />
          ) : null}
        </div>
      )}
      {(bar.milestones ?? []).map((milestone) => (
        <Diamond
          key={`${milestone.date}-${milestone.title}`}
          left={pct(parseISODate(milestone.date), range)}
          title={milestone.title}
          className="bg-slate-900"
        />
      ))}
    </div>
  );
}

export function TodayMarker({ left, withLabel }: { left: number; withLabel?: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute top-0 z-10 h-full w-px bg-red-500"
        style={{ left: `${left}%` }}
      />
      {withLabel ? (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wide text-red-600"
          style={{ left: `${left}%` }}
        >
          Today
        </div>
      ) : null}
    </>
  );
}

export function Diamond({
  left,
  title,
  className,
}: {
  left: number;
  title: string;
  className: string;
}) {
  return (
    <div
      title={title}
      className={`absolute top-1/2 z-[1] h-3.5 w-3.5 -translate-y-1/2 rotate-45 ${className}`}
      style={{ left: `calc(${left}% - 7px)` }}
    />
  );
}
