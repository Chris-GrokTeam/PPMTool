# PPM Tool — Status snapshot (5 Sep 2026)

**GitHub:** [github.com/Chris-GrokTeam/PPMTool](https://github.com/Chris-GrokTeam/PPMTool) (public). Personal manager note stays local only (`docs/vacation-note.md`, gitignored).

Workfront-inspired **learning app** on Chris’s Mac. Fictional Jamaican Geological Survey sample (six projects). Not enterprise-ready.

**How complete:** The three v1 jobs run locally (portfolio Gantt, task comments, open risks/issues on Home). What’s left is polish on this app, team hosting, and a Workfront-scale catalogue — not “most of Workfront.”

**Token note:** This session’s Grok Build log (quota under Premium, not a bill). Same work at API list prices would be roughly **$150–$350**.

`docs/requirements.md` tracks the living brief; RAID Due + severity and **schedule-aware project status** are documented.

---

## What we built

- **Home:** all projects on one Gantt with **computed** status (schedule + open RAID), open risk/issue counts, milestones, today line, and **% complete** fill on project bars; open risks and issues list underneath with **Due** + severity pills (title opens RAID comments).
- **Project:** RAID register (assigned, **Due**, **severity** low→critical, four statuses, add, comments) above task table + Gantt; one-level outline; Gantt drag moves non-heading bars only (top-level leaves and milestones); headings locked.
- **Task:** comment history; author edits own comments; @mention → email log + header **Inbox** (click through to task/RAID thread).
- **People:** fake staff switcher (`ppm_user` cookie). No login.
- **Nav:** Home + Inbox (Reports removed; `/reports` redirects to Home).
- **Stack + run:** Next.js, TypeScript, Tailwind, SQLite. `npm run dev` → http://localhost:3000. Safari is the target browser. Name wrap is a toggle (default off). Brief: `docs/requirements.md`.

## What’s left

**Polish this app**
- Freeze Home names while the Gantt scrolls; fiscal header on the project plan; milestone click-through.
- RAID: richer workflow later (probability×impact, automation); Due + severity are in.
- Project status: optional manual override later; v1 is computed-only (see rule table in requirements).

**Usable by a team**
- Host it (e.g. Azure); shared database; backups and environments.
- Real accounts; Entra ID SSO; roles and project permissions; audit log.
- Real email for `@mentions` (Microsoft 365 / Graph).

**Not in v1 (Workfront-scale)**
- Dependencies, baselines, critical path; drag project bars. (Status from schedule/RAID is in.)
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
