export type ProjectStatus = "on_track" | "at_risk" | "off_track";
export type TaskStatus = "complete" | "in_progress" | "not_started" | "milestone";
export type RaidType = "risk" | "issue";

export type User = {
  id: number;
  name: string;
  role: string;
};

export type Project = {
  id: number;
  name: string;
  owner_id: number;
  owner_name: string;
  owner_role: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  open_risks: number;
  open_issues: number;
};

export type Task = {
  id: number;
  project_id: number;
  name: string;
  assignee_id: number;
  assignee_name: string;
  assignee_role: string;
  start_date: string;
  end_date: string;
  percent_complete: number;
  status: TaskStatus;
  is_milestone: number;
  parent_id: number | null;
  sort_order: number;
};

export type Comment = {
  id: number;
  task_id: number | null;
  raid_item_id: number | null;
  author_id: number;
  author_name: string;
  author_role: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type EmailLog = {
  id: number;
  comment_id: number;
  to_user_id: number;
  to_user_name: string;
  to_user_role: string;
  subject: string;
  created_at: string;
  read_at: string | null;
};

/** Inbox row: mention notification with deep-link targets. */
export type InboxItem = {
  id: number;
  comment_id: number;
  subject: string;
  created_at: string;
  read_at: string | null;
  body: string;
  author_id: number;
  author_name: string;
  author_role: string;
  task_id: number | null;
  raid_item_id: number | null;
  project_id: number;
  project_name: string;
  target_label: string;
};

export type RaidItem = {
  id: number;
  project_id: number;
  project_name: string;
  type: RaidType;
  title: string;
  description: string;
  assigned_id: number;
  assigned_name: string;
  assigned_role: string;
  status: RaidStatus;
  due_date: string;
  severity: RaidSeverity;
};

export type RaidStatus = "open" | "in_progress" | "escalated" | "closed";
export type RaidSeverity = "low" | "medium" | "high" | "critical";
