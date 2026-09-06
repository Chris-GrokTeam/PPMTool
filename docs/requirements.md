# PPM Tool — Product Brief

Living notes. Update this as we decide things. Not a locked specification.

**Status:** Walking skeleton running locally. Core screens confirmed.  
**Kind of project:** Personal learning project (Grok Build). Nobody else is using it yet. Chris has never built an app; learning the craft is part of the point.  
**North star:** Adobe Workfront — get reasonably close, not a full enterprise clone.

---

## What this is

A place to **track all projects in one place**.

From a project you can open **specific tasks**, type **comments** on a task, and other people can **see those comments**.

This is a team-shaped tool even if only one person uses it at first. Comments only make sense if more than one person can look at the same task.

## Who it is for (now)

Just Chris, as a learning project. Chris is a professional project manager and has used Workfront extensively.

It would be cool to grow toward an enterprise PPM tool like Workfront. For now, “somewhat reasonably close” is enough.

Sample data is a **fictional Jamaican Geological Survey** portfolio (not Alberta work). All six projects are assumed to produce public information.

**Staff (You are):** Legend (Legendary Geologist, project lead on all projects), Horace (Chief Geologist), Marisol (Director of Jamaican Geology), Nadine (Manager of Jamaican Emerging Minerals), Fitzroy (Island Procurement Specialist), Amina (GIS Expert), Priya (Island Publications), plus Devon, Keisha, Omar, and Imani.

**Projects:**
1. Assessment of Critical Minerals in Jamaican Tailing Ponds
2. Airborne Geophysical Survey of Jamaica (Magnetics and Gravity)
3. Geochemical Analysis of 10,000 Rocks Acquired by the Jamaican Bobsled Team
4. Geothermal Potential Mapping of Jamaica
5. Assessment of Till and Alluvium Samples Across Jamaica
6. Beach Fieldwork for Critical Mineral Potential in Jamaica

Procurement tasks are labeled as **Jamaican public procurement policy** (NPP and RFP). Publication tasks use **OFR, DIG, and INF** products.

## What matters from Workfront

The core loop is **task-level conversation that drives action**:

1. Open a specific task.
2. See the **comment history** on that task (not a generic project chat).
3. People **assigned to the task** can read that history and take corresponding actions.
4. In the comment box, **tagging someone emails them**.

That is the Updates / comments thread on a Workfront task, including @mentions with email notifications.

## What v1 must do

These are the three jobs the first version should do well. How we *build* them can still be sequenced; this is the target, not the build order.

1. **Portfolio Gantt**
   - One view of **all projects** on a Gantt chart.
   - The chart includes **milestones**.
   - You can see whether each project is **on track** (project status).

2. **Task-level staff communication**
   - Open a specific task and talk with staff there.
   - Comment history lives on the task.
   - Assignees can see it and act.
   - Tagging someone emails them.
   - This is the most important of the three.

3. **Open risks and issues (portfolio)**
   - On **Home**, under the portfolio Gantt: a list of open risks and issues across projects.
   - Title, description, assigned, **Due**, **severity**; click through to the item’s comments.

## How we learn vs how we would make it real

Rule: cut corners for this learning project. Every cut stays on this list with a **next step to make it real**, so we can grow toward a full enterprise PPM later.

### v1 people and notifications (decided)

- A few **fake staff users** you can switch into. No real sign-up, passwords, or SSO.
- Comments are **shared in the app** for whoever is “logged in.”
- `@mention` does **not** send a real email. It writes to an in-app notification (and maybe a visible “email log”) so we still build the *behavior*.

### Learning cut → next step to make it real

Keep adding rows here whenever we simplify something.

