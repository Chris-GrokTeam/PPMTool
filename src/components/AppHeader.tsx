import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listUsers } from "@/lib/queries";
import { UserSwitcher } from "./UserSwitcher";

export async function AppHeader({ active }: { active?: "home" }) {
  const [users, current] = [listUsers(), await getCurrentUser()];

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
        </nav>
      </div>
      <UserSwitcher users={users} currentId={current.id} />
    </header>
  );
}
