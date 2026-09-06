import "server-only";
import { revalidatePath } from "next/cache";
import { compareISODate, isISODate } from "./dates";
import {
  flattenBlocks,
  indentRows,
  outdentRows,
  reorderRows,
  toBlocks,
  type OutlineRow,
} from "./outline";
import {
  applyTaskOutline,
  getTask,
  getUser,
  insertTask,
  listTasks,
  nextSortOrder,
  rollupParentFromChildren,
  syncProjectStatus,
  updateTaskFields,
} from "./queries";
import type { TaskStatus } from "./types";

const STATUSES: TaskStatus[] = ["complete", "in_progress", "not_started", "milestone"];

export type SaveTaskInput = {
  taskId: number;
  name?: string;
  assigneeId?: number;
  startDate?: string;
  endDate?: string;
  percentComplete?: number;
  status?: string;
};

function isStatus(value: string): value is TaskStatus {
  return STATUSES.includes(value as TaskStatus);
}

function revalidateTask(projectId: number, taskId: number) {
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
}

function isSummaryHeading(projectId: number, taskId: number): boolean {
  return listTasks(projectId).some((row) => row.parent_id === taskId);
}

export function saveTask(input: SaveTaskInput): { ok: true } | { ok: false; error: string } {
  const task = getTask(input.taskId);
  if (!task) return { ok: false, error: "Task not found" };

  const name = (input.name ?? task.name).trim();
  if (!name) return { ok: false, error: "Task name is required" };

  const assigneeId = input.assigneeId ?? task.assignee_id;
  if (!getUser(assigneeId)) return { ok: false, error: "Unknown assignee" };

  const summary = isSummaryHeading(task.project_id, task.id);

  let startDate = input.startDate ?? task.start_date;
  let endDate = input.endDate ?? task.end_date;
  if (!isISODate(startDate) || !isISODate(endDate)) {
    return { ok: false, error: "Dates must be YYYY-MM-DD" };
  }

  let status = input.status && isStatus(input.status) ? input.status : task.status;
  if (summary) {
    startDate = task.start_date;
    endDate = task.end_date;
    status = task.status === "milestone" ? "in_progress" : task.status;
  }

  const isMilestone = !summary && status === "milestone" ? 1 : 0;
  if (isMilestone) {
    if (input.startDate) endDate = startDate;
    else if (input.endDate) startDate = endDate;
    else endDate = startDate;
  } else if (compareISODate(endDate, startDate) < 0) {
    endDate = startDate;
  }

  let percentComplete = input.percentComplete ?? task.percent_complete;
  if (summary) percentComplete = task.percent_complete;
  if (!Number.isFinite(percentComplete)) percentComplete = task.percent_complete;
  percentComplete = Math.min(100, Math.max(0, Math.round(percentComplete)));

  updateTaskFields({
    id: task.id,
    name,
    assigneeId,
    startDate,
    endDate,
    percentComplete,
    status: isMilestone ? "milestone" : status,
    isMilestone,
  });
  if (summary) {
    rollupParentFromChildren(task.id);
  } else if (task.parent_id != null) {
    rollupParentFromChildren(task.parent_id);
  }
  syncProjectStatus(task.project_id);
  revalidateTask(task.project_id, task.id);
  if (task.parent_id != null) revalidateTask(task.project_id, task.parent_id);
  return { ok: true };
}

