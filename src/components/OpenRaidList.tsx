import Link from "next/link";
import { personLabel } from "@/lib/people";
import { raidStatusLabel } from "@/lib/raid-status";
import type { RaidItem } from "@/lib/types";

export function OpenRaidList({ items }: { items: RaidItem[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-base font-semibold text-slate-900">Open risks and issues</h2>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Project</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Assigned</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-slate-500">
                  No open risks or issues.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2 capitalize">{item.type}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/projects/${item.project_id}`}
                      className="text-sky-800 hover:underline"
                    >
                      {item.project_name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-medium">
                    <Link
                      href={`/projects/${item.project_id}/raid/${item.id}`}
                      className="text-sky-800 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {personLabel(item.assigned_name, item.assigned_role)}
                  </td>
                  <td className="px-3 py-2">{raidStatusLabel[item.status]}</td>
                  <td className="px-3 py-2 text-slate-700">{item.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