| Area | v1 (learning cut) | Next step to make it real |
|------|-------------------|---------------------------|
| Users | Seeded fake staff; switch user in the UI | Real accounts, invite, password or magic link |
| Access | Anyone who can open the app can see everything | Roles (PM, assignee, viewer), project-level permissions |
| Identity / SSO | None | SSO (SAML/OIDC), SCIM for enterprise directory sync |
| @mention notify | In-app + fake email log | Real email (and later digest / mute / preferences) |
| Task comments | History + mentions on a task; **author can edit their own**, others cannot | Attachments, delete, audit of edits, rich text, email-to-comment |
| Assignments | Simple assignee on a task | Multiple assignees, job roles, handoff, out-of-office |
| Portfolio Gantt | All projects, milestones, **schedule-aware status**, % complete fill (task rollup) | Dependencies, baselines, critical path, drag project bars |
| Project status | **Computed** from schedule + open RAID (on_track / at_risk / off_track); no manual override in v1; stored on `projects.status` as a cache | Manual override that sticks until cleared; baselines / variance bands |
| Risks & issues | Project RAID register + Home open list: type, title, description, assigned, **Due**, **severity** (low/medium/high/critical), four statuses, add, comments | Workflow/automation, probability×impact matrix, owners separate from assignee |
| Reports | Open RAID list on Home (no separate Reports page) | Filters, saved reports, scheduled send, export, dashboards |
| Audit | Little or none | Who changed what, when, for compliance |
| Multi-company | Single local app | Tenants, data isolation, admin console |
| Reliability | Local/dev is enough | Backups, uptime, environments (dev/stage/prod) |
| Hosting | Runs on Chris’s Mac in a browser | Host in the cloud (e.g. Azure) so a team can use it |
| Database | Local file (SQLite) | Shared database (Postgres or Azure SQL) |
| Real email | Fake in-app “email log” | Microsoft 365 / Outlook (Graph API) or SMTP |
| Company login | Fake user switcher | Microsoft Entra ID (Azure AD) SSO |

### Workfront-scale modules (not in v1, later if we grow)

These are the rest of an enterprise PPM. Not promised. Listed so we remember they exist.

- Timesheets and hour logging
- Resource / capacity management
- Portfolios and programs above projects (true hierarchy)
- Issue / request queues and intake
- Approvals and stage gates
- Documents and proofing
- Custom forms and custom fields
- Project templates
- Financials (budgets, actuals, billing)
- Agile boards alongside Waterfall Gantt
- Cross-project dependencies
- Full risk/issue registers (v1 only shows **open counts** on the portfolio)

## Tech (recommended)

Chris uses Microsoft products at work and has never built an app. We will **not** start in Excel, Power Apps, or a full Azure/.NET enterprise stack. Those are good *later* (see the table above). For learning with Grok Build, we want something we can run locally, see in the browser, and explain as we go.

**Recommended v1 stack:**

- A **website** you open in Edge or Chrome (the app)
- **TypeScript** — JavaScript with types; the usual language for this kind of UI
- **Next.js + React** — one project for screens and server logic; fewer moving parts for a first app
- **SQLite** — data saved in a file on your Mac (think: a workbook the app owns, not a spreadsheet you edit by hand)

What you will learn, in order: run the app, screens and navigation, saving projects/tasks, the comment thread, then Gantt and reports.

**Next step toward a Microsoft shop:** Entra ID login, Outlook mail for @mentions, Azure hosting, optional Azure SQL.

## Screens

Sketching one at a time. Confirmed screens stay; drafts are marked.

**Date format (app-wide):** `Aug 19, 2026` (month day, year). Gantt axis can still show month names (Jun, Jul, Aug).

### Screen 1 — Portfolio Gantt (home) — CONFIRMED

This is what you see when you open the app. One timeline, every project.

**On the screen**

