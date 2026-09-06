import Link from "next/link";
import { postComment, saveComment } from "@/app/actions";
import { formatDate } from "@/lib/dates";
import { staffHint } from "@/lib/mentions";
import { personLabel } from "@/lib/people";
import type { Comment, EmailLog, User } from "@/lib/types";

export function CommentThread({
  parentKind,
  parentId,
  comments,
  emails,
  users,
  currentUserId,
  editId,
}: {
  parentKind: "task" | "raid";
  parentId: number;
  comments: Comment[];
  emails: EmailLog[];
  users: User[];
  currentUserId: number;
  editId?: number;
}) {
  const emailsByComment = new Map<number, EmailLog[]>();
  for (const email of emails) {
    const list = emailsByComment.get(email.comment_id) ?? [];
    list.push(email);
    emailsByComment.set(email.comment_id, list);
  }

  return (
    <div className="space-y-6">
      <form action={postComment} className="rounded-md border border-slate-200 bg-white p-3">
        <input type="hidden" name="kind" value={parentKind} />
        <input type="hidden" name="entityId" value={parentId} />
        <label htmlFor="body" className="sr-only">
          Write an update
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={3}
          placeholder={`Write an update… ${staffHint(users)} to tag someone`}
          className="w-full resize-y rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-600"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Tag people with {staffHint(users)}. They get an Inbox notification (and a fake email in the log below).
          </p>
          <button
            type="submit"
            className="rounded bg-[#1b365d] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#16325c]"
          >
            Post
          </button>
        </div>
      </form>

      <ul className="space-y-4">
        {comments.map((comment) => {
          const editing = editId === comment.id && comment.author_id === currentUserId;
          const edited = comment.updated_at !== comment.created_at;
          const commentEmails = emailsByComment.get(comment.id) ?? [];
          return (
            <li key={comment.id} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <p className="text-sm">
                  <span className="font-semibold text-slate-900">
                    {comment.author_name} ({comment.author_role})
                  </span>
                  <span className="text-slate-400">
                    {" "}
                    · {formatDate(comment.created_at.slice(0, 10))}
                  </span>
                  {edited ? <span className="ml-2 text-xs text-slate-400">edited</span> : null}
                </p>
                {comment.author_id === currentUserId && !editing ? (
                  <Link
                    href={`?edit=${comment.id}`}
                    className="text-xs font-medium text-sky-800 hover:underline"
                  >
                    Edit
                  </Link>
                ) : null}
              </div>
              {editing ? (
                <form action={saveComment} className="space-y-2">
                  <input type="hidden" name="commentId" value={comment.id} />
                  <textarea
                    name="body"
                    required
                    rows={3}
                    defaultValue={comment.body}
                    className="w-full resize-y rounded border border-slate-200 px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded bg-[#1b365d] px-3 py-1 text-sm text-white"
                    >
                      Save
                    </button>
                    <Link href="?" className="rounded px-3 py-1 text-sm text-slate-600">
                      Cancel
                    </Link>
                  </div>
                </form>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-slate-800">
                  <MentionText body={comment.body} users={users} />
                </p>
              )}
              {commentEmails.map((email) => (
                <p key={email.id} className="mt-2 text-xs text-slate-500">
                  ✉ Email logged → {personLabel(email.to_user_name, email.to_user_role)}:{" "}
                  {email.subject}
                </p>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MentionText({ body, users }: { body: string; users: User[] }) {
  const byName = new Map(users.map((user) => [user.name.toLowerCase(), user]));
  const parts = body.split(/(@[A-Za-z]+)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (!part.startsWith("@")) {
          return <span key={index}>{part}</span>;
        }
        const match = byName.get(part.slice(1).toLowerCase());
        if (!match) {
          return (
            <span key={index} className="font-semibold text-sky-800">
              {part}
            </span>
          );
        }
        return (
          <span
            key={index}
            className="font-semibold text-sky-800"
            title={match.role}
          >
            @{match.name} ({match.role})
          </span>
        );
      })}
    </>
  );
}
