# PPM Tool

A Workfront-inspired project portfolio tool. Personal learning project.

## What you can do

- See all projects on a **portfolio Gantt** (status, open risks/issues, today line, milestones)
- Open a **project** for tasks, dates, % complete, and a task Gantt
- Open a **task** and leave comments; `@Name` writes a fake email log
- Switch fake staff in the top-right (Alex, Sam, Jordan)
- See **open risks and issues** listed under the Home portfolio Gantt

## Run it

**Easiest (Finder):** double-click **`Open PPM Tool.command`** in this folder. A Terminal window opens (leave it open), then Safari opens [http://localhost:3000](http://localhost:3000). First time only: if macOS blocks it, right-click the file → **Open**. Close the Terminal window to stop the app.

This repo expects **Node.js 22+**.

```bash
npm install
npm run dev
```

Or: `./scripts/dev.sh`

Then open [http://localhost:3000](http://localhost:3000).

To rebuild sample data from scratch: `npm run reset-db` and restart the app.

## Product notes

See `docs/requirements.md` for what we decided, including learning cuts vs “make it real later.”
