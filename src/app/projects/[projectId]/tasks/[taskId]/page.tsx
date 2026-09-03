import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { CommentThread } from "@/components/CommentThread";
import { TaskStatusPill } from "@/components/StatusPill";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { personLabel } from "@/lib/people";
import {
  getProject,
  getTask,
  listComments,
  listEmailLogForTask,
  listUsers,
} from "@/lib/queries";

export default async function TaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { projectId, taskId } = await params;
  const { edit } = await searchParams;
  const project = getProject(Number(projectId));
  const task = getTask(Number(taskId));
  if (!project || !task || task.project_id !== project.id) notFound();

  const [current, users, comments, emails] = [
    await getCurrentUser(),
    listUsers(),
    listComments(task.id),
    listEmailLogForTask(task.id),
  ];

  return (
    <>
      <AppHeader active="home" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-4">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm text-sky-800 hover:underline"
        >
          ← {project.name}
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-slate-900">{task.name}</h1>
        <p className="mt-1 mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>Assignee: {personLabel(task.assignee_name, task.assignee_role)}</span>
          <span>
            {formatDate(task.start_date)} – {formatDate(task.end_date)}
          </span>
          <span>{task.percent_complete}%</span>
          <TaskStatusPill status={task.status} />
        </p>
        <CommentThread
          parentKind="task"
          parentId={task.id}
          comments={comments}
          emails={emails}
          users={users}
          currentUserId={current.id}
          editId={edit ? Number(edit) : undefined}
        />
      </main>
    </>
  );
}
