import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { CommentThread } from "@/components/CommentThread";
import { getCurrentUser } from "@/lib/auth";
import { personLabel } from "@/lib/people";
import { raidStatusLabel } from "@/lib/raid-status";
import {
  getProject,
  getRaidItem,
  listCommentsForRaid,
  listEmailLogForRaid,
  listUsers,
} from "@/lib/queries";

export default async function RaidItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; raidId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { projectId, raidId } = await params;
  const { edit } = await searchParams;
  const project = getProject(Number(projectId));
  const item = getRaidItem(Number(raidId));
  if (!project || !item || item.project_id !== project.id) notFound();

  const [current, users, comments, emails] = [
    await getCurrentUser(),
    listUsers(),
    listCommentsForRaid(item.id),
    listEmailLogForRaid(item.id),
  ];

  return (
    <>
      <AppHeader active="home" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-4">
        <Link
          href={`/projects/${project.id}#risks-and-issues`}
          className="text-sm text-sky-800 hover:underline"
        >
          ← {project.name}
        </Link>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          {item.type} · {raidStatusLabel[item.status]}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{item.title}</h1>
        <p className="mt-2 text-sm text-slate-700">{item.description}</p>
        <p className="mt-2 mb-6 text-sm text-slate-600">
          Assigned: {personLabel(item.assigned_name, item.assigned_role)}
        </p>
        <CommentThread
          parentKind="raid"
          parentId={item.id}
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
