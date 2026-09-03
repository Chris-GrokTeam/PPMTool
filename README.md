# PPM Tool

A Workfront-inspired project portfolio tool. Personal learning project.

**Repo:** [github.com/Chris-GrokTeam/PPMTool](https://github.com/Chris-GrokTeam/PPMTool)

GitHub holds the **source code**. The app runs in your browser after you start it locally (Node server + SQLite). It is not a live website on GitHub itself.

## What you can do

- See all projects on a **portfolio Gantt** (status, open risks/issues, today line, milestones)
- Open a **project** for tasks, dates, % complete, and a task Gantt
- Open a **task** and leave comments; `@Name` writes a fake email log
- Switch fake staff in the top-right (Alex, Sam, Jordan)
- See **open risks and issues** listed under the Home portfolio Gantt

## Requirements

- **Node.js 22+** (uses Node’s built-in `node:sqlite`)
- A terminal and a browser (Safari is the target on Mac)

## Clone and run (from GitHub)

```bash
git clone https://github.com/Chris-GrokTeam/PPMTool.git
cd PPMTool
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first request the app creates `data/ppm.sqlite` and loads the sample Jamaican Geological Survey portfolio.

To wipe and reseed: `npm run reset-db`, then refresh (or restart `npm run dev`).

### Already have the folder on this Mac?

**Finder:** double-click **`Open PPM Tool.command`**. Leave the Terminal window open; Safari opens localhost. If macOS blocks it: right-click → **Open**.

Or from the project folder:

```bash
npm install
npm run dev
```

`./scripts/dev.sh` does the same and prepends a local Node 22 path if you installed Node under `~/.local/`.

## Product notes

See `docs/requirements.md` for what we decided, including learning cuts vs “make it real later.” Snapshot: `docs/summary.md`.
