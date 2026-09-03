import "server-only";
import { listUsers } from "./queries";

const mentionPattern = /@([A-Za-z]+)/g;

export function findMentionedUserIds(body: string): number[] {
  const users = listUsers();
  const names = new Set<string>();
  for (const match of body.matchAll(mentionPattern)) {
    names.add(match[1].toLowerCase());
  }
  return users
    .filter((user) => names.has(user.name.toLowerCase()))
    .map((user) => user.id);
}

export function staffHint(users: { name: string; role: string }[]): string {
  return users.map((user) => `@${user.name} (${user.role})`).join(", ");
}