export function createTask(input: {
  projectId: number;
  name: string;
  assigneeId: number;
  startDate: string;
  endDate: string;
  percentComplete: number;
  status: string;
  parentId: number | null;
}): { ok: true; id: number } | { ok: false; error: string } {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Task name is required" };
  if (!getUser(input.assigneeId)) return { ok: false, error: "Unknown assignee" };
  if (!isISODate(input.startDate) || !isISODate(input.endDate)) {
    return { ok: false, error: "Dates must be YYYY-MM-DD" };
  }
  if (!isStatus(input.status)) return { ok: false, error: "Invalid status" };
  if (input.parentId != null) {
    const parent = getTask(input.parentId);
    if (!parent || parent.project_id !== input.projectId || parent.parent_id != null) {
      return { ok: false, error: "Invalid parent" };
    }
  }
  const isMilestone = input.status === "milestone" ? 1 : 0;
  const startDate = input.startDate;
  let endDate = input.endDate;
  if (isMilestone) endDate = startDate;
  else if (compareISODate(endDate, startDate) < 0) endDate = startDate;
  const percentComplete = Math.min(100, Math.max(0, Math.round(input.percentComplete)));
  const sortOrder = nextSortOrder(input.projectId);
  const id = insertTask({
    projectId: input.projectId,
    name,
    assigneeId: input.assigneeId,
    startDate,
    endDate,
    percentComplete,
    status: input.status,
    isMilestone,
    parentId: input.parentId,
    sortOrder,
  });
  normalizeOutline(input.projectId);
  if (input.parentId != null) rollupParentFromChildren(input.parentId);
  syncProjectStatus(input.projectId);
  revalidateTask(input.projectId, id);
  if (input.parentId != null) revalidateTask(input.projectId, input.parentId);
  return { ok: true, id };
}

function outlineFromProject(projectId: number): OutlineRow[] {
  return listTasks(projectId).map((task) => ({ id: task.id, parent_id: task.parent_id }));
}

function normalizeOutline(projectId: number) {
  applyTaskOutline(projectId, flattenBlocks(toBlocks(outlineFromProject(projectId))));
}

function writeOutline(
  projectId: number,
  taskId: number,
  next: OutlineRow[] | null,
  error: string
): { ok: true } | { ok: false; error: string } {
  if (!next) return { ok: false, error };
  applyTaskOutline(projectId, next);
  revalidateTask(projectId, taskId);
  return { ok: true };
}

export function reorderTask(
  taskId: number,
  beforeTaskId: number | null
): { ok: true } | { ok: false; error: string } {
  const task = getTask(taskId);
  if (!task) return { ok: false, error: "Task not found" };
  if (beforeTaskId != null) {
    const before = getTask(beforeTaskId);
    if (!before || before.project_id !== task.project_id) {
      return { ok: false, error: "Cannot move there" };
    }
  }
  return writeOutline(
    task.project_id,
    task.id,
    reorderRows(outlineFromProject(task.project_id), task.id, beforeTaskId),
    "Cannot move there"
  );
}

export function indentTask(taskId: number): { ok: true } | { ok: false; error: string } {
  const task = getTask(taskId);
  if (!task) return { ok: false, error: "Task not found" };
  const next = indentRows(outlineFromProject(task.project_id), task.id);
  if (!next) {
    return {
      ok: false,
      error:
        "Cannot indent. Place a task under the heading above. A heading that already has tasks cannot indent.",
    };
  }
  applyTaskOutline(task.project_id, next);
  const after = next.find((row) => row.id === task.id);
  if (after?.parent_id != null) {
    rollupParentFromChildren(after.parent_id);
    revalidateTask(task.project_id, after.parent_id);
  }
  syncProjectStatus(task.project_id);
  revalidateTask(task.project_id, task.id);
  return { ok: true };
}

export function outdentTask(taskId: number): { ok: true } | { ok: false; error: string } {
  const task = getTask(taskId);
  if (!task) return { ok: false, error: "Task not found" };
  const oldParent = task.parent_id;
  const next = outdentRows(outlineFromProject(task.project_id), task.id);
  if (!next) return { ok: false, error: "Already at the top level" };
  applyTaskOutline(task.project_id, next);
  if (oldParent != null) {
    rollupParentFromChildren(oldParent);
    revalidateTask(task.project_id, oldParent);
  }
  syncProjectStatus(task.project_id);
  revalidateTask(task.project_id, task.id);
  return { ok: true };
}
