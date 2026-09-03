import "server-only";
import { revalidatePath } from "next/cache";
import { isRaidStatus } from "./raid-status";
import { getRaidItem, updateRaidItem } from "./queries";

export function saveRaid(input: {
  id: number;
  title?: string;
  description?: string;
  status?: string;
}): { ok: true } | { ok: false; error: string } {
  const item = getRaidItem(input.id);
  if (!item) return { ok: false, error: "Item not found" };

  const title = (input.title ?? item.title).trim();
  const description = (input.description ?? item.description).trim();
  if (!title) return { ok: false, error: "Title is required" };
  if (!description) return { ok: false, error: "Description is required" };

  const status = input.status ?? item.status;
  if (!isRaidStatus(status)) return { ok: false, error: "Invalid status" };

  updateRaidItem({ id: item.id, title, description, status });
  revalidatePath(`/projects/${item.project_id}`);
  revalidatePath(`/projects/${item.project_id}/raid/${item.id}`);
  revalidatePath("/");
  return { ok: true };
}
