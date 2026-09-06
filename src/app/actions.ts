"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isISODate } from "@/lib/dates";
import { isRaidSeverity } from "@/lib/raid-severity";
import {
  findMentionedUserIds,
} from "@/lib/mentions";
import {
  getComment,
  getRaidItem,
  getTask,
  getUser,
  insertComment,
  insertEmailLog,
  insertRaidComment,
  insertRaidItem,
  listInboxForUser,
  markAllInboxRead,
  markInboxItemRead,
  mentionedUserIdsAlreadyEmailed,
  syncProjectStatus,
  updateCommentBody,
} from "@/lib/queries";
import type { RaidType } from "@/lib/types";

function logNewMentions(commentId: number, body: string, taskName: string, already: number[]) {
  const mentioned = findMentionedUserIds(body);
  for (const userId of mentioned) {
    if (already.includes(userId)) continue;
    insertEmailLog(commentId, userId, `You were tagged on ${taskName}`);
  }
}

export async function postComment(formData: FormData) {
  const current = await getCurrentUser();
  const kind = String(formData.get("kind") ?? "task");
  const entityId = Number(formData.get("entityId") ?? formData.get("taskId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!entityId || !body) return;

  if (kind === "raid") {
    const item = getRaidItem(entityId);
    if (!item) return;
    const commentId = insertRaidComment(entityId, current.id, body);
    logNewMentions(commentId, body, item.title, []);
    revalidatePath(`/projects/${item.project_id}`);
    revalidatePath(`/projects/${item.project_id}/raid/${item.id}`);
    revalidatePath("/inbox");
    redirect(`/projects/${item.project_id}/raid/${item.id}`);
  }

  const task = getTask(entityId);
  if (!task) return;
  const commentId = insertComment(entityId, current.id, body);
  logNewMentions(commentId, body, task.name, []);
  revalidatePath(`/projects/${task.project_id}/tasks/${entityId}`);
  revalidatePath("/inbox");
  redirect(`/projects/${task.project_id}/tasks/${entityId}`);
}

export async function saveComment(formData: FormData) {
  const current = await getCurrentUser();
  const commentId = Number(formData.get("commentId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!commentId || !body) return;
  const comment = getComment(commentId);
  if (!comment || comment.author_id !== current.id) return;
  const label =
    comment.task_id != null
      ? getTask(comment.task_id)?.name
      : comment.raid_item_id != null
        ? getRaidItem(comment.raid_item_id)?.title
        : undefined;
  if (!label) return;
  updateCommentBody(commentId, body);
  logNewMentions(
    commentId,
    body,
    label,
    mentionedUserIdsAlreadyEmailed(commentId)
  );
  revalidatePath("/inbox");
  if (comment.task_id != null) {
    const task = getTask(comment.task_id);
    if (!task) return;
    revalidatePath(`/projects/${task.project_id}/tasks/${comment.task_id}`);
    redirect(`/projects/${task.project_id}/tasks/${comment.task_id}`);
  }
  if (comment.raid_item_id != null) {
    const item = getRaidItem(comment.raid_item_id);
    if (!item) return;
    revalidatePath(`/projects/${item.project_id}`);
    revalidatePath(`/projects/${item.project_id}/raid/${item.id}`);
    redirect(`/projects/${item.project_id}/raid/${item.id}`);
  }
}

export async function createRaidItem(formData: FormData) {
  const projectId = Number(formData.get("projectId"));
  const type = String(formData.get("type")) as RaidType;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assignedId = Number(formData.get("assignedId"));
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const severity = String(formData.get("severity") ?? "").trim();
  if (!projectId || !title || !description || !assignedId || !dueDate || !severity) return;
  if (type !== "risk" && type !== "issue") return;
  if (!getUser(assignedId)) return;
  if (!isISODate(dueDate) || !isRaidSeverity(severity)) return;
  insertRaidItem({
    projectId,
    type,
    title,
    description,
    assignedId,
    dueDate,
    severity,
  });
  syncProjectStatus(projectId);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
  redirect(`/projects/${projectId}`);
}

export async function markAllInboxReadAction() {
  const current = await getCurrentUser();
  markAllInboxRead(current.id);
  revalidatePath("/inbox");
  revalidatePath("/");
  redirect("/inbox");
}

export async function openInboxItem(formData: FormData) {
  const current = await getCurrentUser();
  const id = Number(formData.get("id"));
  if (!id) redirect("/inbox");
  const item = listInboxForUser(current.id).find((row) => row.id === id);
  if (!item) redirect("/inbox");
  markInboxItemRead(id, current.id);
  revalidatePath("/inbox");
  revalidatePath("/");
  if (item.task_id != null) {
    redirect(`/projects/${item.project_id}/tasks/${item.task_id}`);
  }
  if (item.raid_item_id != null) {
    redirect(`/projects/${item.project_id}/raid/${item.raid_item_id}`);
  }
  redirect(`/projects/${item.project_id}`);
}
