import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seed } from "./seed";

const dbPath = path.join(process.cwd(), "data", "ppm.sqlite");
export const SCHEMA_VERSION = 9;

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (!db) {
    const isNew = !fs.existsSync(dbPath);
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA foreign_keys = ON;");
    if (isNew) {
      migrate(db);
      seed(db);
      setVersion(db);
    }
  }
  if (readVersion(db) !== SCHEMA_VERSION) {
    db.close();
    fs.unlinkSync(dbPath);
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA foreign_keys = ON;");
    migrate(db);
    seed(db);
    setVersion(db);
  }
  return db;
}

function readVersion(database: DatabaseSync): number {
  try {
    const row = database
      .prepare("SELECT value FROM meta WHERE key = 'schema_version'")
      .get() as { value: string } | undefined;
    return row ? Number(row.value) : 0;
  } catch {
    return 0;
  }
}

function setVersion(database: DatabaseSync) {
  database
    .prepare("INSERT INTO meta (key, value) VALUES ('schema_version', ?)")
    .run(String(SCHEMA_VERSION));
}

function migrate(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL
    );

    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      name TEXT NOT NULL,
      assignee_id INTEGER NOT NULL REFERENCES users(id),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      percent_complete INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      is_milestone INTEGER NOT NULL DEFAULT 0,
      parent_id INTEGER REFERENCES tasks(id),
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE raid_items (
      id INTEGER PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      assigned_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL,
      due_date TEXT NOT NULL,
      severity TEXT NOT NULL
    );

    CREATE TABLE comments (
      id INTEGER PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id),
      raid_item_id INTEGER REFERENCES raid_items(id),
      author_id INTEGER NOT NULL REFERENCES users(id),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE email_log (
      id INTEGER PRIMARY KEY,
      comment_id INTEGER NOT NULL REFERENCES comments(id),
      to_user_id INTEGER NOT NULL REFERENCES users(id),
      subject TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_at TEXT
    );
  `);
}
