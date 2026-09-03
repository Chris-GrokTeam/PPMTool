import "server-only";
import { cookies } from "next/headers";
import { getUser, listUsers } from "./queries";
import type { User } from "./types";

const COOKIE = "ppm_user";

export async function getCurrentUser(): Promise<User> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  const id = raw ? Number(raw) : 1;
  return getUser(id) ?? listUsers()[0];
}

export async function setCurrentUserId(userId: number) {
  const store = await cookies();
  store.set(COOKIE, String(userId), { path: "/" });
}