- Top bar: app name (**PPM**), nav (**Home**), **who you are** (fake user switcher)
- Below the Gantt: **Open risks and issues** across all projects (type, project, title, assigned, **Due**, **severity** pill, status, description). Sorted critical→low then by due date. Title opens RAID comments.
- **Home** is the landing screen (the portfolio Gantt)
- Left columns: **Project**, **Status**, **Risks** (count), **Issues** (count). Each column has a drag handle on the header (same as the project plan). **Wrap text** wraps the project name only; status and counts stay on one line.
- Hover a truncated name to see the full title. Hover a bar for start–end as `Aug 19, 2026`.
- Click a **risk or issue count** → that project’s Risks and issues section.
- Right: a **Gantt** — one bar per project from start date to end date
- Axis shows **fiscal year and quarter with months**. Q1 starts 1 April; year-end is 31 March. Label **FY2026-27** for 1 Apr 2026 – 31 Mar 2027.
- A **today line** on the Gantt (vertical line at today’s date); the Today label sits on the fiscal row, not on the month names
- **Milestones** on the bar (diamonds), with names
- Status also shows on the bar (color), so you can read health without leaving the chart. Status is **computed** from schedule and open RAID (hover the pill for a short tip).
- Click a **project name** → that project’s task list (later screen)
- Click a **milestone** → we can decide later (maybe the task it belongs to)

**v1 cut:** no drag-to-reschedule, no dependency arrows, no zoom. No owner column or RAID log on this screen (counts only). Left columns do not freeze while the Gantt pans (later). Project plan Gantt stays months-only until we share the fiscal header.

**Make it real later:** dependencies, baselines, drag dates, critical path; freeze names while the timeline scrolls.

```
[ PPM ]   Home | Reports                    You are: Alex (PM) ▾

Project           Status     Risks  Issues | Jun           Jul           Aug
------------------|----------|------|-------|--------------------------------
Website redesign  On track      1      0   | ████████◆█|███████
Office move       At risk       3      2   |      ███|██◆██
Q3 launch         Off track     0      5   |          |████████◆
                              today ------->           |
```

### Screen 2 — Project (task list + Gantt) — CONFIRMED

You get here by clicking a project name on the Gantt. This is the Workfront project page: header, **two-pane project plan**, and a **task Gantt on the far right**. Click **Comments** on a row to open the thread (next screen).

**On the screen**

- Same top bar (nav + user switcher)
- Back link to **Home**
- Header: project name, status, dates, owner, **open risks / open issues** counts
- Click **Risks** or **Issues** (the counts) → Risks & issues section
- **Two-pane project plan:** **left** = outline (`#` / WBS, task name, drag handle, ←/→) with clear parent vs child (heading band, ▾ / └ markers). **Right** = assigned, start, end, %, status, Gantt. A splitter resizes the outline pane; the outline stays visible while the schedule scrolls horizontally. Row selection highlights the active row.
- **Name and assignee are always editable**. Dates, %, and status are editable on a task; on a **heading that has tasks under it** they are display-only.
- **Heading rollup:** while a row has children, start = earliest child start, end = latest child end, % = duration-weighted from children, status = Complete if every child is complete, Not started if every child is not started, otherwise In progress. A heading is not a milestone. A top-level row with no children is a normal task.
- **Outline:** drag the row handle (left of the name, not the Gantt) to reorder. A heading takes its tasks with it. **→** places a task under the heading above; **←** moves it back out, sitting after that heading’s block. Numbers update after each move. They are not the database id.
- **Far right:** a Gantt, one bar per task (milestone = diamond), aligned to the same timeline
- Drag a **child** bar to move dates; drag the bar **ends** to change start or end only. A heading bar is a summary and is not draggable. Gantt drag never reorders rows. Dates never auto-sort the list.
- A **today line** (vertical) so you immediately see where “now” is vs the work
- Visual on-time: bar vs today line (and later, color if end date is before today and % complete is under 100%)
- **Comments** on a plan row opens the task thread
- **Risks and issues** sit **above** the project plan (type, title, description, assigned with role, **Due**, **severity**, status). Click Comments for the thread. New rows can be added on the same page (defaults: Due = today+14, severity = medium).

**v1 cut:** one-level outline (heading + tasks under it, not deeper). No collapse/expand headings yet.

