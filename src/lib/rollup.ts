import { compareISODate, inclusiveDays } from "./dates";
import type { Task, TaskStatus } from "./types";

export type ChildSpan = {
  start_date: string;
  end_date: string;
  percent_complete: number;
  status: TaskStatus;
};

export type ParentRollup = {
  start_date: string;
  end_date: string;
  percent_complete: number;
  status: TaskStatus;
  is_milestone: 0;
};

function progressBucket(child: ChildSpan): "complete" | "not_started" | "in_progress" {
  if (child.status === "complete") return "complete";
  if (child.status === "not_started") return "not_started";
  if (child.status === "milestone") {
    if (child.percent_complete >= 100) return "complete";
    if (child.percent_complete <= 0) return "not_started";
    return "in_progress";
  }
  return "in_progress";
}

export function rollupFromChildren(children: ChildSpan[]): ParentRollup | null {
  if (children.length === 0) return null;

  let start = children[0].start_date;
  let end = children[0].end_date;
  let weighted = 0;
  let daysTotal = 0;
  let allComplete = true;
  let allNotStarted = true;

  for (const child of children) {
    if (compareISODate(child.start_date, start) < 0) start = child.start_date;
    if (compareISODate(child.end_date, end) > 0) end = child.end_date;
    const days = inclusiveDays(child.start_date, child.end_date);
    daysTotal += days;
    weighted += Math.min(100, Math.max(0, child.percent_complete)) * days;
    const bucket = progressBucket(child);
    if (bucket !== "complete") allComplete = false;
    if (bucket !== "not_started") allNotStarted = false;
  }

  const percent_complete = Math.min(100, Math.max(0, Math.round(weighted / daysTotal)));
  const status: TaskStatus = allComplete
    ? "complete"
    : allNotStarted
      ? "not_started"
      : "in_progress";

  return { start_date: start, end_date: end, percent_complete, status, is_milestone: 0 };
}

export function applyParentRollup<T extends Task>(tasks: T[]): T[] {
  const childrenByParent = new Map<number, T[]>();
  for (const task of tasks) {
    if (task.parent_id == null) continue;
    const list = childrenByParent.get(task.parent_id) ?? [];
    list.push(task);
    childrenByParent.set(task.parent_id, list);
  }
  return tasks.map((task) => {
    const children = childrenByParent.get(task.id);
    if (!children?.length) return task;
    const rolled = rollupFromChildren(children);
    if (!rolled) return task;
    return { ...task, ...rolled };
  });
}
