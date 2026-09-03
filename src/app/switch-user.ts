"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function switchUser(formData: FormData) {
  const userId = Number(formData.get("userId"));
  if (!Number.isFinite(userId)) return;
  const store = await cookies();
  store.set("ppm_user", String(userId), { path: "/" });
  revalidatePath("/", "layout");
}
