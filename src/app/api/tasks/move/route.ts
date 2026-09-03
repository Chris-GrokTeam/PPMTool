import { NextResponse } from "next/server";
import { indentTask, outdentTask, reorderTask } from "@/lib/save-task";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    taskId?: number;
    action?: "reorder" | "indent" | "outdent";
    beforeTaskId?: number | null;
  };
  if (!body.taskId) {
    return NextResponse.json({ ok: false, error: "Missing taskId" }, { status: 400 });
  }
  if (body.action === "indent") {
    const result = indentTask(body.taskId);
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }
  if (body.action === "outdent") {
    const result = outdentTask(body.taskId);
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }
  if (body.action === "reorder") {
    const result = reorderTask(body.taskId, body.beforeTaskId ?? null);
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  }
  return NextResponse.json({ ok: false, error: "Missing action" }, { status: 400 });
}
