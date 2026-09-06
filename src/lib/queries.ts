import "server-only";
import { getDb } from "./db";
import { computeProjectStatus } from "./project-status";
import { applyParentRollup, rollupFromChildren } from "./rollup";
import type {
  Comment,
  EmailLog,
  InboxItem,
  Project,
  ProjectStatus,
  RaidItem,
  RaidSeverity,
  RaidStatus,
  RaidType,
  Task,
  TaskStatus,
  User,
} from "./types";

function asPlain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asPlainList<T>(value: unknown): T[] {
  return JSON.parse(JSON.stringify(value)) as T[];
}

export function syncProjectStatus(projectId: number): ProjectStatus | undefined {
  const row = getDb()
    .prepare("SELECT id, end_date, status FROM projects WHERE id = ?")
    .get(projectId) as { id: number; end_date: string; status: ProjectStatus } | undefined;
  if (!row) return undefined;

  const percentComplete = projectPercentComplete(projectId);
  const openRaid = asPlainList<Pick<RaidItem, "type" | "status" | "severity">>(
    getDb()
      .prepare(
        `SELECT type, status, severity FROM raid_items
         WHERE project_id = ? AND status != 'closed'`
      )
      .all(projectId)
  );
  const next = computeProjectStatus({
    endDate: row.end_date,
    percentComplete,
    openRaid,
  });
  if (next !== row.status) {
    getDb()
      .prepare("UPDATE projects SET status = ? WHERE id = ?")
      .run(next, projectId);
  }
  return next;
}

export function syncAllProjectStatuses() {
  const rows = getDb().prepare("SELECT id FROM projects").all() as { id: number }[];
  for (const row of asPlainList<{ id: number }>(rows)) {
    syncProjectStatus(row.id);
  }
}

export function listUsers(): User[] {
  return asPlainList<User>(
    getDb().prepare("SELECT id, name, role FROM users ORDER BY id").all()
  );
}

export function getUser(id: number): User | undefined {
  const row = getDb()
    .prepare("SELECT id, name, role FROM users WHERE id = ?")
    .get(id);
  return row ? asPlain<User>(row) : undefined;
}

export function listProjects(): Project[] {
  syncAllProjectStatuses();
  return asPlainList<Project>(
    getDb()
    .prepare(
      `SELECT
         p.id, p.name, p.owner_id, u.name AS owner_name, u.role AS owner_role, p.status,
         p.start_date, p.end_date,
         (SELECT COUNT(*) FROM raid_items r WHERE r.project_id = p.id AND r.type = 'risk' AND r.status != 'closed') AS open_risks,
         (SELECT COUNT(*) FROM raid_items r WHERE r.project_id = p.id AND r.type = 'issue' AND r.status != 'closed') AS open_issues
       FROM projects p
       JOIN users u ON u.id = p.owner_id
       ORDER BY p.start_date`
    )
    .all()
  );
}

export function getProject(id: number): Project | undefined {
  syncProjectStatus(id);
  const row = getDb()
    .prepare(
      `SELECT
         p.id, p.name, p.owner_id, u.name AS owner_name, u.role AS owner_role, p.status,
         p.start_date, p.end_date,
         (SELECT COUNT(*) FROM raid_items r WHERE r.project_id = p.id AND r.type = 'risk' AND r.status != 'closed') AS open_risks,
         (SELECT COUNT(*) FROM raid_items r WHERE r.project_id = p.id AND r.type = 'issue' AND r.status != 'closed') AS open_issues
       FROM projects p
       JOIN users u ON u.id = p.owner_id
       WHERE p.id = ?`
    )
    .get(id);
  return row ? asPlain<Project>(row) : undefined;
}

export function listTasks(projectId: number): Task[] {
  const rows = asPlainList<Task>(
    getDb()
    .prepare(
      `SELECT t.id, t.project_id, t.name, t.assignee_id, u.name AS assignee_name,
              u.role AS assignee_role,
              t.start_date, t.end_date, t.percent_complete, t.status, t.is_milestone,
              t.parent_id, t.sort_order
       FROM tasks t
       JOIN users u ON u.id = t.assignee_id
       WHERE t.project_id = ?
       ORDER BY t.sort_order, t.id`
    )
    .all(projectId)
  );
  return applyParentRollup(rows);
}

