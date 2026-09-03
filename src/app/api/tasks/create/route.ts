import { NextResponse } from "next/server";
import { createTask } from "@/lib/save-task";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    projectId?: number;
    name?: string;
    assigneeId?: number;
    startDate?: string;
    endDate?: string;
    percentComplete?: number;
    status?: string;
    parentId?: number | null;
  };
  if (!body.projectId || !body.name || !body.assigneeId || !body.startDate || !body.endDate || !body.status) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }
  const result = createTask({
    projectId: body.projectId,
    name: body.name,
    assigneeId: body.assigneeId,
    startDate: body.startDate,
    endDate: body.endDate,
    percentComplete: body.percentComplete ?? 0,
    status: body.status,
    parentId: body.parentId ?? null,
  });
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
