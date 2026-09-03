<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# PPM Tool

Workfront-inspired learning project. Product decisions live in `docs/requirements.md`. Update that brief when we cut a corner or change a screen.

- Stack: Next.js App Router, TypeScript, Tailwind, SQLite via `node:sqlite` (`src/lib/db.ts`).
- Fake staff switcher (cookie `ppm_user`). No real auth.
- `@mentions` write to `email_log`, not a real inbox.
- Dates display as `Aug 19, 2026`.
- Comment authors may edit their own comments only.
- Keep the UI light (no dark theme). Enterprise PM tool, not a marketing site.
- `npm run reset-db` deletes `data/ppm.sqlite`; seed runs again on next request.

