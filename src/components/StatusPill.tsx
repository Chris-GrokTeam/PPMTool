import { projectStatusLabel, taskStatusLabel } from "@/lib/status";
import type { ProjectStatus, TaskStatus } from "@/lib/types";

const projectClass: Record<ProjectStatus, string> = {
  on_track: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  at_risk: "bg-amber-50 text-amber-900 ring-amber-200",
  off_track: "bg-red-50 text-red-800 ring-red-200",
};

const taskClass: Record<TaskStatus, string> = {
  complete: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  in_progress: "bg-sky-50 text-sky-800 ring-sky-200",
  not_started: "bg-slate-100 text-slate-700 ring-slate-200",
  milestone: "bg-violet-50 text-violet-800 ring-violet-200",
};

export function ProjectStatusPill({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${projectClass[status]}`}
    >
      {projectStatusLabel[status]}
    </span>
  );
}

export function TaskStatusPill({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${taskClass[status]}`}
    >
      {taskStatusLabel[status]}
    </span>
  );
}
