# PPM Tool — Status snapshot (5 Sep 2026)

**GitHub:** [github.com/Chris-GrokTeam/PPMTool](https://github.com/Chris-GrokTeam/PPMTool) (public). Personal manager note stays local only (`docs/vacation-note.md`, gitignored).

Workfront-inspired **learning app** on Chris’s Mac. Fictional Jamaican Geological Survey sample (six projects). Not enterprise-ready.

**How complete:** The three v1 jobs run locally (portfolio Gantt, task comments, open risks/issues on Home). What’s left is polish on this app, team hosting, and a Workfront-scale catalogue — not “most of Workfront.”

### Repo sync (read this next session)

- **Local `main`** (`~/projects/PPMTool`) is **1 commit ahead** of `origin/main`: two-pane project plan (`4ade6e9`). Needs a PAT `git push` to publish.
- GitHub also has branch **`feat/inbox-gantt-open-fix`** (other Grok work: mention inbox, portfolio Gantt % fill, RAID due dates/severity, schedule-aware project status). **Not merged into local `main` yet.** Next session: review that branch, merge or cherry-pick, then push a single clean `main`.
- Throwaway clone `PPMTool-from-github` was deleted (cleanup).

---

## What we built

- **Home:** all projects on one Gantt with status, open risk/issue counts, milestones, and today line; open risks and issues list underneath (title opens RAID comments).
- **Project:** RAID register above a **two-pane** plan (outline left with clear parent/child; schedule + Gantt right; resizable splitter); one-level outline; Gantt drag moves non-heading bars only; headings locked.
- **Task:** comment history; author edits own comments; `@mention` → email log on the thread (no notification inbox).
- **People:** fake staff switcher (`ppm_user` cookie). No login.
- **Nav:** Home only (Reports removed; `/reports` redirects to Home).
- **Stack + run:** Next.js, TypeScript, Tailwind, SQLite. `npm run dev` → http://localhost:3000. Safari is the target browser. Name wrap is a toggle (default off). Brief: `docs/requirements.md`.

## What’s left

**Polish this app**
- Freeze Home names while the Gantt scrolls; fiscal header on the project plan; milestone click-through.
- RAID: due dates, severity, richer register (assigned + four statuses + add + comments already work).

**Usable by a team**
- Host it (e.g. Azure); shared database; backups and environments.
- Real accounts; Entra ID SSO; roles and project permissions; audit log.
- Real email for `@mentions` (Microsoft 365 / Graph).

**Not in v1 (Workfront-scale)**
- Dependencies, baselines, critical path; drag project bars; status from schedule/progress.
- Timesheets; resource / capacity; portfolios and programs.
- Intake, approvals / stage gates, documents, custom forms, templates.
- Financials; Agile boards; cross-project links; multi-company (tenants).

## Run it

`npm run dev` → http://localhost:3000. `npm run reset-db` wipes SQLite; seed runs again on next request.

## Grok Premium

Premium is a **monthly quota**, not a per-token bill. Long threads, sub-agents, and huge context burn it fastest.

**Do**
- One job per message (“fix wrap on Home”).
- After a feature is done, `/new` for the next screen; point it at `docs/requirements.md`.
- Say **proceed** only when the plan is locked.
- Skip extra agents unless you want a second opinion.
- If Safari is stuck, restart `npm run dev` when you already know that pattern.

Short how-to questions and reading the brief are cheap. Slowdowns or compaction notices → quota pressure; after two compactions, a new session is usually cheaper.