```
[ PPM ]   Home | Reports                         You are: Alex (PM) ▾

← Home

Website redesign                 On track     [Risks 1]  [Issues 0]
Owner: Alex    1 Jun – 15 Aug

Task                 Assignee  Start     End       %    Status       | Jun      Jul       Aug
---------------------|----------|----------|----------|-----|------------|----------------------
Kickoff              Alex      1 Jun     2 Jun    100%  Complete     | ██|
Design mockups       Sam       3 Jun     20 Jun    60%  In progress  |   ████|
◆ Stakeholder review Alex      21 Jun    21 Jun     0%  Milestone    |       ◆|
Build                Sam       22 Jun    1 Aug      0%  Not started  |        |████████
                                                     today ----------->        |
```

### Screen 3 — Task (comments) — CONFIRMED

You get here by clicking a task on the project page. This is the Workfront **Updates** tab: the conversation lives on **this task**, assignees can read the history and act, and `@` tags someone.

**On the screen**

- Same top bar (nav + user switcher)
- Back link to the project
- Header: task name, project name, assignee, start, end, % complete, status
- **Comment box** to type an update; `@` shows the fake staff list
- **Comment history** on this task only (person, date, text; `@names` highlighted)
- Dates on comments: **Aug 19, 2026**
- **Author can edit their own comments.** Other people cannot. Edited comments can show a small “edited” mark.
- Tagging someone writes a row to the **fake email log** and the header **Inbox** (unread badge, click-through to the thread) — not a real mailbox

**v1 cut:** no attachments, no delete, no email-in. Newest comments at the top (Workfront-like). No editing other people’s comments.

```
[ PPM ]   Home | Reports                      You are: Alex (PM) ▾

← Website redesign

Design mockups
Assignee: Sam    Jun 3, 2026 – Jun 20, 2026    60%    In progress

[ Write an update…  @ to tag someone                    ] [ Post ]

Alex (PM)  ·  Aug 19, 2026                    [Edit]
  @Sam the homepage hero is approved. Please move to
  inner pages this week.
  ✉ Email logged → Sam: you were tagged on Design mockups

Sam  ·  Aug 18, 2026
  First round is in the shared folder. Ready for review.
```

### Screen 4 — Health report — MERGED INTO HOME

The separate **Reports** nav and page are removed. The open risks and issues list now sits on **Home** under the portfolio Gantt. Project health filters and the secondary project table from Reports were not carried over (Home already shows status and RAID counts on the Gantt). `/reports` redirects to Home.

### Screen — Risks & issues (on the project) — IN APP

Register lives on the project page above the plan (also linked from Home open list and header counts). Each item has type, title, description, assigned, **Due** (editable date), **severity** (`low` | `medium` | `high` | `critical` — one scale for risks and issues), and status. High/critical tint in the register; severity pills on Home and the detail page. Sorted by open-first, then severity, then due date.


### Project status rules (computed)

v1 is **computed-only** (no manual override). `projects.status` is updated whenever tasks/%/RAID change and whenever projects are listed. Rules use overall project % complete (day-weighted rollup of top-level tasks) and open RAID (`status != closed`).

| Status | When (first match wins: off_track → at_risk → on_track) |
|--------|----------------------------------------------------------|
| **Off track** | (1) `end_date` before today **and** % complete &lt; 100; **or** (2) any open RAID with status **escalated**; **or** (3) any open **issue** with severity **critical**; **or** (4) **two or more** open RAID items with severity **high** or **critical** |
| **At risk** | Not off track, and: (1) `end_date` within **14 days** (inclusive) and % &lt; 100; **or** (2) any open RAID (risk or issue) with severity **high** or **critical** |
| **On track** | Otherwise |

Seed examples (as of SCHEMA_VERSION 9): Tailing Ponds & Till = off_track (escalated / critical); Airborne & Beach = at_risk (high open RAID); Bobsled & Geothermal = on_track (no high/critical open RAID).

## Decisions log

