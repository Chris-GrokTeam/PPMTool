import { redirect } from "next/navigation";

/** Reports merged into Home. Keep this route so old bookmarks still work. */
export default function ReportsPage() {
  redirect("/");
}
