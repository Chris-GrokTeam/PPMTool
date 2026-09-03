import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ganttRangeFrom } from "@/components/Gantt";
import { ProjectStatusPill } from "@/components/StatusPill";
import { RaidBoard } from "@/components/RaidBoard";
import { TaskPlan } from "@/components/TaskPlan";
import { formatDate } from "@/lib/dates";
import { personLabel } from "@/lib/people";
import { getProject, listRaidForProject, listTasks, listUsers } from "@/lib/queries";
import { toISORange } from "@/lib/timeline";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = getProject(Number(projectId));
  if (!project) notFound();
  const tasks = listTasks(project.id);
  const users = listUsers();
  const raid = listRaidForProject(project.id);
  const range = ganttRangeFrom(
    tasks.flatMap((task) => [task.start_date, task.end_date])
  );

  return (
    <>
      <AppHeader active="home" />
      <main className="flex-1 p-4">
        <Link href="/" className="text-sm text-sky-800 hover:underline">
          ← Home
        </Link>
        <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{project.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Owner: {personLabel(project.owner_name, project.owner_role)} ·{" "}
              {formatDate(project.start_date)} – {formatDate(project.end_date)}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ProjectStatusPill status={project.status} />
            <a
              href="#risks-and-issues"
              className="rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-50"
            >
              Risks {project.open_risks}
            </a>
            <a
              href="#risks-and-issues"
              className="rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-50"
            >
              Issues {project.open_issues}
            </a>
          </div>
        </div>

        <RaidBoard projectId={project.id} items={raid} users={users} />

        <TaskPlan
          projectId={project.id}
          tasks={tasks}
          users={users}
          rangeISO={toISORange(range)}
        />
      </main>
    </>
  );
}