| Date | Decision |
|------|----------|
| 2026-08-19 | Core idea: all projects in one place; open a task; comment; others can see comments. Inspired by Adobe Workfront. |
| 2026-08-19 | First audience is just Chris. Learning project. Aim for “reasonably close” to Workfront, not a full clone. |
| 2026-08-19 | Chris is a professional PM and has used Workfront extensively. The key loop is: open a task, read comment history, assignees act on it. Tagging someone in a comment emails them. |
| 2026-08-19 | v1 three jobs: (1) portfolio Gantt with milestones and on-track status, (2) task-level staff comments with @mention email — most important, (3) easy-to-filter health reports for all projects or one project. |
| 2026-08-19 | People/notifications: option A for v1 (fake users, in-app comments, fake email log). Keep a living “cut → next step to make it real” list, plus Workfront-scale modules not in v1. |
| 2026-08-19 | Chris uses Microsoft products, has never built an app, and wants to learn by building. Recommended v1: TypeScript, Next.js/React, SQLite, local browser app. Microsoft (Entra, Outlook, Azure) is the “make it real” path, not v1. |
| 2026-08-19 | Started screen sketches with Portfolio Gantt as home (draft, not confirmed). |
| 2026-08-19 | Screen 1 confirmed: portfolio Gantt plus columns for open risks and open issues. |
| 2026-08-19 | Screen 2 (draft): task list with start date, end date, % complete; Gantt on the far right with a today line. Risks/issues opened from this page; that section is a next step with no spec yet. Today line also added to Screen 1 so both Gantts match. |
| 2026-08-19 | Screen 2 confirmed. |
| 2026-08-19 | Screen 3 confirmed: comment dates as Aug 19, 2026; authors can edit their own comments, others cannot. |
| 2026-08-19 | Screen 4 (draft): health report bottom section lists open risks/issues with title and description. |
| 2026-08-19 | Screen 4: risks/issues list also has Assigned (who is managing it). |
| 2026-08-19 | Screen 4 confirmed. Core screens (portfolio Gantt, project + task Gantt, task comments, health report) are locked. |
| 2026-08-20 | Home nav label (landing screen). Project plan: edit task name, assignee, start/end; drag Gantt bars (and bar ends) to change dates. |
| 2026-08-20 | Replaced sample data with six fictional Jamaican Geological Survey projects, survey-style work plans, Jamaican-labeled public procurement (NPP/RFP), and JGS staff roles. |
| 2026-08-20 | Project plan is a clean scan table plus aligned Gantt. Risks/issues sit above the plan (type, title, description, assigned). Click a task, risk, or issue to comment. |
| 2026-08-20 | Project plan outline: drag a row to reorder (handle, not Gantt); indent/outdent buttons; visible 1 / 1.1 numbers; parent block moves with its children. Dates and Gantt-bar drag do not reshuffle the list. |
| 2026-08-20 | Heading with children: start/end/%/status roll up from children and cannot be edited. Child dates still set in the table or by dragging the Gantt bar. |
| 2026-08-20 | Home: resizable name pane, wrap toggle, fiscal year/quarter axis (Q1 = 1 Apr, label FY2026-27), Today on the FY row, name/bar hover, risk/issue counts link to RAID. |
| 2026-08-20 | Home data columns are independent (Project, Status, Risks, Issues) with per-column resize like the plan. Wrap only applies to the project name. Fiscal Gantt header unchanged. |
| 2026-08-21 | Open risks and issues list moved onto Home under the portfolio Gantt. Reports nav/page removed; `/reports` redirects to Home. |
| 2026-09-05 | Header Inbox from email_log (unread badge, mark read, click-through to task/RAID). Portfolio Gantt bars show % complete rolled up from tasks. Fixed Open PPM Tool.command Node discovery + version checks. SCHEMA_VERSION 7 (read_at on email_log). |
| 2026-09-05 | RAID due date (**Due**) + **severity** (`low`/`medium`/`high`/`critical`) on register, Home open list, and detail. SCHEMA_VERSION 8. Same scale for risks and issues (no separate probability field yet). |
| 2026-09-05 | Project status is schedule- and RAID-aware (computed-only). Off track / at risk / on track rules documented above. SCHEMA_VERSION 9 (seed statuses + bobsled assay severity adjusted). |
