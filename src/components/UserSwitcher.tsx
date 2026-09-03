"use client";

import { switchUser } from "@/app/switch-user";
import type { User } from "@/lib/types";

export function UserSwitcher({
  users,
  currentId,
}: {
  users: User[];
  currentId: number;
}) {
  return (
    <form action={switchUser} className="flex items-center gap-2 text-sm">
      <label htmlFor="userId" className="text-white/80">
        You are
      </label>
      <select
        id="userId"
        name="userId"
        key={currentId}
        defaultValue={currentId}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="max-w-[280px] rounded border border-white/20 bg-[#16325c] px-2 py-1 text-white"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
    </form>
  );
}
