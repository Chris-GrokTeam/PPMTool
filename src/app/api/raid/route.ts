import { NextResponse } from "next/server";
import { saveRaid } from "@/lib/save-raid";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    id?: number;
    title?: string;
    description?: string;
    status?: string;
  };
  if (!body.id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  const result = saveRaid(body);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
