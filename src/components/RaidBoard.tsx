import { createRaidItem } from "@/app/actions";
import { RaidRow } from "@/components/RaidRow";
import { personLabel } from "@/lib/people";
import type { RaidItem, User } from "@/lib/types";

export function RaidBoard({
  projectId,
  items,
  users,
}: {
  projectId: number;
  items: RaidItem[];
  users: User[];
}) {
  return (
    <section id="risks-and-issues" className="mb-8">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Risks and issues</h2>
        <p className="text-xs text-slate-500">
          Click Status to change it. Edit title and description in the cells. Comments
          opens the thread. Closed rows stay on the list, greyed out.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Assigned</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-slate-500">
                  No risks or issues yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <RaidRow key={item.id} projectId={projectId} item={item} />
              ))
            )}
          </tbody>
        </table>
        <form
          action={createRaidItem}
          className="grid gap-2 border-t border-slate-200 bg-slate-50 p-3 md:grid-cols-[8rem_1fr_1.4fr_16rem_auto] md:items-end"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Type
            <select
              name="type"
              className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-hidden focus:border-sky-600"
              defaultValue="risk"
            >
              <option value="risk">Risk</option>
              <option value="issue">Issue</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Title
            <input
              name="title"
              required
              placeholder="Short title"
              className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-hidden focus:border-sky-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Description
            <input
              name="description"
              required
              placeholder="What is happening"
              className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-hidden focus:border-sky-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Assigned
            <select
              name="assignedId"
              required
              className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-hidden focus:border-sky-600"
              defaultValue={users[0]?.id}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {personLabel(user.name, user.role)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded bg-[#1b365d] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#16325c]"
          >
            Add
          </button>
        </form>
      </div>
    </section>
  );
}
