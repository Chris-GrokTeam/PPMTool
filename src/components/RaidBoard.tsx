import { createRaidItem } from "@/app/actions";
import { RaidRow } from "@/components/RaidRow";
import { personLabel } from "@/lib/people";
import { RAID_SEVERITIES, raidSeverityLabel } from "@/lib/raid-severity";
import { addDays, todayISO } from "@/lib/dates";
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
  const defaultDue = addDays(todayISO(), 14);

  return (
    <section id="risks-and-issues" className="mb-8">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Risks and issues</h2>
        <p className="text-xs text-slate-500">
          Click Status or Severity to change them. Edit title, description, and Due in the
          cells. Comments opens the thread. Closed rows stay on the list, greyed out. High
          and critical severity sort to the top.
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
              <th className="px-3 py-2">Due</th>
              <th className="px-3 py-2">Severity</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-slate-500">
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
          className="grid gap-2 border-t border-slate-200 bg-slate-50 p-3 md:grid-cols-[7rem_1fr_1.2fr_14rem_9rem_8rem_auto] md:items-end"
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
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Due
            <input
              type="date"
              name="dueDate"
              required
              defaultValue={defaultDue}
              className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-hidden focus:border-sky-600"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Severity
            <select
              name="severity"
              required
              defaultValue="medium"
              className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-hidden focus:border-sky-600"
            >
              {RAID_SEVERITIES.map((value) => (
                <option key={value} value={value}>
                  {raidSeverityLabel[value]}
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
