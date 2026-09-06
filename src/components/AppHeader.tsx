import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { countUnreadInbox, listUsers } from "@/lib/queries";
import { UserSwitcher } from "./UserSwitcher";

export async function AppHeader({
  active,
}: {
  active?: "home" | "inbox";
}) {
  const [users, current] = [listUsers(), await getCurrentUser()];
  const unread = countUnreadInbox(current.id);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-[#1b365d] px-4 py-2.5 text-white">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-bold tracking-wide">
          PPM
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`rounded px-2 py-1 text-sm ${
              active === "home"
                ? "bg-white/15 font-semibold text-white"
                : "text-white/80 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/inbox"
            className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm ${
              active === "inbox"
                ? "bg-white/15 font-semibold text-white"
                : "text-white/80 hover:text-white"
            }`}
          >
            Inbox
            {unread > 0 ? (
              <span className="min-w-[1.25rem] rounded-full bg-amber-400 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-[#1b365d]">
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
      <UserSwitcher users={users} currentId={current.id} />
    </header>
  );
}
