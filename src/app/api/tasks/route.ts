import { NextResponse } from "next/server";
import { saveTask } from "@/lib/save-task";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    taskId?: number;
    name?: string;
    assigneeId?: number;
    startDate?: string;
    endDate?: string;
    percentComplete?: number;
    status?: string;
  };
  if (!body.taskId) {
    return NextResponse.json({ ok: false, error: "Missing taskId" }, { status: 400 });
  }
  const result = saveTask({
    taskId: body.taskId,
    name: body.name,
    assigneeId: body.assigneeId,
    startDate: body.startDate,
    endDate: body.endDate,
    percentComplete: body.percentComplete,
    status: body.status,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
