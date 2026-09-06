"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import { GanttHeader, TodayMarker } from "@/components/Gantt";
import { addDays, compareISODate, formatDate, parseISODate, todayISO } from "@/lib/dates";
import {
  blockIds,
  canIndent,
  canOutdent,
  dropBeforeId,
  dropEdge,
  hasChildren,
  outlineNumbers,
} from "@/lib/outline";
import { personLabel } from "@/lib/people";
import { TASK_STATUSES, taskBarClass, taskStatusLabel } from "@/lib/status";
import { fromISORange, pct, type TimelineRange, type TimelineRangeISO } from "@/lib/timeline";
import type { Task, TaskStatus, User } from "@/lib/types";

const COLS = ["wbs", "task", "assigned", "start", "end", "pct", "status", "gantt"] as const;
type ColId = (typeof COLS)[number];

const DEFAULT_WIDTHS: Record<ColId, number> = {
  wbs: 52,
  task: 280,
  assigned: 200,
  start: 118,
  end: 118,
  pct: 48,
  status: 108,
  gantt: 380,
};

const MIN_WIDTHS: Record<ColId, number> = {
  wbs: 40,
  task: 160,
  assigned: 100,
  start: 88,
  end: 88,
  pct: 36,
  status: 80,
  gantt: 200,
};

const DEFAULT_LEFT_PANE = DEFAULT_WIDTHS.wbs + DEFAULT_WIDTHS.task + 8;
const MIN_LEFT_PANE = 220;
const STORAGE_KEY = "ppm-plan-layout-v3";

type DragState = {
  taskId: number;
  overId: number;
  position: "before" | "after";
};

type LayoutState = {
  widths: Record<ColId, number>;
  wrap: boolean;
  leftPaneWidth: number;
};

function clampWidths(input?: Partial<Record<ColId, unknown>>): Record<ColId, number> {
  const next = { ...DEFAULT_WIDTHS };
  for (const col of COLS) {
    const n = Number(input?.[col]);
    next[col] = Number.isFinite(n)
      ? Math.max(MIN_WIDTHS[col], Math.round(n))
      : DEFAULT_WIDTHS[col];
  }
  return next;
}

function loadLayout(): LayoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("ppm-plan-layout-v2");
    if (!raw) return { widths: { ...DEFAULT_WIDTHS }, wrap: false, leftPaneWidth: DEFAULT_LEFT_PANE };
    const parsed = JSON.parse(raw) as {
      widths?: Partial<Record<ColId, unknown>>;
      wrap?: boolean;
      leftPaneWidth?: unknown;
    };
    const widths = clampWidths(parsed.widths);
    const leftPaneWidth = Number(parsed.leftPaneWidth);
    return {
      wrap: Boolean(parsed.wrap),
      widths,
      leftPaneWidth: Number.isFinite(leftPaneWidth)
        ? Math.max(MIN_LEFT_PANE, Math.round(leftPaneWidth))
        : widths.wbs + widths.task + 8,
    };
  } catch {
    return { widths: { ...DEFAULT_WIDTHS }, wrap: false, leftPaneWidth: DEFAULT_LEFT_PANE };
  }
}

function saveLayout(layout: LayoutState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    /* ignore quota / private mode */
  }
}

function dataBox(width: number): CSSProperties {
  return { width, minWidth: width, maxWidth: width };
}

function rowChrome(dragging: boolean, dropWhere: "before" | "after" | null, selected: boolean) {
  const dropShadow =
    dropWhere === "before"
      ? "shadow-[inset_0_2px_0_0_#0284c7]"
      : dropWhere === "after"
        ? "shadow-[inset_0_-2px_0_0_#0284c7]"
        : "";
  const bg = dragging ? "bg-sky-50" : selected ? "bg-sky-50/70" : "";
  return `${bg} ${dropShadow}`.trim();
}

