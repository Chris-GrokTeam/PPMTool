import Link from "next/link";
import { markAllInboxReadAction, openInboxItem } from "@/app/actions";
import { AppHeader } from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { listInboxForUser } from "@/lib/queries";
import { personLabel } from "@/lib/people";

export default async function InboxPage() {
  const current = await getCurrentUser();
  const items = listInboxForUser(current.id);
  const unread = items.filter((item) => item.read_at == null).length;

  return (
    <>
      <AppHeader active="inbox" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Inbox</h1>
            <p className="text-sm text-slate-600">
              Mentions for {personLabel(current.name, current.role)}. Fake email
              only — no real mail.
            </p>
          </div>
          {unread > 0 ? (
            <form action={markAllInboxReadAction}>
              <button
                type="submit"
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Mark all read ({unread})
              </button>
            </form>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No tags yet. When someone uses @{current.name} in a comment, it shows
            up here.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200 bg-white">
            {items.map((item) => {
              const unreadItem = item.read_at == null;
              return (
                <li key={item.id}>
                  <form action={openInboxItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className={`flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-slate-50 ${
                        unreadItem ? "bg-sky-50/60" : ""
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">
                          {unreadItem ? (
                            <span
                              className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-600 align-middle"
                              aria-label="Unread"
                            />
                          ) : null}
                          {item.subject}
                        </p>
                        <time className="shrink-0 text-xs text-slate-500">
                          {formatDate(item.created_at.slice(0, 10))}
                        </time>
                      </div>
                      <p className="text-xs text-slate-600">
                        {personLabel(item.author_name, item.author_role)} ·{" "}
                        {item.project_name} · {item.target_label}
                      </p>
                      <p className="line-clamp-2 text-sm text-slate-700">
                        {item.body}
                      </p>
                      <span className="text-xs font-medium text-sky-800">
                        Open thread →
                      </span>
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-xs text-slate-500">
          Prefer the header badge for unread count. Switch users (top right) to
          see another person&apos;s tags.{" "}
          <Link href="/" className="text-sky-800 hover:underline">
            Back to Home
          </Link>
        </p>
      </main>
    </>
  );
}
