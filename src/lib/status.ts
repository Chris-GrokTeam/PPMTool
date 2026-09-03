import type { ProjectStatus, TaskStatus } from "./types";

export const projectStatusLabel: Record<ProjectStatus, string> = {
  on_track: "On track",
  at_risk: "At risk",
  off_track: "Off track",
};

export const TASK_STATUSES: TaskStatus[] = [
  "not_started",
  "in_progress",
  "complete",
  "milestone",
];

export const taskStatusLabel: Record<TaskStatus, string> = {
  complete: "Complete",
  in_progress: "In progress",
  not_started: "Not started",
  milestone: "Milestone",
};

export const projectBarClass: Record<ProjectStatus, string> = {
  on_track: "bg-emerald-600",
  at_risk: "bg-amber-500",
  off_track: "bg-red-600",
};

export const taskBarClass: Record<TaskStatus, string> = {
  complete: "bg-emerald-600",
  in_progress: "bg-sky-600",
  not_started: "bg-slate-400",
  milestone: "bg-violet-700",
};