export function getTask(id: number): Task | undefined {
  const row = getDb()
    .prepare(
      `SELECT t.id, t.project_id, t.name, t.assignee_id, u.name AS assignee_name,
              u.role AS assignee_role,
              t.start_date, t.end_date, t.percent_complete, t.status, t.is_milestone,
              t.parent_id, t.sort_order
       FROM tasks t
       JOIN users u ON u.id = t.assignee_id
       WHERE t.id = ?`
    )
    .get(id);
  if (!row) return undefined;
  const task = asPlain<Task>(row);
  const rolled = rollupFromChildren(listChildSpans(task.id));
  return rolled ? { ...task, ...rolled } : task;
}

function listChildSpans(parentId: number) {
  return asPlainList<{
    start_date: string;
    end_date: string;
    percent_complete: number;
    status: TaskStatus;
  }>(
    getDb()
      .prepare(
        `SELECT start_date, end_date, percent_complete, status
         FROM tasks WHERE parent_id = ? ORDER BY sort_order, id`
      )
      .all(parentId)
  );
}

export function rollupParentFromChildren(parentId: number) {
  const rolled = rollupFromChildren(listChildSpans(parentId));
  if (!rolled) return;
  getDb()
    .prepare(
      `UPDATE tasks SET start_date = ?, end_date = ?, percent_complete = ?,
        status = ?, is_milestone = 0 WHERE id = ?`
    )
    .run(
      rolled.start_date,
      rolled.end_date,
      rolled.percent_complete,
      rolled.status,
      parentId
    );
}

export function listComments(taskId: number): Comment[] {
  return asPlainList<Comment>(
    getDb()
    .prepare(
      `SELECT c.id, c.task_id, c.raid_item_id, c.author_id, u.name AS author_name, u.role AS author_role,
              c.body, c.created_at, c.updated_at
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.task_id = ?
       ORDER BY c.created_at DESC`
    )
    .all(taskId)
  );
}

export function getComment(id: number): Comment | undefined {
  const row = getDb()
    .prepare(
      `SELECT c.id, c.task_id, c.raid_item_id, c.author_id, u.name AS author_name, u.role AS author_role,
              c.body, c.created_at, c.updated_at
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.id = ?`
    )
    .get(id);
  return row ? asPlain<Comment>(row) : undefined;
}

export function listEmailLogForTask(taskId: number): EmailLog[] {
  return asPlainList<EmailLog>(
    getDb()
    .prepare(
      `SELECT e.id, e.comment_id, e.to_user_id, u.name AS to_user_name, u.role AS to_user_role, e.subject, e.created_at, e.read_at
       FROM email_log e
       JOIN users u ON u.id = e.to_user_id
       JOIN comments c ON c.id = e.comment_id
       WHERE c.task_id = ?
       ORDER BY e.created_at DESC`
    )
    .all(taskId)
  );
}

export function listRaidForProject(projectId: number): RaidItem[] {
  return asPlainList<RaidItem>(
    getDb()
      .prepare(
        `SELECT r.id, r.project_id, p.name AS project_name, r.type, r.title,
                r.description, r.assigned_id, u.name AS assigned_name, u.role AS assigned_role, r.status,
                r.due_date, r.severity
         FROM raid_items r
         JOIN projects p ON p.id = r.project_id
         JOIN users u ON u.id = r.assigned_id
         WHERE r.project_id = ?
         ORDER BY CASE r.status WHEN 'closed' THEN 1 ELSE 0 END,
                  CASE r.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
                  r.due_date,
                  CASE r.type WHEN 'risk' THEN 0 ELSE 1 END,
                  r.id`
      )
      .all(projectId)
  );
}

export function listOpenRaid(filters: {
  projectId?: number;
  status?: ProjectStatus | "all";
}): RaidItem[] {
  const clauses: string[] = [`r.status != 'closed'`];
  const params: (string | number)[] = [];
  if (filters.projectId) {
    clauses.push("r.project_id = ?");
    params.push(filters.projectId);
  }
  if (filters.status && filters.status !== "all") {
    clauses.push("p.status = ?");
    params.push(filters.status);
  }
  return asPlainList<RaidItem>(
    getDb()
    .prepare(
      `SELECT r.id, r.project_id, p.name AS project_name, r.type, r.title,
                r.description, r.assigned_id, u.name AS assigned_name, u.role AS assigned_role, r.status,
                r.due_date, r.severity
       FROM raid_items r
       JOIN projects p ON p.id = r.project_id
       JOIN users u ON u.id = r.assigned_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY CASE r.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
              r.due_date,
              p.name,
              CASE r.type WHEN 'risk' THEN 0 ELSE 1 END,
              r.id`
    )
    .all(...params)
  );
}

