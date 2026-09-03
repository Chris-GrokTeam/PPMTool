"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type CSSProperties,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";
import { GanttHeader, GanttTrack, type GanttMilestone } from "@/components/Gantt";
import { ProjectStatusPill } from "@/components/StatusPill";
import { fromISORange, type TimelineRangeISO } from "@/lib/timeline";
import { projectBarClass } from "@/lib/status";
import type { Project } from "@/lib/types";

const DATA_COLS = ["project", "status", "risks", "issues"] as const;
type DataColId = (typeof DATA_COLS)[number];

const DEFAULT_WIDTHS: Record<DataColId, number> = {
  project: 280,
  status: 120,
  risks: 80,
  issues: 80,
};

const MIN_WIDTHS: Record<DataColId, number> = {
  project: 160,
  status: 100,
  risks: 64,
  issues: 64,
};

const GANTT_MIN = 380;
const STORAGE_KEY = "ppm-home-layout-v2";

export type PortfolioRow = Project & { milestones: GanttMilestone[] };

function clampWidths(input?: Partial<Record<DataColId, unknown>>): Record<DataColId, number> {
  const next = { ...DEFAULT_WIDTHS };
  for (const col of DATA_COLS) {
    const n = Number(input?.[col]);
    next[col] = Number.isFinite(n)
      ? Math.max(MIN_WIDTHS[col], Math.round(n))
      : DEFAULT_WIDTHS[col];
  }
  return next;
}

function loadLayout(): { widths: Record<DataColId, number>; wrap: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { widths: { ...DEFAULT_WIDTHS }, wrap: false };
    const parsed = JSON.parse(raw) as {
      widths?: Partial<Record<DataColId, unknown>>;
      wrap?: boolean;
    };
    return { wrap: Boolean(parsed.wrap), widths: clampWidths(parsed.widths) };
  } catch {
    return { widths: { ...DEFAULT_WIDTHS }, wrap: false };
  }
}

function saveLayout(layout: { widths: Record<DataColId, number>; wrap: boolean }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    /* ignore quota / private mode */
  }
}

function dataBox(width: number): CSSProperties {
  return { width, minWidth: width, maxWidth: width };
}

export function PortfolioGantt({
  projects,
  rangeISO,
}: {
  projects: PortfolioRow[];
  rangeISO: TimelineRangeISO;
}) {
  const range = fromISORange(rangeISO);
  const [widths, setWidths] = useState<Record<DataColId, number>>(DEFAULT_WIDTHS);
  const [wrap, setWrap] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const layout = loadLayout();
    setWidths(layout.widths);
    setWrap(layout.wrap);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLayout({ widths, wrap });
  }, [ready, widths, wrap]);

  const dataWidth = DATA_COLS.reduce((sum, col) => sum + widths[col], 0);
  const sheetMin = dataWidth + GANTT_MIN;
  const columns = `${widths.project}px ${widths.status}px ${widths.risks}px ${widths.issues}px minmax(${GANTT_MIN}px, 1fr)`;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-slate-900">Home</h1>
        <button
          type="button"
          onClick={() => setWrap((value) => !value)}
          className={`rounded border px-2 py-1 text-xs font-medium ${
            wrap
              ? "border-sky-700 bg-sky-50 text-sky-900"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          title="Wrap text wraps the project name. Status and counts stay on one line."
        >
          Wrap text {wrap ? "on" : "off"}
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <div style={{ minWidth: sheetMin }}>
          <div
            className="grid items-stretch bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500"
            style={{ gridTemplateColumns: columns }}
          >
            <HeaderCell label="Project" col="project" widths={widths} setWidths={setWidths} />
            <HeaderCell label="Status" col="status" widths={widths} setWidths={setWidths} />
            <HeaderCell label="Risks" col="risks" widths={widths} setWidths={setWidths} />
            <HeaderCell label="Issues" col="issues" widths={widths} setWidths={setWidths} />
            <div className="min-w-0 border-b border-l border-slate-200">
              <GanttHeader range={range} bands="fiscal" />
            </div>
          </div>
          {projects.map((project) => (
            <div
              key={project.id}
              className="grid items-stretch text-sm"
              style={{ gridTemplateColumns: columns }}
            >
              <div
                className="min-w-0 overflow-hidden border-b border-r border-slate-100 px-2 py-1.5"
                style={dataBox(widths.project)}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className={`block min-w-0 font-medium text-sky-800 hover:underline ${
                    wrap
                      ? "whitespace-normal break-words leading-snug"
                      : "truncate overflow-hidden"
                  }`}
                  title={project.name}
                >
                  {project.name}
                </Link>
              </div>
              <div
                className="min-w-0 overflow-hidden border-b border-r border-slate-100 px-2 py-1.5"
                style={dataBox(widths.status)}
              >
                <div className="whitespace-nowrap">
                  <ProjectStatusPill status={project.status} />
                </div>
              </div>
              <div
                className="min-w-0 overflow-hidden border-b border-r border-slate-100 px-2 py-1.5 text-right tabular-nums"
                style={dataBox(widths.risks)}
              >
                <Link
                  href={`/projects/${project.id}#risks-and-issues`}
                  className="whitespace-nowrap text-sky-800 hover:underline"
                >
                  {project.open_risks}
                </Link>
              </div>
              <div
                className="min-w-0 overflow-hidden border-b border-slate-100 px-2 py-1.5 text-right tabular-nums"
                style={dataBox(widths.issues)}
              >
                <Link
                  href={`/projects/${project.id}#risks-and-issues`}
                  className="whitespace-nowrap text-sky-800 hover:underline"
                >
                  {project.open_issues}
                </Link>
              </div>
              <div className="min-w-0 border-b border-l border-slate-100">
                <GanttTrack
                  range={range}
                  bar={{
                    start: project.start_date,
                    end: project.end_date,
                    className: projectBarClass[project.status],
                    milestones: project.milestones,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function HeaderCell({
  label,
  col,
  widths,
  setWidths,
}: {
  label: string;
  col: DataColId;
  widths: Record<DataColId, number>;
  setWidths: Dispatch<SetStateAction<Record<DataColId, number>>>;
}) {
  return (
    <div
      className="relative flex min-w-0 items-end overflow-hidden border-b border-r border-slate-200 px-2 py-2 select-none"
      style={dataBox(widths[col])}
    >
      {label}
      <ResizeHandle col={col} widths={widths} setWidths={setWidths} />
    </div>
  );
}

function ResizeHandle({
  col,
  widths,
  setWidths,
}: {
  col: DataColId;
  widths: Record<DataColId, number>;
  setWidths: Dispatch<SetStateAction<Record<DataColId, number>>>;
}) {
  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const originX = event.clientX;
    const originWidth = widths[col];

    const onMove = (moveEvent: PointerEvent) => {
      const next = Math.max(MIN_WIDTHS[col], originWidth + (moveEvent.clientX - originX));
      setWidths((current) => ({ ...current, [col]: next }));
    };
    const onEnd = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.removeProperty("-webkit-user-select");
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.body.style.setProperty("-webkit-user-select", "none");
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  }

  return (
    <button
      type="button"
      aria-label={`Resize ${col} column`}
      className="absolute top-0 right-0 z-20 h-full w-4 cursor-col-resize touch-none select-none hover:bg-sky-500/40"
      onPointerDown={onPointerDown}
    />
  );
}