export function TaskPlan({
  projectId,
  tasks,
  users,
  rangeISO,
}: {
  projectId: number;
  tasks: Task[];
  users: User[];
  rangeISO: TimelineRangeISO;
}) {
  const range = fromISORange(rangeISO);
  const router = useRouter();
  const [widths, setWidths] = useState<Record<ColId, number>>(DEFAULT_WIDTHS);
  const [wrap, setWrap] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(DEFAULT_LEFT_PANE);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const planRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layout = loadLayout();
    setWidths(layout.widths);
    setWrap(layout.wrap);
    setLeftPaneWidth(layout.leftPaneWidth);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLayout({ widths, wrap, leftPaneWidth });
  }, [ready, widths, wrap, leftPaneWidth]);

  const rightDataWidth = (["assigned", "start", "end", "pct", "status"] as const).reduce(
    (sum, col) => sum + widths[col],
    0
  );
  const ganttMin = Math.max(MIN_WIDTHS.gantt, widths.gantt);
  const rightMinWidth = rightDataWidth + ganttMin;
  const parents = tasks.filter((task) => task.parent_id == null);
  const rows = tasks.map((task) => ({ id: task.id, parent_id: task.parent_id }));
  const numbers = outlineNumbers(rows);

  const beforeId =
    drag != null ? dropBeforeId(rows, drag.taskId, drag.overId, drag.position) : undefined;
  const edge =
    drag != null && beforeId !== undefined ? dropEdge(rows, drag.taskId, beforeId) : null;
  const draggedBlock = drag ? new Set(blockIds(rows, drag.taskId)) : null;

  async function postMove(body: Record<string, unknown>) {
    const response = await fetch("/api/tasks/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) router.refresh();
  }

  return (
    <section id="project-plan">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Project plan</h2>
        <button
          type="button"
          onClick={() => setWrap((value) => !value)}
          className={`rounded border px-2 py-1 text-xs font-medium ${
            wrap
              ? "border-sky-700 bg-sky-50 text-sky-900"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          title="Wrap text wraps the task name and role. Dates stay on one line."
        >
          Wrap text {wrap ? "on" : "off"}
        </button>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div ref={planRootRef} data-plan-root className="overflow-auto">
          <div className="min-w-max">
            <div className="sticky top-0 z-30 flex bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
              <div
                className="sticky left-0 z-40 flex shrink-0 border-r border-slate-200 bg-slate-50"
                style={{ width: leftPaneWidth }}
              >
                <HeaderCell label="#" col="wbs" widths={widths} setWidths={setWidths} />
                <HeaderCell label="Task" col="task" widths={widths} setWidths={setWidths} />
                <PaneSplitter leftPaneWidth={leftPaneWidth} setLeftPaneWidth={setLeftPaneWidth} />
              </div>
              <div className="flex" style={{ minWidth: rightMinWidth }}>
                <HeaderCell label="Assigned" col="assigned" widths={widths} setWidths={setWidths} />
                <HeaderCell label="Start" col="start" widths={widths} setWidths={setWidths} />
                <HeaderCell label="End" col="end" widths={widths} setWidths={setWidths} />
                <HeaderCell label="%" col="pct" widths={widths} setWidths={setWidths} />
                <HeaderCell label="Status" col="status" widths={widths} setWidths={setWidths} />
                <div
                  className="relative border-b border-l border-slate-200 p-0 font-medium"
                  style={{ width: ganttMin, minWidth: ganttMin }}
                >
                  <GanttHeader range={range} />
                  <ResizeHandle col="gantt" widths={widths} setWidths={setWidths} />
                </div>
              </div>
            </div>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                projectId={projectId}
                task={task}
                users={users}
                range={range}
                wrap={wrap}
                widths={widths}
                ganttMin={ganttMin}
                rightMinWidth={rightMinWidth}
                leftPaneWidth={leftPaneWidth}
                wbs={numbers[task.id] ?? ""}
                summary={hasChildren(rows, task.id)}
                indentable={canIndent(rows, task.id)}
                outdentable={canOutdent(rows, task.id)}
                selected={selectedId === task.id}
                dragging={Boolean(draggedBlock?.has(task.id))}
                dropWhere={edge?.taskId === task.id ? edge.where : null}
                planRootRef={planRootRef}
                onSelect={() => setSelectedId(task.id)}
                onIndent={() => void postMove({ taskId: task.id, action: "indent" })}
                onOutdent={() => void postMove({ taskId: task.id, action: "outdent" })}
                onDragOver={(overId, position) => {
                  const next = { taskId: task.id, overId, position };
                  dragRef.current = next;
                  setDrag(next);
                }}
                onDragEnd={(moved) => {
                  const current = dragRef.current;
                  dragRef.current = null;
                  setDrag(null);
                  document.body.style.cursor = "";
                  document.body.style.userSelect = "";
                  document.body.style.removeProperty("-webkit-user-select");
                  if (!moved || !current) return;
                  const nextBefore = dropBeforeId(
                    rows,
                    current.taskId,
                    current.overId,
                    current.position
                  );
                  if (nextBefore === undefined) return;
                  void postMove({
                    taskId: current.taskId,
                    action: "reorder",
                    beforeTaskId: nextBefore,
                  });
                }}
              />
            ))}
          </div>
        </div>
        <AddTaskForm projectId={projectId} users={users} parents={parents} />
        <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
          Left pane is the outline (parent headings vs child tasks). Right pane is schedule and
          Gantt. Drag the handle to reorder — a heading takes its tasks with it. Use → to put a
          task under the heading above, ← to move it back out. Numbers (1, 1.1, 2) update after
          each move. A heading’s dates, %, and status come from the tasks under it. Dates do not
          reorder the plan. Drag a child Gantt bar to change that task’s dates only. Comments
          opens the thread.
        </p>
      </div>
    </section>
  );
}

function HeaderCell({
  label,
  col,
  widths,
  setWidths,
}: {
  label: string;
  col: Exclude<ColId, "gantt">;
  widths: Record<ColId, number>;
  setWidths: Dispatch<SetStateAction<Record<ColId, number>>>;
}) {
  return (
    <div
      className="relative border-b border-slate-200 px-2 py-2 font-medium select-none"
      style={dataBox(widths[col])}
    >
      {label}
      <ResizeHandle col={col} widths={widths} setWidths={setWidths} />
    </div>
  );
}

function PaneSplitter({
  leftPaneWidth,
  setLeftPaneWidth,
}: {
  leftPaneWidth: number;
  setLeftPaneWidth: Dispatch<SetStateAction<number>>;
}) {
  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const originX = event.clientX;
    const originWidth = leftPaneWidth;
    const onMove = (moveEvent: PointerEvent) => {
      setLeftPaneWidth(Math.max(MIN_LEFT_PANE, originWidth + (moveEvent.clientX - originX)));
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
      aria-label="Resize outline pane"
      title="Drag to resize the outline pane"
      className="absolute top-0 right-0 z-30 h-full w-2 translate-x-1/2 cursor-col-resize touch-none bg-slate-300/80 hover:bg-sky-500"
      onPointerDown={onPointerDown}
    />
  );
}

function ResizeHandle({
  col,
  widths,
  setWidths,
}: {
  col: ColId;
  widths: Record<ColId, number>;
  setWidths: Dispatch<SetStateAction<Record<ColId, number>>>;
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

function TaskRow({
  projectId,
  task,
  users,
  range,
  wrap,
  widths,
  ganttMin,
  rightMinWidth,
  leftPaneWidth,
  wbs,
  summary,
  indentable,
  outdentable,
  selected,
  dragging,
  dropWhere,
  planRootRef,
  onSelect,
  onIndent,
  onOutdent,
  onDragOver,
  onDragEnd,
}: {
  projectId: number;
  task: Task;
  users: User[];
  range: TimelineRange;
  wrap: boolean;
  widths: Record<ColId, number>;
  ganttMin: number;
  rightMinWidth: number;
  leftPaneWidth: number;
  wbs: string;
  summary: boolean;
  indentable: boolean;
  outdentable: boolean;
  selected: boolean;
  dragging: boolean;
  dropWhere: "before" | "after" | null;
  planRootRef: RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onDragOver: (overId: number, position: "before" | "after") => void;
  onDragEnd: (moved: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(task.name);
  const [assigneeId, setAssigneeId] = useState(task.assignee_id);
  const [startDate, setStartDate] = useState(task.start_date);
  const [endDate, setEndDate] = useState(task.end_date);
  const [percent, setPercent] = useState(String(task.percent_complete));
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const isChild = task.parent_id != null;
  const isHeading = !isChild;

  useEffect(() => {
    setName(task.name);
    setAssigneeId(task.assignee_id);
    setStartDate(task.start_date);
    setEndDate(task.end_date);
    setPercent(String(task.percent_complete));
    setStatus(task.status);
  }, [
    task.name,
    task.assignee_id,
    task.start_date,
    task.end_date,
    task.percent_complete,
    task.status,
  ]);

  async function persist(next: {
    name?: string;
    assigneeId?: number;
    startDate?: string;
    endDate?: string;
    percentComplete?: number;
    status?: TaskStatus;
  }) {
    if (next.startDate) setStartDate(next.startDate);
    if (next.endDate) setEndDate(next.endDate);
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task.id,
        name: next.name ?? name,
        assigneeId: next.assigneeId ?? assigneeId,
        startDate: next.startDate ?? startDate,
        endDate: next.endDate ?? endDate,
        percentComplete: next.percentComplete ?? Number(percent),
        status: next.status ?? status,
      }),
    });
    if (response.ok) router.refresh();
  }

  function beginRowDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const originX = event.clientX;
    const originY = event.clientY;
    let moved = false;
    const movingParent = task.parent_id == null;

    const onMove = (moveEvent: PointerEvent) => {
      if (!moved) {
        const dist = Math.hypot(moveEvent.clientX - originX, moveEvent.clientY - originY);
        if (dist < 5) return;
        moved = true;
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        document.body.style.setProperty("-webkit-user-select", "none");
      }
      const hit = document
        .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
        ?.closest("[data-task-id]");
      if (!(hit instanceof HTMLElement)) return;
      const overId = Number(hit.dataset.taskId);
      if (!Number.isFinite(overId)) return;
      if (movingParent) {
        const headId = Number(hit.dataset.blockHead);
        const root = planRootRef.current;
        const blockRows = root
          ? root.querySelectorAll(`[data-block-head="${headId}"]`)
          : [hit];
        const first = blockRows[0];
        const last = blockRows[blockRows.length - 1];
        if (!(first instanceof HTMLElement) || !(last instanceof HTMLElement)) return;
        const top = first.getBoundingClientRect().top;
        const bottom = last.getBoundingClientRect().bottom;
        const position = moveEvent.clientY < (top + bottom) / 2 ? "before" : "after";
        onDragOver(headId, position);
      } else {
        const rect = hit.getBoundingClientRect();
        const position =
          moveEvent.clientY < rect.top + rect.height / 2 ? "before" : "after";
        onDragOver(overId, position);
      }
    };
    const onEnd = (upEvent: PointerEvent) => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
      if (handle.hasPointerCapture(upEvent.pointerId)) {
        handle.releasePointerCapture(upEvent.pointerId);
      }
      onDragEnd(moved);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  }

  const field =
    "w-full rounded border border-transparent bg-transparent px-1 py-0.5 shadow-none outline-hidden appearance-none hover:border-slate-300 focus:border-sky-600";
  const selectField = `${field} bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-width='1.5' d='m4 6 4 4 4-4'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_4px_center] bg-no-repeat pr-4`;
  const dateField = `${field} [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-40`;
  const numberField = `${field} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;
  const indentBtn =
    "h-6 w-6 shrink-0 rounded text-sm text-slate-600 outline-hidden hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30";
  const chrome = rowChrome(dragging, dropWhere, selected);
  const leftBand = isHeading
    ? selected || dragging
      ? "bg-slate-100"
      : "bg-slate-50"
    : selected || dragging
      ? "bg-sky-50/70"
      : "bg-white";

  return (
    <div
      data-task-id={task.id}
      data-block-head={task.parent_id ?? task.id}
      className={`flex border-b border-slate-100 ${chrome}`}
      onMouseDown={onSelect}
    >
      <div
        className={`sticky left-0 z-20 flex shrink-0 border-r border-slate-200 ${leftBand}`}
        style={{ width: leftPaneWidth }}
      >
        <div
          className="border-r border-slate-100 px-2 py-1.5 font-mono text-xs whitespace-nowrap tabular-nums text-slate-500"
          style={dataBox(widths.wbs)}
        >
          {wbs}
        </div>
        <div className="min-w-0 flex-1 px-2 py-1.5" style={{ maxWidth: widths.task + 40 }}>
          <div className="flex items-start gap-0.5" style={{ paddingLeft: isChild ? 8 : 0 }}>
            {isChild ? (
              <span
                className="mt-1.5 mr-1 w-3 shrink-0 text-slate-400"
                aria-hidden="true"
                title="Child task"
              >
                └
              </span>
            ) : (
              <span
                className="mt-1.5 mr-1 w-3 shrink-0 text-slate-500"
                aria-hidden="true"
                title="Heading"
              >
                ▾
              </span>
            )}
            <button
              type="button"
              aria-label="Drag to reorder"
              title="Drag to reorder"
              className="mt-0.5 flex h-6 w-4 shrink-0 cursor-grab touch-none items-center justify-center text-slate-400 outline-hidden hover:text-slate-700 active:cursor-grabbing"
              onPointerDown={beginRowDrag}
            >
              <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
                <circle cx="3" cy="3" r="1.2" fill="currentColor" />
                <circle cx="7" cy="3" r="1.2" fill="currentColor" />
                <circle cx="3" cy="8" r="1.2" fill="currentColor" />
                <circle cx="7" cy="8" r="1.2" fill="currentColor" />
                <circle cx="3" cy="13" r="1.2" fill="currentColor" />
                <circle cx="7" cy="13" r="1.2" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Outdent"
              title="Move out from under the heading"
              disabled={!outdentable}
              className={indentBtn}
              onClick={onOutdent}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Indent"
              title="Place under the heading above"
              disabled={!indentable}
              className={indentBtn}
              onClick={onIndent}
            >
              →
            </button>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onFocus={onSelect}
              onBlur={() => {
                if (name.trim() && name.trim() !== task.name) void persist({ name: name.trim() });
              }}
              className={`${field} ${wrap ? "" : "truncate"} ${
                isChild ? "font-medium text-slate-800" : "font-semibold text-slate-900"
              }`}
              aria-label="Task name"
            />
          </div>
          <div className={`mt-1 flex flex-wrap items-center gap-2 ${isChild ? "pl-20" : "pl-16"}`}>
            <Link
              href={`/projects/${projectId}/tasks/${task.id}`}
              className="text-[11px] text-sky-800 hover:underline"
            >
              Comments
            </Link>
            {isHeading && summary ? (
              <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                Heading
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex" style={{ minWidth: rightMinWidth }}>
        <div className="border-r border-slate-100 px-2 py-1.5" style={dataBox(widths.assigned)}>
          <select
            value={assigneeId}
            onChange={(event) => {
              const next = Number(event.target.value);
              setAssigneeId(next);
              void persist({ assigneeId: next });
            }}
            onFocus={onSelect}
            className={`${selectField} text-xs`}
            aria-label="Assigned"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {personLabel(user.name, user.role)}
              </option>
            ))}
          </select>
        </div>
        <div className="border-r border-slate-100 px-2 py-1.5" style={dataBox(widths.start)}>
          {summary ? (
            <span
              className="block px-1 py-0.5 text-xs whitespace-nowrap text-slate-700"
              title="Start comes from the earliest task under this heading"
            >
              {formatDate(startDate)}
            </span>
          ) : (
            <input
              type="date"
              value={startDate}
              onChange={(event) => void persist({ startDate: event.target.value })}
              onFocus={onSelect}
              className={`${dateField} text-xs`}
              aria-label="Start date"
            />
          )}
        </div>
        <div className="border-r border-slate-100 px-2 py-1.5" style={dataBox(widths.end)}>
          {summary ? (
            <span
              className="block px-1 py-0.5 text-xs whitespace-nowrap text-slate-700"
              title="End comes from the latest task under this heading"
            >
              {formatDate(endDate)}
            </span>
          ) : (
            <input
              type="date"
              value={endDate}
              onChange={(event) => void persist({ endDate: event.target.value })}
              onFocus={onSelect}
              className={`${dateField} text-xs`}
              aria-label="End date"
            />
          )}
        </div>
        <div className="border-r border-slate-100 px-2 py-1.5" style={dataBox(widths.pct)}>
          {summary ? (
            <span
              className="block px-1 py-0.5 text-xs text-slate-700"
              title="Percent comes from the tasks under this heading"
            >
              {percent}
            </span>
          ) : (
            <input
              type="number"
              min={0}
              max={100}
              value={percent}
              onChange={(event) => setPercent(event.target.value)}
              onFocus={onSelect}
              onBlur={() => {
                const value = Math.min(100, Math.max(0, Number(percent) || 0));
                setPercent(String(value));
                if (value !== task.percent_complete) void persist({ percentComplete: value });
              }}
              className={`${numberField} text-xs`}
              aria-label="Percent complete"
            />
          )}
        </div>
        <div className="border-r border-slate-100 px-2 py-1.5" style={dataBox(widths.status)}>
          {summary ? (
            <span
              className="block px-1 py-0.5 text-xs text-slate-700"
              title="Status comes from the tasks under this heading"
            >
              {taskStatusLabel[status]}
            </span>
          ) : (
            <select
              value={status}
              onChange={(event) => {
                const next = event.target.value as TaskStatus;
                setStatus(next);
                void persist({ status: next });
              }}
              onFocus={onSelect}
              className={`${selectField} text-xs`}
              aria-label="Status"
            >
              {TASK_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {taskStatusLabel[value]}
                </option>
              ))}
            </select>
          )}
        </div>
        <div
          className="relative border-l border-slate-100 p-0"
          style={{ width: ganttMin, minWidth: ganttMin }}
        >
          <EditableBar
            range={range}
            startDate={startDate}
            endDate={endDate}
            className={taskBarClass[status]}
            percentComplete={Number(percent) || 0}
            isMilestone={!summary && status === "milestone"}
            locked={summary}
            onCommit={(nextStart, nextEnd) => {
              void persist({ startDate: nextStart, endDate: nextEnd });
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AddTaskForm({
  projectId,
  users,
  parents,
}: {
  projectId: number;
  users: User[];
  parents: Task[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const parentRaw = String(data.get("parentId") ?? "");
    const response = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        name: String(data.get("name") ?? ""),
        assigneeId: Number(data.get("assigneeId")),
        startDate: String(data.get("startDate")),
        endDate: String(data.get("endDate")),
        percentComplete: Number(data.get("percentComplete") ?? 0),
        status: String(data.get("status")),
        parentId: parentRaw === "" ? null : Number(parentRaw),
      }),
    });
    if (response.ok) {
      setName("");
      form.reset();
      router.refresh();
    }
  }

  const box =
    "rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-none outline-hidden appearance-none focus:border-sky-600";

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="add-task-form grid gap-2 border-t border-slate-200 bg-slate-50 p-3 md:grid-cols-[1.4fr_1fr_7.5rem_7.5rem_4rem_8rem_1fr_auto] md:items-end"
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        New task
        <input name="name" required value={name} onChange={(e) => setName(e.target.value)} className={box} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Assigned
        <select name="assigneeId" required className={box} defaultValue={users[0]?.id}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {personLabel(user.name, user.role)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Start
        <input name="startDate" type="date" required className={box} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        End
        <input name="endDate" type="date" required className={box} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        %
        <input name="percentComplete" type="number" min={0} max={100} defaultValue={0} className={box} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Status
        <select name="status" className={box} defaultValue="not_started">
          {TASK_STATUSES.map((value) => (
            <option key={value} value={value}>
              {taskStatusLabel[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Parent
        <select name="parentId" className={box} defaultValue="">
          <option value="">Top level</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded bg-[#1b365d] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#16325c]"
      >
        Add task
      </button>
    </form>
  );
}

type DragMode = "move" | "start" | "end";

function EditableBar({
  range,
  startDate,
  endDate,
  className,
  percentComplete,
  isMilestone,
  locked,
  onCommit,
}: {
  range: TimelineRange;
  startDate: string;
  endDate: string;
  className: string;
  percentComplete: number;
  isMilestone: boolean;
  locked?: boolean;
  onCommit: (start: string, end: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState({ start: startDate, end: endDate });

  useEffect(() => {
    setLive({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const todayLeft = pct(parseISODate(todayISO()), range);
  const left = pct(parseISODate(live.start), range);
  const right = pct(parseISODate(live.end), range);
  const width = Math.max(right - left, 0.8);

  function daysFromPointer(clientX: number, originX: number) {
    const widthPx = trackRef.current?.getBoundingClientRect().width ?? 1;
    const totalDays =
      (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24);
    return Math.round(((clientX - originX) / widthPx) * totalDays);
  }

  function preview(mode: DragMode, originStart: string, originEnd: string, days: number) {
    if (isMilestone || mode === "move") {
      const start = addDays(originStart, days);
      const end = isMilestone ? start : addDays(originEnd, days);
      return { start, end };
    }
    if (mode === "start") {
      let start = addDays(originStart, days);
      if (compareISODate(start, originEnd) > 0) start = originEnd;
      return { start, end: originEnd };
    }
    let end = addDays(originEnd, days);
    if (compareISODate(end, originStart) < 0) end = originStart;
    return { start: originStart, end };
  }

  function beginDrag(event: ReactPointerEvent, mode: DragMode) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const origin = {
      mode,
      originX: event.clientX,
      start: live.start,
      end: live.end,
    };
    const onMove = (moveEvent: PointerEvent) => {
      const days = daysFromPointer(moveEvent.clientX, origin.originX);
      setLive(preview(origin.mode, origin.start, origin.end, days));
    };
    const onEnd = (upEvent: PointerEvent) => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onEnd);
      target.removeEventListener("pointercancel", onEnd);
      if (target.hasPointerCapture(upEvent.pointerId)) {
        target.releasePointerCapture(upEvent.pointerId);
      }
      const days = daysFromPointer(upEvent.clientX, origin.originX);
      const next = preview(origin.mode, origin.start, origin.end, days);
      setLive(next);
      if (next.start !== origin.start || next.end !== origin.end) {
        onCommit(next.start, next.end);
      }
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onEnd);
    target.addEventListener("pointercancel", onEnd);
  }

  return (
    <div ref={trackRef} className="relative h-10 w-full overflow-hidden">
      <TodayMarker left={todayLeft} />
      {isMilestone ? (
        locked ? (
          <div
            aria-hidden="true"
            title={`${live.start} – ${live.end}`}
            className={`absolute top-3 z-[1] h-3.5 w-3.5 rotate-45 ${className}`}
            style={{ left: `calc(${left}% - 7px)` }}
          />
        ) : (
          <button
            type="button"
            aria-label="Drag milestone date"
            title={live.start}
            className={`absolute top-3 z-[1] h-3.5 w-3.5 rotate-45 cursor-grab touch-none active:cursor-grabbing ${className}`}
            style={{ left: `calc(${left}% - 7px)` }}
            onPointerDown={(event) => beginDrag(event, "move")}
          />
        )
      ) : (
        <div
          className={`absolute top-2.5 z-[1] h-5 rounded-sm ${className} ${
            locked ? "" : "cursor-grab touch-none active:cursor-grabbing"
          }`}
          style={{ left: `${left}%`, width: `${width}%` }}
          title={
            locked
              ? `${formatDate(live.start)} – ${formatDate(live.end)}`
              : "Drag to move. Use the edges to change start or end."
          }
          onPointerDown={locked ? undefined : (event) => beginDrag(event, "move")}
        >
          {percentComplete > 0 ? (
            <div
              className="pointer-events-none h-full rounded-sm bg-black/20"
              style={{ width: `${percentComplete}%` }}
            />
          ) : null}
          {locked ? null : (
            <>
              <button
                type="button"
                aria-label="Change start date"
                className="absolute top-0 left-0 h-full w-2 cursor-ew-resize touch-none bg-black/10"
                onPointerDown={(event) => beginDrag(event, "start")}
              />
              <button
                type="button"
                aria-label="Change end date"
                className="absolute top-0 right-0 h-full w-2 cursor-ew-resize touch-none bg-black/10"
                onPointerDown={(event) => beginDrag(event, "end")}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