export function listFilteredProjects(filters: {
  projectId?: number;
  status?: ProjectStatus | "all";
}): Project[] {
  return listProjects().filter((project) => {
    if (filters.projectId && project.id !== filters.projectId) return false;
    if (filters.status && filters.status !== "all" && project.status !== filters.status) {
      return false;
    }
    return true;
  });
}

export function updateTaskFields(input: {
  id: number;
  name: string;
  assigneeId: number;
  startDate: string;
  endDate: string;
  percentComplete: number;
  status: TaskStatus;
  isMilestone: number;
}) {
  getDb()
    .prepare(
      `UPDATE tasks SET name = ?, assignee_id = ?, start_date = ?, end_date = ?,
        percent_complete = ?, status = ?, is_milestone = ? WHERE id = ?`
    )
    .run(
      input.name,
      input.assigneeId,
      input.startDate,
      input.endDate,
      input.percentComplete,
      input.status,
      input.isMilestone,
      input.id
    );
}

export function insertTask(input: {
  projectId: number;
  name: string;
  assigneeId: number;
  startDate: string;
  endDate: string;
  percentComplete: number;
  status: TaskStatus;
  isMilestone: number;
  parentId: number | null;
  sortOrder: number;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO tasks (
         project_id, name, assignee_id, start_date, end_date,
         percent_complete, status, is_milestone, parent_id, sort_order
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.projectId,
      input.name,
      input.assigneeId,
      input.startDate,
      input.endDate,
      input.percentComplete,
      input.status,
      input.isMilestone,
      input.parentId,
      input.sortOrder
    );
  return Number(result.lastInsertRowid);
}

export function nextSortOrder(projectId: number): number {
  const row = getDb()
    .prepare("SELECT MAX(sort_order) AS m FROM tasks WHERE project_id = ?")
    .get(projectId) as { m: number | null } | undefined;
  return (row?.m ?? 0) + 1;
}

export function applyTaskOutline(
  projectId: number,
  rows: { id: number; parent_id: number | null }[]
) {
  const existing = listTasks(projectId);
  if (rows.length !== existing.length) {
    throw new Error("Outline is missing tasks");
  }
  const ids = new Set(existing.map((task) => task.id));
  if (rows.some((row) => !ids.has(row.id))) {
    throw new Error("Outline has unknown tasks");
  }
  const db = getDb();
  db.exec("BEGIN");
  try {
    const stmt = db.prepare(
      "UPDATE tasks SET parent_id = ?, sort_order = ? WHERE id = ? AND project_id = ?"
    );
    rows.forEach((row, index) => {
      stmt.run(row.parent_id, index + 1, row.id, projectId);
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function listCommentsForRaid(raidItemId: number): Comment[] {
  return asPlainList<Comment>(
    getDb()
      .prepare(
        `SELECT c.id, c.task_id, c.raid_item_id, c.author_id, u.name AS author_name, u.role AS author_role,
                c.body, c.created_at, c.updated_at
         FROM comments c
         JOIN users u ON u.id = c.author_id
         WHERE c.raid_item_id = ?
         ORDER BY c.created_at DESC`
      )
      .all(raidItemId)
  );
}

export function listEmailLogForRaid(raidItemId: number): EmailLog[] {
  return asPlainList<EmailLog>(
    getDb()
      .prepare(
        `SELECT e.id, e.comment_id, e.to_user_id, u.name AS to_user_name, u.role AS to_user_role, e.subject, e.created_at, e.read_at
         FROM email_log e
         JOIN users u ON u.id = e.to_user_id
         JOIN comments c ON c.id = e.comment_id
         WHERE c.raid_item_id = ?
         ORDER BY e.created_at DESC`
      )
      .all(raidItemId)
  );
}

export function getRaidItem(id: number): RaidItem | undefined {
  const row = getDb()
    .prepare(
      `SELECT r.id, r.project_id, p.name AS project_name, r.type, r.title,
                r.description, r.assigned_id, u.name AS assigned_name, u.role AS assigned_role, r.status,
                r.due_date, r.severity
       FROM raid_items r
       JOIN projects p ON p.id = r.project_id
       JOIN users u ON u.id = r.assigned_id
       WHERE r.id = ?`
    )
    .get(id);
  return row ? asPlain<RaidItem>(row) : undefined;
}

export function insertRaidItem(input: {
  projectId: number;
  type: RaidType;
  title: string;
  description: string;
  assignedId: number;
  dueDate: string;
  severity: RaidSeverity;
}): number {
  const result = getDb()
    .prepare(
      "INSERT INTO raid_items (project_id, type, title, description, assigned_id, status, due_date, severity) VALUES (?, ?, ?, ?, ?, 'open', ?, ?)"
    )
    .run(
      input.projectId,
      input.type,
      input.title,
      input.description,
      input.assignedId,
      input.dueDate,
      input.severity
    );
  return Number(result.lastInsertRowid);
}

export function updateRaidItem(input: {
  id: number;
  title: string;
  description: string;
  status: RaidStatus;
  dueDate: string;
  severity: RaidSeverity;
}) {
  getDb()
    .prepare(
      "UPDATE raid_items SET title = ?, description = ?, status = ?, due_date = ?, severity = ? WHERE id = ?"
    )
    .run(input.title, input.description, input.status, input.dueDate, input.severity, input.id);
}

export function insertComment(taskId: number, authorId: number, body: string): number {
  const now = new Date().toISOString();
  const result = getDb()
    .prepare(
      "INSERT INTO comments (task_id, raid_item_id, author_id, body, created_at, updated_at) VALUES (?, NULL, ?, ?, ?, ?)"
    )
    .run(taskId, authorId, body, now, now);
  return Number(result.lastInsertRowid);
}

export function insertRaidComment(raidItemId: number, authorId: number, body: string): number {
  const now = new Date().toISOString();
  const result = getDb()
    .prepare(
      "INSERT INTO comments (task_id, raid_item_id, author_id, body, created_at, updated_at) VALUES (NULL, ?, ?, ?, ?, ?)"
    )
    .run(raidItemId, authorId, body, now, now);
  return Number(result.lastInsertRowid);
}

export function updateCommentBody(commentId: number, body: string) {
  const now = new Date().toISOString();
  getDb()
    .prepare("UPDATE comments SET body = ?, updated_at = ? WHERE id = ?")
    .run(body, now, commentId);
}

export function insertEmailLog(commentId: number, toUserId: number, subject: string) {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      "INSERT INTO email_log (comment_id, to_user_id, subject, created_at) VALUES (?, ?, ?, ?)"
    )
    .run(commentId, toUserId, subject, now);
}

export function mentionedUserIdsAlreadyEmailed(commentId: number): number[] {
  const rows = getDb()
    .prepare("SELECT to_user_id FROM email_log WHERE comment_id = ?")
    .all(commentId) as { to_user_id: number }[];
  return asPlainList<{ to_user_id: number }>(rows).map((row) => row.to_user_id);
}

export function projectPercentComplete(projectId: number): number {
  const tasks = listTasks(projectId);
  const roots = tasks.filter((task) => task.parent_id == null);
  const rolled = rollupFromChildren(roots);
  return rolled?.percent_complete ?? 0;
}

export function listInboxForUser(userId: number): InboxItem[] {
  return asPlainList<InboxItem>(
    getDb()
      .prepare(
        `SELECT
           e.id, e.comment_id, e.subject, e.created_at, e.read_at,
           c.body, c.author_id, a.name AS author_name, a.role AS author_role,
           c.task_id, c.raid_item_id,
           COALESCE(t.project_id, r.project_id) AS project_id,
           COALESCE(p_task.name, p_raid.name) AS project_name,
           COALESCE(t.name, r.title) AS target_label
         FROM email_log e
         JOIN comments c ON c.id = e.comment_id
         JOIN users a ON a.id = c.author_id
         LEFT JOIN tasks t ON t.id = c.task_id
         LEFT JOIN projects p_task ON p_task.id = t.project_id
         LEFT JOIN raid_items r ON r.id = c.raid_item_id
         LEFT JOIN projects p_raid ON p_raid.id = r.project_id
         WHERE e.to_user_id = ?
         ORDER BY e.created_at DESC, e.id DESC`
      )
      .all(userId)
  );
}

export function countUnreadInbox(userId: number): number {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM email_log WHERE to_user_id = ? AND read_at IS NULL"
    )
    .get(userId) as { n: number } | undefined;
  return Number(row?.n ?? 0);
}

export function markInboxItemRead(id: number, userId: number) {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      "UPDATE email_log SET read_at = ? WHERE id = ? AND to_user_id = ? AND read_at IS NULL"
    )
    .run(now, id, userId);
}

export function markAllInboxRead(userId: number) {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      "UPDATE email_log SET read_at = ? WHERE to_user_id = ? AND read_at IS NULL"
    )
    .run(now, userId);
}
